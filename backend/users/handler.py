import os
from fastapi import FastAPI
from mangum import Mangum
from routes import router # Importamos las rutas que creamos arriba

app = FastAPI(
    title="API de Usuarios",
    description="Microservicio Serverless para gestión de perfiles",
    version="1.0.0",
    root_path="/dev" if not os.environ.get('IS_OFFLINE') else ""
)

# Conectamos el router a la aplicación principal
app.include_router(router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "API funcionando correctamente"}

# El adaptador para AWS Lambda
handler = Mangum(app, lifespan="off")