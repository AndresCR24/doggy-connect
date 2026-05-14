from pydantic import BaseModel
from typing import Optional


class PresignRequest(BaseModel):
    entity_type: str   # "pet" | "user" | etc.
    entity_id: str
    file_name: str
    content_type: str  # "image/jpeg" | "image/png" | "image/webp"


class PresignResponse(BaseModel):
    media_id: str
    upload_url: str    # URL presignada para PUT directo desde el browser
    public_url: str    # URL pública final del objeto en S3
    key: str


class MediaItem(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    key: str
    public_url: str
    created_at: str


class DeleteRequest(BaseModel):
    media_id: str
