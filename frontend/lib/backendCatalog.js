const DEFAULT_SERVICE_URLS = {
  users: process.env.NEXT_PUBLIC_USERS_API_URL || "",
  pets: process.env.NEXT_PUBLIC_PETS_API_URL || "",
  walkers: process.env.NEXT_PUBLIC_WALKERS_API_URL || "",
  bookings: process.env.NEXT_PUBLIC_BOOKINGS_API_URL || "",
  match: process.env.NEXT_PUBLIC_MATCH_API_URL || ""
};

const SERVICES = [
  {
    id: "users",
    title: "Usuarios",
    description: "CRUD de perfiles base para dueños y paseadores.",
    endpoints: [
      {
        id: "users-create",
        title: "Crear usuario",
        method: "POST",
        path: "/users",
        bodyTemplate: {
          nombre: "Ana Torres",
          email: "ana@example.com",
          role: "owner",
          telefono: "3001234567",
          ciudad: "Bogota"
        }
      },
      {
        id: "users-get",
        title: "Consultar usuario por ID",
        method: "GET",
        path: "/users/{user_id}",
        params: [
          { name: "user_id", label: "ID del usuario", placeholder: "uuid-del-usuario" }
        ]
      },
      {
        id: "users-update",
        title: "Actualizar usuario",
        method: "PUT",
        path: "/users/{user_id}",
        params: [
          { name: "user_id", label: "ID del usuario", placeholder: "uuid-del-usuario" }
        ],
        bodyTemplate: {
          nombre: "Ana Torres",
          email: "ana@example.com",
          role: "walker",
          telefono: "3001234567",
          ciudad: "Bogota"
        }
      },
      {
        id: "users-delete",
        title: "Eliminar usuario",
        method: "DELETE",
        path: "/users/{user_id}",
        params: [
          { name: "user_id", label: "ID del usuario", placeholder: "uuid-del-usuario" }
        ]
      }
    ]
  },
  {
    id: "pets",
    title: "Mascotas",
    description: "Registro de mascota, consulta por dueño y mantenimiento del perfil.",
    endpoints: [
      {
        id: "pets-create",
        title: "Crear mascota",
        method: "POST",
        path: "/pets",
        bodyTemplate: {
          owner_id: "owner-uuid",
          nombre: "Luna",
          especie: "dog",
          raza: "Labrador",
          edad: 3,
          genero: "female"
        }
      },
      {
        id: "pets-owner",
        title: "Listar mascotas por dueño",
        method: "GET",
        path: "/pets/owner/{owner_id}",
        params: [
          { name: "owner_id", label: "ID del dueño", placeholder: "owner-uuid" }
        ]
      },
      {
        id: "pets-get",
        title: "Consultar mascota por ID",
        method: "GET",
        path: "/pets/{pet_id}",
        params: [
          { name: "pet_id", label: "ID de la mascota", placeholder: "pet-uuid" }
        ]
      },
      {
        id: "pets-update",
        title: "Actualizar mascota",
        method: "PUT",
        path: "/pets/{pet_id}",
        params: [
          { name: "pet_id", label: "ID de la mascota", placeholder: "pet-uuid" }
        ],
        bodyTemplate: {
          owner_id: "owner-uuid",
          nombre: "Luna",
          especie: "dog",
          raza: "Golden Retriever",
          edad: 4,
          genero: "female"
        }
      },
      {
        id: "pets-delete",
        title: "Eliminar mascota",
        method: "DELETE",
        path: "/pets/{pet_id}",
        params: [
          { name: "pet_id", label: "ID de la mascota", placeholder: "pet-uuid" }
        ]
      }
    ]
  },
  {
    id: "walkers",
    title: "Paseadores",
    description: "Perfil operativo del paseador y su estado de verificacion.",
    endpoints: [
      {
        id: "walkers-create",
        title: "Crear paseador",
        method: "POST",
        path: "/walkers",
        bodyTemplate: {
          user_id: "user-uuid",
          experiencia_anios: 2,
          precio_por_hora: 28000,
          radio_servicio_km: 5,
          verificado: false,
          estado_verificacion: "pending"
        }
      },
      {
        id: "walkers-user",
        title: "Listar paseadores por usuario",
        method: "GET",
        path: "/walkers/user/{user_id}",
        params: [
          { name: "user_id", label: "ID del usuario", placeholder: "user-uuid" }
        ]
      },
      {
        id: "walkers-get",
        title: "Consultar paseador por ID",
        method: "GET",
        path: "/walkers/{walker_id}",
        params: [
          { name: "walker_id", label: "ID del paseador", placeholder: "walker-uuid" }
        ]
      },
      {
        id: "walkers-update",
        title: "Actualizar paseador",
        method: "PUT",
        path: "/walkers/{walker_id}",
        params: [
          { name: "walker_id", label: "ID del paseador", placeholder: "walker-uuid" }
        ],
        bodyTemplate: {
          user_id: "user-uuid",
          experiencia_anios: 4,
          precio_por_hora: 35000,
          radio_servicio_km: 8,
          verificado: true,
          estado_verificacion: "approved"
        }
      },
      {
        id: "walkers-delete",
        title: "Eliminar paseador",
        method: "DELETE",
        path: "/walkers/{walker_id}",
        params: [
          { name: "walker_id", label: "ID del paseador", placeholder: "walker-uuid" }
        ]
      }
    ]
  },
  {
    id: "bookings",
    title: "Reservas",
    description: "Agenda, consulta y cambia el estado de los paseos reservados.",
    endpoints: [
      {
        id: "bookings-create",
        title: "Crear reserva",
        method: "POST",
        path: "/bookings",
        bodyTemplate: {
          pet_id: "pet-uuid",
          owner_user_id: "owner-uuid",
          walker_user_id: "walker-uuid",
          start_time: "2026-05-01T09:00:00Z",
          duration_minutes: 60,
          price: 30000,
          notes: "Paseo por el parque central"
        }
      },
      {
        id: "bookings-get",
        title: "Consultar reserva por ID",
        method: "GET",
        path: "/bookings/{booking_id}",
        params: [
          { name: "booking_id", label: "ID de la reserva", placeholder: "booking-uuid" }
        ]
      },
      {
        id: "bookings-owner",
        title: "Listar reservas por duenio",
        method: "GET",
        path: "/bookings/owner/{owner_user_id}",
        params: [
          { name: "owner_user_id", label: "ID del duenio", placeholder: "owner-uuid" }
        ]
      },
      {
        id: "bookings-walker",
        title: "Listar reservas por paseador",
        method: "GET",
        path: "/bookings/walker/{walker_user_id}",
        params: [
          { name: "walker_user_id", label: "ID del paseador", placeholder: "walker-uuid" }
        ]
      },
      {
        id: "bookings-update",
        title: "Actualizar reserva",
        method: "PUT",
        path: "/bookings/{booking_id}",
        params: [
          { name: "booking_id", label: "ID de la reserva", placeholder: "booking-uuid" }
        ],
        bodyTemplate: {
          pet_id: "pet-uuid",
          owner_user_id: "owner-uuid",
          walker_user_id: "walker-uuid",
          start_time: "2026-05-01T10:00:00Z",
          duration_minutes: 45,
          price: 32000,
          notes: "Llevar bolsa de premios"
        }
      },
      {
        id: "bookings-status",
        title: "Cambiar estado de reserva",
        method: "PATCH",
        path: "/bookings/{booking_id}/status",
        params: [
          { name: "booking_id", label: "ID de la reserva", placeholder: "booking-uuid" }
        ],
        bodyTemplate: {
          status: "accepted"
        }
      },
      {
        id: "bookings-delete",
        title: "Eliminar reserva",
        method: "DELETE",
        path: "/bookings/{booking_id}",
        params: [
          { name: "booking_id", label: "ID de la reserva", placeholder: "booking-uuid" }
        ]
      }
    ]
  },
  {
    id: "match",
    title: "Match",
    description: "Swipes, matches y preferencias de afinidad para las mascotas.",
    endpoints: [
      {
        id: "swipes-create",
        title: "Crear swipe",
        method: "POST",
        path: "/swipes",
        bodyTemplate: {
          from_pet_id: "pet-a-uuid",
          to_pet_id: "pet-b-uuid",
          action: "like"
        }
      },
      {
        id: "swipes-get",
        title: "Consultar swipe por ID",
        method: "GET",
        path: "/swipes/{swipe_id}",
        params: [
          { name: "swipe_id", label: "ID del swipe", placeholder: "swipe-uuid" }
        ]
      },
      {
        id: "swipes-pet",
        title: "Listar swipes por mascota",
        method: "GET",
        path: "/swipes/pet/{pet_id}",
        params: [
          { name: "pet_id", label: "ID de la mascota", placeholder: "pet-uuid" }
        ]
      },
      {
        id: "swipes-update",
        title: "Actualizar swipe",
        method: "PUT",
        path: "/swipes/{swipe_id}",
        params: [
          { name: "swipe_id", label: "ID del swipe", placeholder: "swipe-uuid" }
        ],
        bodyTemplate: {
          from_pet_id: "pet-a-uuid",
          to_pet_id: "pet-b-uuid",
          action: "dislike"
        }
      },
      {
        id: "swipes-delete",
        title: "Eliminar swipe",
        method: "DELETE",
        path: "/swipes/{swipe_id}",
        params: [
          { name: "swipe_id", label: "ID del swipe", placeholder: "swipe-uuid" }
        ]
      },
      {
        id: "matches-create",
        title: "Crear match",
        method: "POST",
        path: "/matches",
        bodyTemplate: {
          pet_a_id: "pet-a-uuid",
          pet_b_id: "pet-b-uuid"
        }
      },
      {
        id: "matches-get",
        title: "Consultar match por ID",
        method: "GET",
        path: "/matches/{match_id}",
        params: [
          { name: "match_id", label: "ID del match", placeholder: "match-uuid" }
        ]
      },
      {
        id: "matches-pet",
        title: "Listar matches por mascota",
        method: "GET",
        path: "/matches/pet/{pet_id}",
        params: [
          { name: "pet_id", label: "ID de la mascota", placeholder: "pet-uuid" }
        ]
      },
      {
        id: "matches-update",
        title: "Actualizar match",
        method: "PUT",
        path: "/matches/{match_id}",
        params: [
          { name: "match_id", label: "ID del match", placeholder: "match-uuid" }
        ],
        bodyTemplate: {
          pet_a_id: "pet-a-uuid",
          pet_b_id: "pet-b-uuid",
          status: "active"
        }
      },
      {
        id: "matches-delete",
        title: "Eliminar match",
        method: "DELETE",
        path: "/matches/{match_id}",
        params: [
          { name: "match_id", label: "ID del match", placeholder: "match-uuid" }
        ]
      },
      {
        id: "preferences-create",
        title: "Crear preferencias",
        method: "POST",
        path: "/match-preferences",
        bodyTemplate: {
          pet_id: "pet-uuid",
          preferred_gender: "female",
          preferred_breed: "Labrador",
          max_distance_km: 5
        }
      },
      {
        id: "preferences-get",
        title: "Consultar preferencias",
        method: "GET",
        path: "/match-preferences/{pet_id}",
        params: [
          { name: "pet_id", label: "ID de la mascota", placeholder: "pet-uuid" }
        ]
      },
      {
        id: "preferences-update",
        title: "Actualizar preferencias",
        method: "PUT",
        path: "/match-preferences/{pet_id}",
        params: [
          { name: "pet_id", label: "ID de la mascota", placeholder: "pet-uuid" }
        ],
        bodyTemplate: {
          pet_id: "pet-uuid",
          preferred_gender: "male",
          preferred_breed: "Beagle",
          max_distance_km: 8
        }
      },
      {
        id: "preferences-delete",
        title: "Eliminar preferencias",
        method: "DELETE",
        path: "/match-preferences/{pet_id}",
        params: [
          { name: "pet_id", label: "ID de la mascota", placeholder: "pet-uuid" }
        ]
      }
    ]
  }
];

function buildUrl(baseUrl, path, params = {}) {
  const normalizedBase = (baseUrl || "").trim().replace(/\/$/, "");
  const resolvedPath = path.replace(/\{(.*?)\}/g, (_, key) => {
    const value = params[key];
    return encodeURIComponent(value || "");
  });

  return `${normalizedBase}${resolvedPath}`;
}

export { buildUrl, DEFAULT_SERVICE_URLS, SERVICES };