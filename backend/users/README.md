# Microservicio de Usuarios — Doggy Connect

Gestión de perfiles de usuarios y sus mascotas. Construido con **FastAPI + Mangum** y desplegado en **AWS Lambda + API Gateway** mediante **Serverless Framework**. Usa **DynamoDB** como base de datos.

---

## Estructura

```
users/
├── handler.py        # App FastAPI + adaptador Mangum para Lambda
├── routes.py         # Endpoints CRUD
├── models.py         # Schemas Pydantic
└── serverless.yaml   # Infraestructura (Lambda, API Gateway, DynamoDB)
```

---

## Modelo de datos

| Campo           | Tipo   | Requerido | Descripción                        |
|-----------------|--------|-----------|------------------------------------|
| `id`            | string | auto       | UUID generado automáticamente      |
| `nombre`        | string | sí         | Nombre del usuario                 |
| `email`         | string | sí         | Email (validado)                   |
| `nombre_mascota`| string | sí         | Nombre de la mascota               |
| `raza_mascota`  | string | no         | Raza (default: "No especificada")  |

---

## Endpoints

| Método   | Ruta                  | Descripción              |
|----------|-----------------------|--------------------------|
| `POST`   | `/users`              | Crear usuario            |
| `GET`    | `/users/{user_id}`    | Obtener usuario por ID   |
| `PUT`    | `/users/{user_id}`    | Actualizar usuario       |
| `DELETE` | `/users/{user_id}`    | Eliminar usuario         |

### Ejemplo — Crear usuario

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Andres",
    "email": "andres@example.com",
    "nombre_mascota": "Max",
    "raza_mascota": "Labrador"
  }'
```

Respuesta `201`:
```json
{
  "id": "a1b2c3d4-...",
  "nombre": "Andres",
  "email": "andres@example.com",
  "nombre_mascota": "Max",
  "raza_mascota": "Labrador"
}
```

---

## Desarrollo local

### Requisitos

- Python 3.12
- Node.js 18+
- Docker (para DynamoDB local)
- Serverless Framework: `npm install -g serverless`

### Instalación

```bash
# Desde la carpeta backend/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Dependencias de Node
npm install
```

### Levantar el entorno

```bash
# Terminal 1 — DynamoDB local en Docker
cd backend/
docker-compose up -d

# Terminal 2 — Crear la tabla en DynamoDB local (primera vez)
aws dynamodb create-table \
  --table-name doggy-connect-users-dev-users \
  --attribute-definitions AttributeName=user_id,AttributeType=S \
  --key-schema AttributeName=user_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 \
  --region us-east-1

# Terminal 3 — API local
cd backend/users/
source ../venv/bin/activate
sls offline start
```

La API queda disponible en `http://localhost:3000`.  
Swagger UI en `http://localhost:3000/docs`.

---

## Despliegue en AWS

```bash
# Configurar credenciales AWS (una sola vez)
aws configure

# Desplegar
sls deploy --stage dev

# Ver logs en tiempo real
sls logs -f api -t
```

### Eliminar el stack

```bash
sls remove --stage dev
```

---

## Variables de entorno

| Variable      | Descripción                                      |
|---------------|--------------------------------------------------|
| `USERS_TABLE` | Nombre de la tabla DynamoDB (inyectada por SLS)  |
| `IS_OFFLINE`  | Definida por serverless-offline en entorno local |
