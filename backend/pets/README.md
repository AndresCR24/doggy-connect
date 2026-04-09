# Microservicio de Mascotas

Microservicio Serverless para la gestión de mascotas en Doggy Connect.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/pets` | Registrar una nueva mascota |
| `GET` | `/pets/{pet_id}` | Obtener una mascota por ID |
| `GET` | `/pets/owner/{owner_id}` | Listar todas las mascotas de un dueño |
| `PUT` | `/pets/{pet_id}` | Actualizar los datos de una mascota |
| `DELETE` | `/pets/{pet_id}` | Eliminar una mascota |

## Modelo

```json
{
  "owner_id": "uuid-del-usuario",
  "nombre": "Firulais",
  "especie": "dog",
  "raza": "Labrador",
  "edad": 3,
  "genero": "macho"
}
```

## Desarrollo local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Levantar el servicio (requiere Docker para DynamoDB local)
serverless offline start
```
