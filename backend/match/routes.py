import os
import uuid
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Attr, Or
from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from models import (
    MatchCreate,
    MatchPreferences,
    MatchResponse,
    MatchStatus,
    SwipeCreate,
    SwipeResponse,
)


class MatchUpdate(BaseModel):
    pet_a_id: str
    pet_b_id: str
    status: MatchStatus = MatchStatus.active


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

swipes_table = dynamodb.Table(os.environ.get('SWIPES_TABLE'))
matches_table = dynamodb.Table(os.environ.get('MATCHES_TABLE'))
preferences_table = dynamodb.Table(os.environ.get('MATCH_PREFERENCES_TABLE'))
router = APIRouter()


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _swipe_to_response(item: dict) -> dict:
    response = item.copy()
    response["id"] = response["swipe_id"]
    return response


def _match_to_response(item: dict) -> dict:
    response = item.copy()
    response["id"] = response["match_id"]
    return response


def _preference_to_response(item: dict) -> dict:
    return {
        "pet_id": item["pet_id"],
        "preferred_gender": item.get("preferred_gender"),
        "preferred_breed": item.get("preferred_breed"),
        "max_distance_km": item.get("max_distance_km", 5),
    }


@router.post("/swipes", response_model=SwipeResponse, status_code=201)
def create_swipe(swipe: SwipeCreate):
    swipe_id = str(uuid.uuid4())
    item = {
        "swipe_id": swipe_id,
        "from_pet_id": swipe.from_pet_id,
        "to_pet_id": swipe.to_pet_id,
        "action": swipe.action,
        "created_at": _utc_now_iso(),
    }

    try:
        swipes_table.put_item(Item=item)
        return _swipe_to_response(item)
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error guardando swipe en DynamoDB")


@router.get("/swipes/{swipe_id}", response_model=SwipeResponse)
def get_swipe(swipe_id: str):
    try:
        response = swipes_table.get_item(Key={"swipe_id": swipe_id})
        item = response.get("Item")

        if not item:
            raise HTTPException(status_code=404, detail="Swipe no encontrado")

        return _swipe_to_response(item)
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")


@router.get("/swipes/pet/{pet_id}", response_model=list[SwipeResponse])
def get_swipes_by_pet(pet_id: str):
    try:
        response = swipes_table.scan(
            FilterExpression=Or(Attr('from_pet_id').eq(pet_id), Attr('to_pet_id').eq(pet_id))
        )
        items = response.get("Items", [])
        return [_swipe_to_response(item) for item in items]
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")


@router.put("/swipes/{swipe_id}", response_model=SwipeResponse)
def update_swipe(swipe_id: str, swipe: SwipeCreate):
    try:
        response = swipes_table.update_item(
            Key={"swipe_id": swipe_id},
            UpdateExpression="SET from_pet_id=:f, to_pet_id=:t, #a=:a",
            ExpressionAttributeNames={"#a": "action"},
            ExpressionAttributeValues={
                ":f": swipe.from_pet_id,
                ":t": swipe.to_pet_id,
                ":a": swipe.action,
            },
            ConditionExpression="attribute_exists(swipe_id)",
            ReturnValues="ALL_NEW"
        )
        return _swipe_to_response(response.get("Attributes"))
    except ClientError as error:
        if error.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=404, detail="Swipe no encontrado")
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error actualizando swipe en DynamoDB")


@router.delete("/swipes/{swipe_id}", status_code=204)
def delete_swipe(swipe_id: str):
    try:
        response = swipes_table.get_item(Key={"swipe_id": swipe_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Swipe no encontrado")

        swipes_table.delete_item(Key={"swipe_id": swipe_id})
        return
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error eliminando swipe en DynamoDB")


@router.post("/matches", response_model=MatchResponse, status_code=201)
def create_match(match: MatchCreate):
    match_id = str(uuid.uuid4())
    item = {
        "match_id": match_id,
        "pet_a_id": match.pet_a_id,
        "pet_b_id": match.pet_b_id,
        "status": MatchStatus.active.value,
        "created_at": _utc_now_iso(),
    }

    try:
        matches_table.put_item(Item=item)
        return _match_to_response(item)
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error guardando match en DynamoDB")


@router.get("/matches/{match_id}", response_model=MatchResponse)
def get_match(match_id: str):
    try:
        response = matches_table.get_item(Key={"match_id": match_id})
        item = response.get("Item")

        if not item:
            raise HTTPException(status_code=404, detail="Match no encontrado")

        return _match_to_response(item)
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")


@router.get("/matches/pet/{pet_id}", response_model=list[MatchResponse])
def get_matches_by_pet(pet_id: str):
    try:
        response = matches_table.scan(
            FilterExpression=Or(Attr('pet_a_id').eq(pet_id), Attr('pet_b_id').eq(pet_id))
        )
        items = response.get("Items", [])
        return [_match_to_response(item) for item in items]
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")


@router.put("/matches/{match_id}", response_model=MatchResponse)
def update_match(match_id: str, match: MatchUpdate):
    try:
        response = matches_table.update_item(
            Key={"match_id": match_id},
            UpdateExpression="SET pet_a_id=:a, pet_b_id=:b, #s=:s",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
                ":a": match.pet_a_id,
                ":b": match.pet_b_id,
                ":s": match.status.value,
            },
            ConditionExpression="attribute_exists(match_id)",
            ReturnValues="ALL_NEW"
        )
        return _match_to_response(response.get("Attributes"))
    except ClientError as error:
        if error.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=404, detail="Match no encontrado")
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error actualizando match en DynamoDB")


@router.delete("/matches/{match_id}", status_code=204)
def delete_match(match_id: str):
    try:
        response = matches_table.get_item(Key={"match_id": match_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Match no encontrado")

        matches_table.delete_item(Key={"match_id": match_id})
        return
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error eliminando match en DynamoDB")


@router.post("/match-preferences", response_model=MatchPreferences, status_code=201)
def create_match_preferences(preferences: MatchPreferences):
    item = preferences.model_dump(exclude_none=True)

    try:
        existing = preferences_table.get_item(Key={"pet_id": preferences.pet_id}).get("Item")
        if existing:
            raise HTTPException(status_code=409, detail="Las preferencias ya existen para esta mascota")

        preferences_table.put_item(Item=item)
        return _preference_to_response(item)
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error guardando preferencias en DynamoDB")


@router.get("/match-preferences/{pet_id}", response_model=MatchPreferences)
def get_match_preferences(pet_id: str):
    try:
        response = preferences_table.get_item(Key={"pet_id": pet_id})
        item = response.get("Item")

        if not item:
            raise HTTPException(status_code=404, detail="Preferencias no encontradas")

        return _preference_to_response(item)
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error consultando DynamoDB")


@router.put("/match-preferences/{pet_id}", response_model=MatchPreferences)
def update_match_preferences(pet_id: str, preferences: MatchPreferences):
    if pet_id != preferences.pet_id:
        raise HTTPException(status_code=400, detail="El pet_id de la ruta debe coincidir con el del cuerpo")

    update_expression_parts = ["max_distance_km=:distance"]
    expression_values = {":distance": preferences.max_distance_km}

    if preferences.preferred_gender is not None:
        update_expression_parts.append("preferred_gender=:gender")
        expression_values[":gender"] = preferences.preferred_gender
    else:
        update_expression_parts.append("preferred_gender=:gender")
        expression_values[":gender"] = None

    if preferences.preferred_breed is not None:
        update_expression_parts.append("preferred_breed=:breed")
        expression_values[":breed"] = preferences.preferred_breed
    else:
        update_expression_parts.append("preferred_breed=:breed")
        expression_values[":breed"] = None

    try:
        response = preferences_table.update_item(
            Key={"pet_id": pet_id},
            UpdateExpression="SET " + ", ".join(update_expression_parts),
            ExpressionAttributeValues=expression_values,
            ConditionExpression="attribute_exists(pet_id)",
            ReturnValues="ALL_NEW"
        )
        return _preference_to_response(response.get("Attributes"))
    except ClientError as error:
        if error.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=404, detail="Preferencias no encontradas")
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error actualizando preferencias en DynamoDB")


@router.delete("/match-preferences/{pet_id}", status_code=204)
def delete_match_preferences(pet_id: str):
    try:
        response = preferences_table.get_item(Key={"pet_id": pet_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Preferencias no encontradas")

        preferences_table.delete_item(Key={"pet_id": pet_id})
        return
    except ClientError as error:
        print(f"Error de AWS: {error}")
        raise HTTPException(status_code=500, detail="Error eliminando preferencias en DynamoDB")