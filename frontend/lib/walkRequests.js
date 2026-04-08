const STORAGE_KEY = "doggy_walk_requests_v1";
const UPDATED_EVENT = "doggyWalkRequestsUpdated";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function readStorage() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw, []) : [];
  return Array.isArray(parsed) ? parsed : [];
}

function writeStorage(requests) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event(UPDATED_EVENT));
}

async function trySendToBackend(request) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (!base) return;

  try {
    await fetch(`${base}/walk-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
  } catch {
    // Backend opcional: si falla, seguimos en modo local.
  }
}

export function listWalkRequests() {
  return readStorage().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function createWalkRequest({ dog, source }) {
  const newRequest = {
    id: `wr_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    status: "pending",
    source: source || "unknown",
    dog: {
      id: dog?.id,
      name: dog?.name,
      breed: dog?.breed,
      age: dog?.age,
      energy: dog?.energy,
      distanceKm: dog?.distanceKm,
      avatar: dog?.avatar,
      compatibility: dog?.compatibility
    }
  };

  const existing = readStorage();
  const alreadyExists = existing.some(
    (req) => req?.dog?.id && req.dog.id === newRequest.dog.id && req.status === "pending"
  );

  const updated = alreadyExists ? existing : [newRequest, ...existing];
  writeStorage(updated);

  if (!alreadyExists) await trySendToBackend(newRequest);

  return { request: newRequest, didCreate: !alreadyExists };
}

export function subscribeWalkRequests(onChange) {
  if (typeof window === "undefined") return () => {};

  function handler() {
    onChange(listWalkRequests());
  }

  window.addEventListener(UPDATED_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(UPDATED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function updateWalkRequestStatus(id, nextStatus) {
  const existing = readStorage();
  const updated = existing.map((req) =>
    req?.id === id ? { ...req, status: nextStatus } : req
  );
  writeStorage(updated);
  return listWalkRequests();
}

export function removeWalkRequest(id) {
  const existing = readStorage();
  const updated = existing.filter((req) => req?.id !== id);
  writeStorage(updated);
  return listWalkRequests();
}

export function clearWalkRequests() {
  writeStorage([]);
  return [];
}

