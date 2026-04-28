import boto3
import uuid
import os
from boto3.dynamodb.conditions import Attr
from fastapi import APIRouter, HTTPException
from botocore.exceptions import ClientError
from models import PetCreate, PetResponse

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

table = dynamodb.Table(os.environ.get('PETS_TABLE'))
router = APIRouter()

# ==========================================
# R: LIST ALL (Listar todas las mascotas)
# ==========================================
@router.get("/pets", response_model=list[PetResponse])
def list_pets():
    try:
        items = []
        response = table.scan()
        items.extend(response.get("Items", []))
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))
        for item in items:
            item["id"] = item["pet_id"]
        return items
    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")

# ==========================================
# C: CREATE (Registrar una mascota)
# ==========================================
@router.post("/pets", response_model=PetResponse, status_code=201)
def create_pet(pet: PetCreate):
    nuevo_id = str(uuid.uuid4())

    item = {
        "pet_id": nuevo_id,
        "owner_id": pet.owner_id,
        "nombre": pet.nombre,
        "especie": pet.especie,
        "raza": pet.raza,
        "edad": pet.edad,
        "genero": pet.genero
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
# R: READ (Obtener todas las mascotas de un dueño)
# ==========================================
@router.get("/pets/owner/{owner_id}", response_model=list[PetResponse])
def get_pets_by_owner(owner_id: str):
    try:
        response = table.scan(
            FilterExpression=Attr('owner_id').eq(owner_id)
        )
        items = response.get("Items", [])

        for item in items:
            item["id"] = item["pet_id"]

        return items

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")

# ==========================================
# R: READ (Obtener una mascota por ID)
# ==========================================
@router.get("/pets/{pet_id}", response_model=PetResponse)
def get_pet(pet_id: str):
    try:
        response = table.get_item(Key={"pet_id": pet_id})
        item = response.get("Item")

        if not item:
            raise HTTPException(status_code=404, detail="Mascota no encontrada")

        item["id"] = item["pet_id"]
        return item

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")

# ==========================================
# U: UPDATE (Actualizar una mascota)
# ==========================================
@router.put("/pets/{pet_id}", response_model=PetResponse)
def update_pet(pet_id: str, pet: PetCreate):
    try:
        response = table.update_item(
            Key={"pet_id": pet_id},
            UpdateExpression="SET owner_id=:o, nombre=:n, especie=:e, raza=:r, edad=:a, genero=:g",
            ExpressionAttributeValues={
                ":o": pet.owner_id,
                ":n": pet.nombre,
                ":e": pet.especie,
                ":r": pet.raza,
                ":a": pet.edad,
                ":g": pet.genero
            },
            ConditionExpression="attribute_exists(pet_id)",
            ReturnValues="ALL_NEW"
        )
        item = response.get("Attributes")

        item["id"] = item["pet_id"]
        return item

    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=404, detail="Mascota no encontrada")
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error actualizando en DynamoDB")

# ==========================================
# D: DELETE (Eliminar una mascota)
# ==========================================
@router.delete("/pets/{pet_id}", status_code=204)
def delete_pet(pet_id: str):
    try:
        response = table.get_item(Key={"pet_id": pet_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Mascota no encontrada")

        table.delete_item(Key={"pet_id": pet_id})
        return

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error eliminando en DynamoDB")
