"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { petsApi, mediaApi } from "../../../lib/apiClient";
import { useAuth } from "../../../contexts/AuthContext";

const SPECIES_EMOJI = { dog: "🐕", cat: "🐱" };

function petEmoji(pet) {
  return SPECIES_EMOJI[pet?.especie] ?? "🐾";
}

// Colores de avatar por ID (consistente con PawMatch)
const GRADIENTS = [
  "from-violet-400 to-purple-500",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-indigo-400 to-violet-500",
];
function gradient(id = "") {
  const idx = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const base =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-white/95 text-slate-900";
  return (
    <div className={`fixed right-5 top-5 z-50 w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur ${base}`}>
      <p className="text-sm font-medium">{msg}</p>
    </div>
  );
}

export default function PetProfilePage() {
  const { petId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const avatarInputRef = useRef(null);

  const [pet, setPet] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [avatar, setAvatar] = useState(null); // { id, public_url }
  const [loadingPet, setLoadingPet] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "ok" });
  const [lightbox, setLightbox] = useState(null); // URL de foto en fullscreen

  const isOwner = user && pet && user.id === pet.owner_id;

  function notify(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 3500);
  }

  // ─── Cargar datos ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!petId) return;
    petsApi.get(petId)
      .then(setPet)
      .catch(() => notify("No se pudo cargar la mascota", "error"))
      .finally(() => setLoadingPet(false));

    mediaApi.listByEntity("pet", petId)
      .then((data) => setPhotos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingPhotos(false));

    mediaApi.listByEntity("pet_avatar", petId)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) setAvatar(list[0]);
      })
      .catch(() => {});
  }, [petId]);

  // ─── Cambiar foto de perfil ──────────────────────────────────────────────
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED.includes(file.type)) {
      notify("Solo se permiten imágenes JPEG, PNG, WEBP o GIF.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify("El archivo no puede superar 5 MB.", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      // Eliminar avatar anterior si existe
      if (avatar?.id) {
        await mediaApi.remove(avatar.id).catch(() => {});
      }

      const { upload_url, public_url, media_id } = await mediaApi.presign(
        "pet_avatar", petId, file.name, file.type
      );
      await mediaApi.uploadToS3(upload_url, file);
      setAvatar({ id: media_id, public_url });
      notify("¡Foto de perfil actualizada! 🐾");
    } catch (err) {
      notify(err.message || "Error al subir la foto de perfil", "error");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  // ─── Subir foto ──────────────────────────────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED.includes(file.type)) {
      notify("Solo se permiten imágenes JPEG, PNG, WEBP o GIF.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify("El archivo no puede superar 5 MB.", "error");
      return;
    }

    setUploading(true);
    try {
      // 1. Pedir URL presignada
      const { upload_url, public_url, media_id } = await mediaApi.presign(
        "pet", petId, file.name, file.type
      );

      // 2. Subir directo a S3
      await mediaApi.uploadToS3(upload_url, file);

      // 3. Agregar al estado local
      setPhotos((prev) => [
        { id: media_id, public_url, created_at: new Date().toISOString() },
        ...prev,
      ]);
      notify("¡Foto subida correctamente! 🐾");
    } catch (err) {
      notify(err.message || "Error al subir la foto", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ─── Eliminar foto ───────────────────────────────────────────────────────
  async function handleDeletePhoto(media_id) {
    if (!confirm("¿Eliminar esta foto?")) return;
    try {
      await mediaApi.remove(media_id);
      setPhotos((prev) => prev.filter((p) => p.id !== media_id));
      notify("Foto eliminada.");
    } catch (err) {
      notify(err.message || "Error al eliminar", "error");
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  if (loadingPet) {
    return (
      <main>
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3 animate-bounce">🐾</div>
            <p className="text-slate-400 text-sm">Cargando perfil…</p>
          </div>
        </div>
      </main>
    );
  }

  if (!pet) {
    return (
      <main>
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="premium-card p-10 text-center max-w-sm">
            <div className="text-5xl mb-3">🐾</div>
            <p className="text-slate-500 text-sm">Mascota no encontrada.</p>
            <button onClick={() => router.back()}
              className="mt-4 rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-600 hover:bg-gray-100">
              ← Volver
            </button>
          </div>
        </div>
      </main>
    );
  }

  const g = gradient(pet.id);

  return (
    <main>
      <Navbar />
      <Toast msg={toast.msg} type={toast.type} />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Foto ampliada"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-white text-3xl font-bold hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 py-8">

        {/* Botón volver */}
        <button
          onClick={() => router.push("/mascotas")}
          className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          ← Mis mascotas
        </button>

        {/* ── Header de perfil ─────────────────────────────────────────── */}
        <div className="premium-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0 group">
            <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${g} flex items-center justify-center text-5xl shadow-lg overflow-hidden`}>
              {avatar?.public_url ? (
                <img src={avatar.public_url} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                petEmoji(pet)
              )}
            </div>
            {isOwner && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                  title="Cambiar foto de perfil"
                >
                  {uploadingAvatar
                    ? <span className="text-white text-xl animate-spin">⏳</span>
                    : <span className="text-white text-2xl">📷</span>
                  }
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {pet.nombre}
            </h1>
            <p className="text-sm text-slate-500 capitalize mt-0.5">
              {pet.especie}{pet.raza && pet.raza !== "No especificada" ? ` · ${pet.raza}` : ""}
              {pet.edad != null ? ` · ${pet.edad} años` : ""}
              {pet.genero ? ` · ${pet.genero}` : ""}
            </p>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-6 mt-4 text-center">
              <div>
                <p className="text-lg font-bold text-slate-900">{photos.length}</p>
                <p className="text-xs text-slate-400">fotos</p>
              </div>
            </div>

            {/* Botón subir (solo dueño) */}
            {isOwner && (
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/40 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin">⏳</span> Subiendo…
                    </>
                  ) : (
                    <>📷 Subir foto</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Grid de fotos ────────────────────────────────────────────── */}
        {loadingPhotos ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2 animate-bounce">🐾</div>
            <p className="text-slate-400 text-sm">Cargando fotos…</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="premium-card p-12 text-center">
            <div className="text-5xl mb-3">📷</div>
            <p className="text-slate-500 text-sm font-medium">
              {isOwner
                ? "Aún no hay fotos. ¡Sube la primera!"
                : "Esta mascota aún no tiene fotos."}
            </p>
            {isOwner && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                📷 Subir primera foto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                <img
                  src={photo.public_url}
                  alt="Foto de mascota"
                  className="w-full h-full object-cover rounded-lg cursor-pointer transition hover:opacity-90"
                  onClick={() => setLightbox(photo.public_url)}
                />
                {/* Overlay con botón eliminar (solo dueño) */}
                {isOwner && (
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 hidden group-hover:flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white text-xs transition hover:bg-red-600"
                    title="Eliminar foto"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {/* Tile de agregar foto (solo dueño) */}
            {isOwner && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition disabled:opacity-50"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs">Agregar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
