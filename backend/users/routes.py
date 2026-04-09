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
# 1. CONFIGURACIÓN DE INFRAESTRUCTURA
# ==========================================
# Leemos el nombre de la tabla desde el serverless.yml (o usamos un default si falla)
NOMBRE_TABLA = os.environ.get("USERS_TABLE", "doggy-connect-users-dev-users")

# Conectamos a la base de datos local que simula serverless-dynamodb
dynamodb = boto3.resource(
    'dynamodb',
    region_name='us-east-1',
    endpoint_url='http://localhost:8000',
    aws_access_key_id='local',    # <--- ¡Verifica que esto esté!
    aws_secret_access_key='local' # <--- ¡Verifica que esto esté!
)
table = dynamodb.Table(NOMBRE_TABLA)

# ==========================================
# C: CREATE (Crear un usuario)
# ==========================================
@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate):
    nuevo_id = str(uuid.uuid4())
    
    # Preparamos el diccionario. Ojo: La clave primaria aquí es 'user_id' por tu YAML
    item = {
        "user_id": nuevo_id, 
        "nombre": user.nombre,
        "email": user.email,
        "nombre_mascota": user.nombre_mascota,
        "raza_mascota": user.raza_mascota
    }
    
    try:
        table.put_item(Item=item)
        
        # Pydantic espera que la respuesta tenga una variable llamada 'id', 
        # así que copiamos el dato para que la validación pase sin errores.
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
            UpdateExpression="SET nombre=:n, email=:e, nombre_mascota=:m, raza_mascota=:r",
            ExpressionAttributeValues={
                ":n": user.nombre,
                ":e": user.email,
                ":m": user.nombre_mascota,
                ":r": user.raza_mascota
            },
            ReturnValues="ALL_NEW"
        )
        item = response.get("Attributes")
        
        # Mapeo para Pydantic
        item["id"] = item["user_id"]
        return item
        
    except ClientError as e:
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