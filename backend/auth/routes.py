import os
import hmac
import hashlib
import base64
import boto3
from fastapi import APIRouter, HTTPException
from botocore.exceptions import ClientError

from models import (
    RegisterRequest,
    LoginRequest,
    ConfirmRequest,
    ResendCodeRequest,
    ForgotPasswordRequest,
    ConfirmForgotPasswordRequest,
    ChangePasswordRequest,
    RefreshTokenRequest,
    TokenResponse,
    AuthUserResponse,
)

# ─── Configuración Cognito ───────────────────────────────────────────────────

CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("COGNITO_CLIENT_SECRET", "")
USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "")
REGION = os.environ.get("AWS_REGION", "us-east-1")

cognito = boto3.client("cognito-idp", region_name=REGION)
router = APIRouter()


def _secret_hash(username: str) -> str:
    """
    Calcula el SECRET_HASH requerido por Cognito cuando el App Client
    tiene un client secret configurado.
    """
    message = username + CLIENT_ID
    dig = hmac.new(
        CLIENT_SECRET.encode("utf-8"),
        msg=message.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()
    return base64.b64encode(dig).decode()


def _cognito_kwargs(username: str) -> dict:
    """Devuelve el dict con SecretHash sólo si CLIENT_SECRET está definido."""
    if CLIENT_SECRET:
        return {"SecretHash": _secret_hash(username)}
    return {}


# ─── Registro ────────────────────────────────────────────────────────────────

@router.post("/auth/register", status_code=201)
def register(body: RegisterRequest):
    """
    Registra un nuevo usuario en el User Pool de Cognito.
    Cognito enviará un email de verificación con un código de 6 dígitos.
    """
    try:
        cognito.sign_up(
            ClientId=CLIENT_ID,
            Username=body.email,
            Password=body.password,
            UserAttributes=[
                {"Name": "email", "Value": body.email},
                {"Name": "name", "Value": body.nombre},
            ],
            **_cognito_kwargs(body.email),
        )
        return {
            "message": "Registro exitoso. Revisa tu email para confirmar la cuenta.",
            "email": body.email,
        }
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code == "UsernameExistsException":
            raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo.")
        if code == "InvalidPasswordException":
            raise HTTPException(status_code=400, detail="La contraseña no cumple los requisitos de seguridad.")
        raise HTTPException(status_code=500, detail=e.response["Error"]["Message"])


# ─── Confirmar cuenta ─────────────────────────────────────────────────────────

@router.post("/auth/confirm")
def confirm(body: ConfirmRequest):
    """Confirma la cuenta usando el código enviado por email."""
    try:
        cognito.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=body.email,
            ConfirmationCode=body.code,
            **_cognito_kwargs(body.email),
        )
        return {"message": "Cuenta confirmada. Ya puedes iniciar sesión."}
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code == "CodeMismatchException":
            raise HTTPException(status_code=400, detail="Código incorrecto.")
        if code == "ExpiredCodeException":
            raise HTTPException(status_code=400, detail="El código ha expirado. Solicita uno nuevo.")
        if code == "NotAuthorizedException":
            raise HTTPException(status_code=400, detail="La cuenta ya estaba confirmada.")
        raise HTTPException(status_code=500, detail=e.response["Error"]["Message"])


# ─── Reenviar código de confirmación ─────────────────────────────────────────

@router.post("/auth/resend-code")
def resend_code(body: ResendCodeRequest):
    """Reenvía el email de confirmación de cuenta."""
    try:
        cognito.resend_confirmation_code(
            ClientId=CLIENT_ID,
            Username=body.email,
            **_cognito_kwargs(body.email),
        )
        return {"message": "Código reenviado a tu correo."}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=e.response["Error"]["Message"])


# ─── Login ────────────────────────────────────────────────────────────────────

@router.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest):
    """
    Autentica al usuario contra Cognito (USER_PASSWORD_AUTH).
    Devuelve AccessToken, IdToken y RefreshToken.
    """
    try:
        params = {
            "AuthFlow": "USER_PASSWORD_AUTH",
            "ClientId": CLIENT_ID,
            "AuthParameters": {
                "USERNAME": body.email,
                "PASSWORD": body.password,
                **(_cognito_kwargs(body.email) if CLIENT_SECRET else {}),
            },
        }
        if CLIENT_SECRET:
            params["AuthParameters"]["SECRET_HASH"] = _secret_hash(body.email)

        resp = cognito.initiate_auth(**params)
        result = resp["AuthenticationResult"]
        return TokenResponse(
            access_token=result["AccessToken"],
            id_token=result["IdToken"],
            refresh_token=result.get("RefreshToken"),
            expires_in=result.get("ExpiresIn", 3600),
        )
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code in ("NotAuthorizedException", "UserNotFoundException"):
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")
        if code == "UserNotConfirmedException":
            raise HTTPException(status_code=403, detail="Debes confirmar tu cuenta primero.")
        raise HTTPException(status_code=500, detail=e.response["Error"]["Message"])


# ─── Refrescar tokens ─────────────────────────────────────────────────────────

@router.post("/auth/refresh", response_model=TokenResponse)
def refresh_token(body: RefreshTokenRequest):
    """Genera nuevos AccessToken e IdToken a partir del RefreshToken."""
    try:
        auth_params = {"REFRESH_TOKEN": body.refresh_token}
        if CLIENT_SECRET:
            # Para REFRESH_TOKEN_AUTH el username no es necesario en el hash;
            # Cognito acepta el hash construido sólo con el CLIENT_ID como username.
            auth_params["SECRET_HASH"] = _secret_hash(CLIENT_ID)

        resp = cognito.initiate_auth(
            AuthFlow="REFRESH_TOKEN_AUTH",
            ClientId=CLIENT_ID,
            AuthParameters=auth_params,
        )
        result = resp["AuthenticationResult"]
        return TokenResponse(
            access_token=result["AccessToken"],
            id_token=result["IdToken"],
            expires_in=result.get("ExpiresIn", 3600),
        )
    except ClientError as e:
        raise HTTPException(status_code=401, detail="Token de refresco inválido o expirado.")


# ─── Datos del usuario autenticado ───────────────────────────────────────────

@router.get("/auth/me", response_model=AuthUserResponse)
def get_me(access_token: str):
    """
    Devuelve los atributos del usuario autenticado.
    Recibe el AccessToken como query parameter.
    """
    try:
        resp = cognito.get_user(AccessToken=access_token)
        attrs = {a["Name"]: a["Value"] for a in resp["UserAttributes"]}
        return AuthUserResponse(
            sub=attrs.get("sub", ""),
            email=attrs.get("email", ""),
            nombre=attrs.get("name"),
            email_verified=attrs.get("email_verified", "false").lower() == "true",
        )
    except ClientError as e:
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")


# ─── Cerrar sesión (revocar tokens) ──────────────────────────────────────────

@router.post("/auth/logout")
def logout(access_token: str):
    """Revoca todos los tokens activos del usuario (global sign-out)."""
    try:
        cognito.global_sign_out(AccessToken=access_token)
        return {"message": "Sesión cerrada correctamente."}
    except ClientError as e:
        raise HTTPException(status_code=401, detail="Token inválido o ya expirado.")


# ─── Cambiar contraseña ───────────────────────────────────────────────────────

@router.post("/auth/change-password")
def change_password(body: ChangePasswordRequest):
    """Cambia la contraseña del usuario autenticado."""
    try:
        cognito.change_password(
            AccessToken=body.access_token,
            PreviousPassword=body.old_password,
            ProposedPassword=body.new_password,
        )
        return {"message": "Contraseña actualizada correctamente."}
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code == "NotAuthorizedException":
            raise HTTPException(status_code=401, detail="La contraseña actual es incorrecta.")
        if code == "InvalidPasswordException":
            raise HTTPException(status_code=400, detail="La nueva contraseña no cumple los requisitos.")
        raise HTTPException(status_code=500, detail=e.response["Error"]["Message"])


# ─── Olvidé mi contraseña ─────────────────────────────────────────────────────

@router.post("/auth/forgot-password")
def forgot_password(body: ForgotPasswordRequest):
    """Inicia el flujo de recuperación: Cognito envía un código al email."""
    try:
        cognito.forgot_password(
            ClientId=CLIENT_ID,
            Username=body.email,
            **_cognito_kwargs(body.email),
        )
        return {"message": "Se ha enviado un código de recuperación a tu correo."}
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code == "UserNotFoundException":
            # Por seguridad, no revelar si el email existe
            return {"message": "Si existe una cuenta con ese correo, recibirás un código."}
        raise HTTPException(status_code=500, detail=e.response["Error"]["Message"])


# ─── Confirmar nueva contraseña ───────────────────────────────────────────────

@router.post("/auth/confirm-forgot-password")
def confirm_forgot_password(body: ConfirmForgotPasswordRequest):
    """Confirma la nueva contraseña con el código recibido por email."""
    try:
        cognito.confirm_forgot_password(
            ClientId=CLIENT_ID,
            Username=body.email,
            ConfirmationCode=body.code,
            Password=body.new_password,
            **_cognito_kwargs(body.email),
        )
        return {"message": "Contraseña restablecida correctamente. Ya puedes iniciar sesión."}
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code == "CodeMismatchException":
            raise HTTPException(status_code=400, detail="Código incorrecto.")
        if code == "ExpiredCodeException":
            raise HTTPException(status_code=400, detail="El código ha expirado.")
        if code == "InvalidPasswordException":
            raise HTTPException(status_code=400, detail="La contraseña no cumple los requisitos de seguridad.")
        raise HTTPException(status_code=500, detail=e.response["Error"]["Message"])
