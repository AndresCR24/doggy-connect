import boto3
import uuid
import os
from boto3.dynamodb.conditions import Attr
from fastapi import APIRouter, HTTPException
from botocore.exceptions import ClientError
from models import WalkerCreate, WalkerResponse

# Detectamos si estamos en AWS o en Local
IS_OFFLINE = os.environ.get('IS_OFFLINE')

if IS_OFFLINE:
    dynamodb = boto3.resource(
        'dynamodb',
        region_name='us-east-1',
        endpoint_url='http://localhost:8000',
        aws_access_key_id='local',
        aws_secret_access_key='local'
    )
else:
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

table = dynamodb.Table(os.environ.get('WALKERS_TABLE'))
router = APIRouter()

# ==========================================
# C: CREATE (Registrar un paseador)
# ==========================================
@router.post("/walkers", response_model=WalkerResponse, status_code=201)
def create_walker(walker: WalkerCreate):
    nuevo_id = str(uuid.uuid4())

    item = {
        "walker_id": nuevo_id,
        "user_id": walker.user_id,
        "experiencia_anios": walker.experiencia_anios,
        "precio_por_hora": str(walker.precio_por_hora),  # DynamoDB no soporta float nativo
        "radio_servicio_km": walker.radio_servicio_km,
        "verificado": walker.verificado,
        "estado_verificacion": walker.estado_verificacion,
        "rating": "0.0",
        "completed_walks": 0
    }

    # Eliminamos campos None
    item = {k: v for k, v in item.items() if v is not None}

    try:
        table.put_item(Item=item)

        respuesta = item.copy()
        respuesta["id"] = nuevo_id
        respuesta["precio_por_hora"] = float(respuesta["precio_por_hora"])
        respuesta["rating"] = float(respuesta["rating"])
        return respuesta

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error guardando en DynamoDB")

# ==========================================
# R: READ (Obtener paseadores por user_id)
# ==========================================
@router.get("/walkers/user/{user_id}", response_model=list[WalkerResponse])
def get_walkers_by_user(user_id: str):
    try:
        response = table.scan(
            FilterExpression=Attr('user_id').eq(user_id)
        )
        items = response.get("Items", [])

        for item in items:
            item["id"] = item["walker_id"]
            item["precio_por_hora"] = float(item["precio_por_hora"])
            item["rating"] = float(item.get("rating", "0.0"))

        return items

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")

# ==========================================
# R: READ (Obtener un paseador por ID)
# ==========================================
@router.get("/walkers/{walker_id}", response_model=WalkerResponse)
def get_walker(walker_id: str):
    try:
        response = table.get_item(Key={"walker_id": walker_id})
        item = response.get("Item")

        if not item:
            raise HTTPException(status_code=404, detail="Paseador no encontrado")

        item["id"] = item["walker_id"]
        item["precio_por_hora"] = float(item["precio_por_hora"])
        item["rating"] = float(item.get("rating", "0.0"))
        return item

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")

# ==========================================
# U: UPDATE (Actualizar un paseador)
# ==========================================
@router.put("/walkers/{walker_id}", response_model=WalkerResponse)
def update_walker(walker_id: str, walker: WalkerCreate):
    try:
        response = table.update_item(
            Key={"walker_id": walker_id},
            UpdateExpression=(
                "SET user_id=:u, experiencia_anios=:e, precio_por_hora=:p, "
                "radio_servicio_km=:r, verificado=:v, estado_verificacion=:s"
            ),
            ExpressionAttributeValues={
                ":u": walker.user_id,
                ":e": walker.experiencia_anios,
                ":p": str(walker.precio_por_hora),
                ":r": walker.radio_servicio_km,
                ":v": walker.verificado,
                ":s": walker.estado_verificacion
            },
            ConditionExpression="attribute_exists(walker_id)",
            ReturnValues="ALL_NEW"
        )
        item = response.get("Attributes")

        item["id"] = item["walker_id"]
        item["precio_por_hora"] = float(item["precio_por_hora"])
        item["rating"] = float(item.get("rating", "0.0"))
        return item

    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=404, detail="Paseador no encontrado")
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error actualizando en DynamoDB")

# ==========================================
# D: DELETE (Eliminar un paseador)
# ==========================================
@router.delete("/walkers/{walker_id}", status_code=204)
def delete_walker(walker_id: str):
    try:
        response = table.get_item(Key={"walker_id": walker_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Paseador no encontrado")

        table.delete_item(Key={"walker_id": walker_id})
        return

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error eliminando en DynamoDB")
