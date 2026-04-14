import boto3
import uuid
import os
from decimal import Decimal
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Attr
from fastapi import APIRouter, HTTPException
from botocore.exceptions import ClientError
from pydantic import BaseModel
from models import BookingCreate, BookingResponse, BookingStatus, PaymentStatus

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

table = dynamodb.Table(os.environ.get('BOOKINGS_TABLE'))
router = APIRouter()


class StatusUpdate(BaseModel):
    status: BookingStatus


def _serialize(item: dict) -> dict:
    """Convierte datetime -> str ISO y float -> Decimal para DynamoDB."""
    result = {}
    for k, v in item.items():
        if isinstance(v, datetime):
            result[k] = v.isoformat()
        elif isinstance(v, float):
            result[k] = Decimal(str(v))
        else:
            result[k] = v
    return result


def _deserialize(item: dict) -> dict:
    """Convierte Decimal -> float para la respuesta."""
    result = {}
    for k, v in item.items():
        if isinstance(v, Decimal):
            result[k] = float(v)
        else:
            result[k] = v
    return result


# ==========================================
# C: CREATE (Crear una reserva)
# ==========================================
@router.post("/bookings", response_model=BookingResponse, status_code=201)
def create_booking(booking: BookingCreate):
    nuevo_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    raw_item = {
        "booking_id": nuevo_id,
        "pet_id": booking.pet_id,
        "owner_user_id": booking.owner_user_id,
        "walker_user_id": booking.walker_user_id,
        "start_time": booking.start_time,
        "duration_minutes": booking.duration_minutes,
        "price": booking.price,
        "status": BookingStatus.pending.value,
        "payment_status": PaymentStatus.pending.value,
        "created_at": now,
    }

    if booking.notes is not None:
        raw_item["notes"] = booking.notes

    item = _serialize(raw_item)

    try:
        table.put_item(Item=item)

        respuesta = _deserialize(item)
        respuesta["id"] = nuevo_id
        return respuesta

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error guardando en DynamoDB")


# ==========================================
# R: READ (Obtener una reserva por ID)
# ==========================================
@router.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: str):
    try:
        response = table.get_item(Key={"booking_id": booking_id})
        item = response.get("Item")

        if not item:
            raise HTTPException(status_code=404, detail="Reserva no encontrada")

        item = _deserialize(item)
        item["id"] = item["booking_id"]
        return item

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")


# ==========================================
# R: READ (Obtener reservas por dueño)
# ==========================================
@router.get("/bookings/owner/{owner_user_id}", response_model=list[BookingResponse])
def get_bookings_by_owner(owner_user_id: str):
    try:
        response = table.scan(
            FilterExpression=Attr('owner_user_id').eq(owner_user_id)
        )
        items = response.get("Items", [])

        result = []
        for item in items:
            item = _deserialize(item)
            item["id"] = item["booking_id"]
            result.append(item)

        return result

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")


# ==========================================
# R: READ (Obtener reservas por paseador)
# ==========================================
@router.get("/bookings/walker/{walker_user_id}", response_model=list[BookingResponse])
def get_bookings_by_walker(walker_user_id: str):
    try:
        response = table.scan(
            FilterExpression=Attr('walker_user_id').eq(walker_user_id)
        )
        items = response.get("Items", [])

        result = []
        for item in items:
            item = _deserialize(item)
            item["id"] = item["booking_id"]
            result.append(item)

        return result

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")


# ==========================================
# U: UPDATE (Actualizar una reserva)
# ==========================================
@router.put("/bookings/{booking_id}", response_model=BookingResponse)
def update_booking(booking_id: str, booking: BookingCreate):
    now = datetime.now(timezone.utc)

    update_expr = (
        "SET pet_id=:p, owner_user_id=:o, walker_user_id=:w, "
        "start_time=:st, duration_minutes=:dm, price=:pr, updated_at=:ua"
    )
    expr_values = {
        ":p": booking.pet_id,
        ":o": booking.owner_user_id,
        ":w": booking.walker_user_id,
        ":st": booking.start_time.isoformat(),
        ":dm": booking.duration_minutes,
        ":pr": Decimal(str(booking.price)),
        ":ua": now.isoformat(),
    }

    if booking.notes is not None:
        update_expr += ", notes=:n"
        expr_values[":n"] = booking.notes

    try:
        response = table.update_item(
            Key={"booking_id": booking_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
            ConditionExpression="attribute_exists(booking_id)",
            ReturnValues="ALL_NEW"
        )
        item = _deserialize(response.get("Attributes"))
        item["id"] = item["booking_id"]
        return item

    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error actualizando en DynamoDB")


# ==========================================
# PATCH: Actualizar estado de la reserva
# ==========================================
@router.patch("/bookings/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(booking_id: str, body: StatusUpdate):
    now = datetime.now(timezone.utc)

    try:
        response = table.update_item(
            Key={"booking_id": booking_id},
            UpdateExpression="SET #s=:s, updated_at=:ua",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
                ":s": body.status.value,
                ":ua": now.isoformat(),
            },
            ConditionExpression="attribute_exists(booking_id)",
            ReturnValues="ALL_NEW"
        )
        item = _deserialize(response.get("Attributes"))
        item["id"] = item["booking_id"]
        return item

    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error actualizando estado en DynamoDB")


# ==========================================
# D: DELETE (Eliminar una reserva)
# ==========================================
@router.delete("/bookings/{booking_id}", status_code=204)
def delete_booking(booking_id: str):
    try:
        response = table.get_item(Key={"booking_id": booking_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Reserva no encontrada")

        table.delete_item(Key={"booking_id": booking_id})
        return  # 204 No devuelve body

    except ClientError as e:
        print(f"Error de AWS: {e}")
        raise HTTPException(status_code=500, detail="Error eliminando en DynamoDB")
