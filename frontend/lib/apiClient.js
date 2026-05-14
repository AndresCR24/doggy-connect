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

// ─── MEDIA ────────────────────────────────────────────────────────────────

export const mediaApi = {
  /** Solicita URL presignada para subir una imagen a S3 */
  presign: (entity_type, entity_id, file_name, content_type) =>
    request("media", "/media/presign", {
      method: "POST",
      body: JSON.stringify({ entity_type, entity_id, file_name, content_type }),
    }),

  /** Lista todas las fotos de una entidad (ej: entity_type="pet", entity_id=petId) */
  listByEntity: (entity_type, entity_id) =>
    request("media", `/media/${entity_type}/${entity_id}`),

  /** Elimina una foto por su media_id */
  remove: (media_id) =>
    request("media", `/media/item/${media_id}`, { method: "DELETE" }),

  /** Sube el archivo binario directamente a S3 usando la upload_url presignada.
   *  PUT directo al bucket, sin pasar por el proxy de Next.js. */
  uploadToS3: async (upload_url, file) => {
    const res = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error(`Error subiendo a S3: ${res.status}`);
  },
};

// ─── AUTH (Cognito) ────────────────────────────────────────────────────────
// Todos los endpoints pasan por el proxy /api/auth/...

export const authApi = {
  /** Registra un usuario en Cognito. Cognito envía email de verificación. */
  register: (body) =>
    request("auth", "/auth/register", { method: "POST", body: JSON.stringify(body) }),

  /** Confirma la cuenta con el código de 6 dígitos recibido por email. */
  confirm: (email, code) =>
    request("auth", "/auth/confirm", { method: "POST", body: JSON.stringify({ email, code }) }),

  /** Reenvía el código de confirmación. */
  resendCode: (email) =>
    request("auth", "/auth/resend-code", { method: "POST", body: JSON.stringify({ email }) }),

  /** Login: devuelve { access_token, id_token, refresh_token, expires_in }. */
  login: (email, password) =>
    request("auth", "/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  /** Renueva los tokens con el refresh_token. */
  refresh: (refresh_token) =>
    request("auth", "/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token }) }),

  /** Devuelve los atributos del usuario autenticado a partir del access_token. */
  me: (access_token) =>
    request("auth", `/auth/me?access_token=${encodeURIComponent(access_token)}`),

  /** Cierra sesión (revoca tokens en Cognito). */
  logout: (access_token) =>
    request("auth", `/auth/logout?access_token=${encodeURIComponent(access_token)}`, { method: "POST" }),

  /** Cambia la contraseña estando autenticado. */
  changePassword: (access_token, old_password, new_password) =>
    request("auth", "/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ access_token, old_password, new_password }),
    }),

  /** Inicia el flujo de recuperación de contraseña (envía código por email). */
  forgotPassword: (email) =>
    request("auth", "/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  /** Confirma la nueva contraseña con el código recibido por email. */
  confirmForgotPassword: (email, code, new_password) =>
    request("auth", "/auth/confirm-forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, code, new_password }),
    }),
};
