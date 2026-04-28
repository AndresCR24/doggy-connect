/**
 * Cliente API centralizado para Doggy Connect & Walk.
 * Las peticiones pasan por el proxy Next.js en /api/<service>/...
 * para evitar problemas CORS (el servidor de Next.js llama a AWS,
 * no el navegador directamente).
 */

async function request(service, path, options = {}) {
  // /api/<service><path>  →  app/api/[service]/[[...path]]/route.js
  const url = `/api${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    const msg =
      data?.detail?.[0]?.msg ?? data?.detail ?? `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ─── USUARIOS ──────────────────────────────────────────────────────────────
// UserCreate: { nombre, email, role?, telefono?, ciudad? }
// UserResponse: { id, nombre, email, role, telefono, ciudad }

export const usersApi = {
  list: () => request("users", "/users"),
  create: (body) =>
    request("users", "/users", { method: "POST", body: JSON.stringify(body) }),
  get: (userId) => request("users", `/users/${userId}`),
  update: (userId, body) =>
    request("users", `/users/${userId}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (userId) =>
    request("users", `/users/${userId}`, { method: "DELETE" }),
};

// ─── MASCOTAS ──────────────────────────────────────────────────────────────
// PetCreate: { owner_id, nombre, especie (dog|cat), raza?, edad?, genero? }
// PetResponse: { id, owner_id, nombre, especie, raza, edad, genero }

export const petsApi = {
  list: () => request("pets", "/pets"),
  create: (body) =>
    request("pets", "/pets", { method: "POST", body: JSON.stringify(body) }),
  getByOwner: (ownerId) => request("pets", `/pets/owner/${ownerId}`),
  get: (petId) => request("pets", `/pets/${petId}`),
  update: (petId, body) =>
    request("pets", `/pets/${petId}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (petId) =>
    request("pets", `/pets/${petId}`, { method: "DELETE" }),
};

// ─── PASEADORES ────────────────────────────────────────────────────────────
// WalkerCreate: { user_id, precio_por_hora, experiencia_anios?, radio_servicio_km?, verificado?, estado_verificacion? }
// WalkerResponse: { id, user_id, precio_por_hora, experiencia_anios, radio_servicio_km, verificado, estado_verificacion, rating, completed_walks }

export const walkersApi = {
  list: () => request("walkers", "/walkers"),
  create: (body) =>
    request("walkers", "/walkers", { method: "POST", body: JSON.stringify(body) }),
  getByUser: (userId) => request("walkers", `/walkers/user/${userId}`),
  get: (walkerId) => request("walkers", `/walkers/${walkerId}`),
  update: (walkerId, body) =>
    request("walkers", `/walkers/${walkerId}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (walkerId) =>
    request("walkers", `/walkers/${walkerId}`, { method: "DELETE" }),
};

// ─── RESERVAS ──────────────────────────────────────────────────────────────
// BookingCreate: { pet_id, owner_user_id, walker_user_id, start_time (ISO), duration_minutes, price, notes? }
// BookingResponse: { id, ..., status, payment_status, created_at, updated_at }
// BookingStatus: pending | accepted | in_progress | completed | cancelled

export const bookingsApi = {
  create: (body) =>
    request("bookings", "/bookings", { method: "POST", body: JSON.stringify(body) }),
  get: (bookingId) => request("bookings", `/bookings/${bookingId}`),
  update: (bookingId, body) =>
    request("bookings", `/bookings/${bookingId}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (bookingId) =>
    request("bookings", `/bookings/${bookingId}`, { method: "DELETE" }),
  getByOwner: (ownerUserId) =>
    request("bookings", `/bookings/owner/${ownerUserId}`),
  getByWalker: (walkerUserId) =>
    request("bookings", `/bookings/walker/${walkerUserId}`),
  updateStatus: (bookingId, status) =>
    request("bookings", `/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ─── MATCH ─────────────────────────────────────────────────────────────────
// SwipeCreate: { from_pet_id, to_pet_id, action (like|dislike) }
// MatchCreate: { pet_a_id, pet_b_id }
// MatchPreferences: { pet_id, preferred_gender?, preferred_breed?, max_distance_km? }

export const matchApi = {
  // Swipes
  createSwipe: (body) =>
    request("match", "/swipes", { method: "POST", body: JSON.stringify(body) }),
  getSwipe: (swipeId) => request("match", `/swipes/${swipeId}`),
  getSwipesByPet: (petId) => request("match", `/swipes/pet/${petId}`),
  updateSwipe: (swipeId, body) =>
    request("match", `/swipes/${swipeId}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSwipe: (swipeId) =>
    request("match", `/swipes/${swipeId}`, { method: "DELETE" }),

  // Matches
  createMatch: (body) =>
    request("match", "/matches", { method: "POST", body: JSON.stringify(body) }),
  getMatch: (matchId) => request("match", `/matches/${matchId}`),
  getMatchesByPet: (petId) => request("match", `/matches/pet/${petId}`),
  updateMatch: (matchId, body) =>
    request("match", `/matches/${matchId}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteMatch: (matchId) =>
    request("match", `/matches/${matchId}`, { method: "DELETE" }),

  // Preferencias
  createPreferences: (body) =>
    request("match", "/match-preferences", { method: "POST", body: JSON.stringify(body) }),
  getPreferences: (petId) => request("match", `/match-preferences/${petId}`),
  updatePreferences: (petId, body) =>
    request("match", `/match-preferences/${petId}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePreferences: (petId) =>
    request("match", `/match-preferences/${petId}`, { method: "DELETE" }),
};
