import boto3
import uuid
import os
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr

from models import PresignRequest, PresignResponse, MediaItem, DeleteRequest

IS_OFFLINE = os.environ.get("IS_OFFLINE")
REGION = os.environ.get("AWS_REGION", "us-east-1")
BUCKET_NAME = os.environ.get("MEDIA_BUCKET", "doggy-connect-media-dev")
MEDIA_TABLE = os.environ.get("MEDIA_TABLE", "doggy-connect-media-dev-media")

# ─── Clientes AWS ─────────────────────────────────────────────────────────────

if IS_OFFLINE:
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=REGION,
        endpoint_url="http://localhost:8000",
        aws_access_key_id="local",
        aws_secret_access_key="local",
    )
    s3 = boto3.client(
        "s3",
        region_name=REGION,
        endpoint_url="http://localhost:9000",
        aws_access_key_id="local",
        aws_secret_access_key="local",
    )
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    s3 = boto3.client("s3", region_name=REGION)

table = dynamodb.Table(MEDIA_TABLE)
router = APIRouter()


# ==========================================
# C: PRESIGN – Genera URL de subida a S3
# ==========================================
@router.post("/media/presign", response_model=PresignResponse, status_code=201)
def generate_presign(req: PresignRequest):
    # Validar content_type
    ALLOWED = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if req.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="content_type no permitido. Usa jpeg, png, webp o gif.")

    media_id = str(uuid.uuid4())
    ext = req.file_name.rsplit(".", 1)[-1].lower() if "." in req.file_name else "jpg"
    key = f"{req.entity_type}/{req.entity_id}/{media_id}.{ext}"
    created_at = datetime.now(timezone.utc).isoformat()

    # URL pública final
    public_url = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{key}"

    try:
        # Presigned URL para PUT directo desde el browser (expira en 5 min)
        upload_url = s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": key,
                "ContentType": req.content_type,
            },
            ExpiresIn=300,
        )
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error generando URL: {e}")

    # Guardar metadatos en DynamoDB
    try:
        table.put_item(Item={
            "media_id": media_id,
            "entity_type": req.entity_type,
            "entity_id": req.entity_id,
            "key": key,
            "public_url": public_url,
            "created_at": created_at,
        })
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error guardando metadatos: {e}")

    return PresignResponse(
        media_id=media_id,
        upload_url=upload_url,
        public_url=public_url,
        key=key,
    )


# ==========================================
# R: LIST – Listar media de una entidad
# ==========================================
@router.get("/media/{entity_type}/{entity_id}", response_model=list[MediaItem])
def list_media(entity_type: str, entity_id: str):
    try:
        response = table.scan(
            FilterExpression=Attr("entity_type").eq(entity_type) & Attr("entity_id").eq(entity_id)
        )
        items = response.get("Items", [])
        while "LastEvaluatedKey" in response:
            response = table.scan(
                FilterExpression=Attr("entity_type").eq(entity_type) & Attr("entity_id").eq(entity_id),
                ExclusiveStartKey=response["LastEvaluatedKey"],
            )
            items.extend(response.get("Items", []))

        for item in items:
            item["id"] = item["media_id"]

        # Ordenar por fecha descendente
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return items

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error consultando DynamoDB: {e}")


# ==========================================
# D: DELETE – Eliminar un archivo de S3 y su metadato
# ==========================================
@router.delete("/media/item/{media_id}", status_code=200)
def delete_media(media_id: str):
    # Obtener metadato
    try:
        result = table.get_item(Key={"media_id": media_id})
        item = result.get("Item")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error consultando DynamoDB: {e}")

    if not item:
        raise HTTPException(status_code=404, detail="Media no encontrada")

    # Eliminar de S3
    try:
        s3.delete_object(Bucket=BUCKET_NAME, Key=item["key"])
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error eliminando de S3: {e}")

    # Eliminar metadato
    try:
        table.delete_item(Key={"media_id": media_id})
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error eliminando metadato: {e}")

    return {"deleted": media_id}
