import os
from fastapi import FastAPI
from mangum import Mangum
from routes import router

app = FastAPI(
    title="API de Reservas",
    description="Microservicio Serverless para gestión de reservas de paseos",
    version="1.0.0",
    root_path="/dev" if not os.environ.get('IS_OFFLINE') else ""
)

app.include_router(router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "API de Reservas funcionando correctamente"}

handler = Mangum(app, lifespan="off")
