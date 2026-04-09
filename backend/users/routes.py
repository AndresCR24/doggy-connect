import boto3
import uuid
import os
from fastapi import APIRouter, HTTPException
from botocore.exceptions import ClientError
from models import UserCreate, UserResponse

# Detectamos si estamos en AWS o en Local
IS_OFFLINE = os.environ.get('IS_OFFLINE')

if IS_OFFLINE:
    # Si es local, usamos Docker
    dynamodb = boto3.resource(
        'dynamodb',
        region_name='us-east-1',
        endpoint_url='http://localhost:8000',
        aws_access_key_id='local',
        aws_secret_access_key='local'
    )
else:
    # Si estamos en la nube, NO pasamos endpoint_url (AWS se encarga)
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

table = dynamodb.Table(os.environ.get('USERS_TABLE'))
router = APIRouter()

# ==========================================
# C: CREATE (Crear un usuario)
# ==========================================
@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate):
    nuevo_id = str(uuid.uuid4())
    
    item = {
        "user_id": nuevo_id,
        "nombre": user.nombre,
        "email": user.email,
        "role": user.role,
        "telefono": user.telefono,
        "ciudad": user.ciudad
    }

    # Eliminamos los campos None para no guardar valores nulos en DynamoDB
    item = {k: v for k, v in item.items() if v is not None}

    try:
        table.put_item(Item=item)

        respuesta = item.copy()
        respuesta["id"] = nuevo_id
        return respuesta
        
    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error guardando en DynamoDB")

# ==========================================
# R: READ (Leer un usuario por ID)
# ==========================================
@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    try:
        response = table.get_item(Key={"user_id": user_id})
        item = response.get("Item")
        
        if not item:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        # Mapeo para Pydantic
        item["id"] = item["user_id"]
        return item
        
    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")

# ==========================================
# U: UPDATE (Actualizar un usuario)
# ==========================================
@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user: UserCreate):
    try:
        response = table.update_item(
            Key={"user_id": user_id},
            UpdateExpression="SET nombre=:n, email=:e, #r=:r, telefono=:t, ciudad=:c",
            ExpressionAttributeNames={"#r": "role"},
            ExpressionAttributeValues={
                ":n": user.nombre,
                ":e": user.email,
                ":r": user.role,
                ":t": user.telefono,
                ":c": user.ciudad
            },
            ConditionExpression="attribute_exists(user_id)",
            ReturnValues="ALL_NEW"
        )
        item = response.get("Attributes")

        item["id"] = item["user_id"]
        return item

    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error actualizando en DynamoDB")

# ==========================================
# D: DELETE (Eliminar un usuario)
# ==========================================
@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: str):
    try:
        # Verificamos si existe primero
        response = table.get_item(Key={"user_id": user_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        table.delete_item(Key={"user_id": user_id})
        return # 204 No devuelve body
        
    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error eliminando en DynamoDB")