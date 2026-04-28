import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from routes import router

app = FastAPI(
    title="API de Paseadores",
    description="Microservicio Serverless para gestión de paseadores",
    version="1.0.0",
    root_path="/dev" if not os.environ.get('IS_OFFLINE') else ""
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "API de Paseadores funcionando correctamente"}

handler = Mangum(app, lifespan="off")
