"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { usersApi, petsApi, walkersApi } from "../../lib/apiClient";

// ─── Constantes ──────────────────────────────────────────────────────────────

const SPECIES_EMOJI = { dog: "🐕", cat: "🐱" };
const SPECIES_LABEL = { dog: "Perro", cat: "Gato" };

const EMPTY_PET = {
  nombre: "",
  especie: "dog",
  raza: "",
  edad: "",
  genero: "No especificado",
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const cls =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-white/95 text-slate-900";
  return (
    <div
      className={`fixed right-5 top-5 z-50 w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur ${cls}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{msg}</p>
        <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-700">✕</button>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

// ─── Sección de información del usuario ──────────────────────────────────────

function UserInfoSection({ user, walkerProfile, onUpdated, onNotify }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: user.nombre ?? "",
    email: user.email ?? "",
    telefono: user.telefono ?? "",
    ciudad: user.ciudad ?? "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.email.trim()) {
      e.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Correo inválido";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      const body = { nombre: form.nombre.trim(), email: form.email.trim(), role: user.role };
      if (form.telefono.trim()) body.telefono = form.telefono.trim();
      if (form.ciudad.trim()) body.ciudad = form.ciudad.trim();
      const updated = await usersApi.update(user.id, body);
      onUpdated(updated);
      setEditing(false);
      onNotify("Perfil actualizado correctamente.");
    } catch (err) {
      onNotify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const roleLabel = user.role === "walker" ? "Paseador 🦮" : user.role === "admin" ? "Admin" : "Dueño de mascotas";

  return (
    <div className="premium-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-300/40 shrink-0">
            {user.nombre?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.nombre}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="inline-flex items-center mt-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              {roleLabel}
            </span>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 shrink-0"
          >
            Editar
          </button>
        )}
      </div>

      {!editing ? (
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {user.telefono && (
            <div className="flex items-center gap-2 text-slate-600">
              <span>📞</span> <span>{user.telefono}</span>
            </div>
          )}
          {user.ciudad && (
            <div className="flex items-center gap-2 text-slate-600">
              <span>📍</span> <span>{user.ciudad}</span>
            </div>
          )}
          <div className="text-xs text-slate-400 font-mono col-span-2">ID: {user.id}</div>
        </div>
      ) : (
        <div className="space-y-4 pt-1 border-t border-gray-100">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input name="nombre" value={form.nombre} onChange={handleChange} className={inputCls} />
              {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Correo <span className="text-red-400">*</span>
              </label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Ciudad</label>
              <input name="ciudad" value={form.ciudad} onChange={handleChange} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              onClick={() => { setEditing(false); setErrors({}); }}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Walker profile summary */}
      {walkerProfile && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-5 py-4 flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-xs text-indigo-400 mb-0.5">Precio/hora</p>
            <p className="font-semibold text-indigo-800">
              ${walkerProfile.precio_por_hora?.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-xs text-indigo-400 mb-0.5">Experiencia</p>
            <p className="font-semibold text-indigo-800">{walkerProfile.experiencia_anios ?? 0} años</p>
          </div>
          <div>
            <p className="text-xs text-indigo-400 mb-0.5">Radio</p>
            <p className="font-semibold text-indigo-800">{walkerProfile.radio_servicio_km} km</p>
          </div>
          <div>
            <p className="text-xs text-indigo-400 mb-0.5">Estado</p>
            <p className="font-semibold text-indigo-800 capitalize">
              {walkerProfile.estado_verificacion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Formulario inline de mascota ─────────────────────────────────────────────

function PetInlineForm({ initial, ownerId, onSave, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? {
          nombre: initial.nombre ?? "",
          especie: initial.especie ?? "dog",
          raza: initial.raza ?? "",
          edad: initial.edad != null ? String(initial.edad) : "",
          genero: initial.genero ?? "No especificado",
        }
      : { ...EMPTY_PET }
  );
  const [errors, setErrors] = useState({});

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const body = {
      owner_id: ownerId,
      nombre: form.nombre.trim(),
      especie: form.especie,
      ...(form.raza.trim() && { raza: form.raza.trim() }),
      ...(form.edad !== "" && { edad: parseInt(form.edad) }),
      ...(form.genero && form.genero !== "No especificado" && { genero: form.genero }),
    };
    onSave(body);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-gray-100">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Max" className={inputCls} />
          {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Especie</label>
          <select name="especie" value={form.especie} onChange={handleChange} className={inputCls}>
            <option value="dog">Perro 🐕</option>
            <option value="cat">Gato 🐱</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Raza</label>
          <input name="raza" value={form.raza} onChange={handleChange} placeholder="Labrador" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Edad (años)</label>
          <input type="number" name="edad" value={form.edad} onChange={handleChange} min="0" max="30" placeholder="3" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Género</label>
          <select name="genero" value={form.genero} onChange={handleChange} className={inputCls}>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
            <option value="No especificado">No especificado</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Guardando..." : initial ? "Actualizar" : "Agregar mascota"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Tarjeta de mascota ───────────────────────────────────────────────────────

function PetCard({ pet, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3 transition hover:border-gray-300 hover:-translate-y-0.5 duration-200">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-xl shadow-md shadow-purple-200/40 shrink-0">
          {SPECIES_EMOJI[pet.especie] ?? "🐾"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 truncate">{pet.nombre}</p>
          <p className="text-xs text-slate-500">{SPECIES_LABEL[pet.especie] ?? pet.especie}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        {pet.raza && (
          <div>
            <span className="text-slate-400">Raza: </span>{pet.raza}
          </div>
        )}
        {pet.edad != null && (
          <div>
            <span className="text-slate-400">Edad: </span>{pet.edad} {pet.edad === 1 ? "año" : "años"}
          </div>
        )}
        {pet.genero && pet.genero !== "No especificado" && (
          <div>
            <span className="text-slate-400">Género: </span>{pet.genero}
          </div>
        )}
      </div>

      {!confirmDelete ? (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onEdit(pet)}
            className="flex-1 rounded-full border border-indigo-200 bg-indigo-50 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            Editar
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 rounded-full border border-red-200 bg-red-50 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
          >
            Eliminar
          </button>
        </div>
      ) : (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onDelete(pet.id)}
            className="flex-1 rounded-full bg-red-500 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
          >
            Confirmar
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 rounded-full border border-gray-200 bg-white py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sección de mascotas ──────────────────────────────────────────────────────

function PetsSection({ userId, onNotify }) {
  const [pets, setPets] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPet, setEditPet] = useState(null);
  const [opLoading, setOpLoading] = useState(false);

  const fetchPets = useCallback(async () => {
    setFetching(true);
    try {
      const result = await petsApi.getByOwner(userId);
      setPets(Array.isArray(result) ? result : []);
    } catch (err) {
      onNotify(err.message, "error");
    } finally {
      setFetching(false);
    }
  }, [userId, onNotify]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  async function handleAdd(body) {
    setOpLoading(true);
    try {
      const created = await petsApi.create(body);
      setPets((p) => [created, ...p]);
      setShowAdd(false);
      onNotify(`${created.nombre} fue agregada exitosamente.`);
    } catch (err) {
      onNotify(err.message, "error");
    } finally {
      setOpLoading(false);
    }
  }

  async function handleUpdate(body) {
    setOpLoading(true);
    try {
      // owner_id no se edita en el update
      const { owner_id, ...updateBody } = body;
      const updated = await petsApi.update(editPet.id, updateBody);
      setPets((p) => p.map((pet) => (pet.id === updated.id ? updated : pet)));
      setEditPet(null);
      onNotify("Mascota actualizada.");
    } catch (err) {
      onNotify(err.message, "error");
    } finally {
      setOpLoading(false);
    }
  }

  async function handleDelete(petId) {
    try {
      await petsApi.remove(petId);
      setPets((p) => p.filter((pet) => pet.id !== petId));
      onNotify("Mascota eliminada.");
    } catch (err) {
      onNotify(err.message, "error");
    }
  }

  return (
    <div className="premium-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Mis mascotas</h3>
          <p className="text-sm text-slate-500 mt-0.5">{pets.length} registrada{pets.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowAdd((v) => !v); setEditPet(null); }}
          className="rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
        >
          {showAdd ? "Cancelar" : "+ Agregar"}
        </button>
      </div>

      {/* Formulario de nueva mascota */}
      {showAdd && (
        <PetInlineForm
          ownerId={userId}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          loading={opLoading}
        />
      )}

      {/* Lista de mascotas */}
      {fetching ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((n) => <Skeleton key={n} className="h-32" />)}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🐾</div>
          <p className="text-sm text-slate-500">Aún no tienes mascotas registradas.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            + Agregar primera mascota
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {pets.map((pet) =>
            editPet?.id === pet.id ? (
              <div key={pet.id} className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
                <p className="text-sm font-semibold text-indigo-800 mb-1">Editando: {pet.nombre}</p>
                <PetInlineForm
                  initial={pet}
                  ownerId={userId}
                  onSave={handleUpdate}
                  onCancel={() => setEditPet(null)}
                  loading={opLoading}
                />
              </div>
            ) : (
              <PetCard
                key={pet.id}
                pet={pet}
                onEdit={setEditPet}
                onDelete={handleDelete}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PerfilPage() {
  const { user, walkerProfile, loading, isAuthenticated, updateUser, logout } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState({ msg: "", type: "ok" });

  // Proteger la ruta
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  function notify(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 3500);
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <main>
      <Navbar />
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "ok" })} />

      <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        {/* Header de página */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Mi perfil</h1>
            <p className="mt-1 text-sm text-slate-500">Gestiona tu información y tus mascotas</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/paseadores"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              🦮 Buscar paseadores
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Info del usuario */}
        <UserInfoSection
          user={user}
          walkerProfile={walkerProfile}
          onUpdated={updateUser}
          onNotify={notify}
        />

        {/* Mascotas */}
        <PetsSection userId={user.id} onNotify={notify} />
      </div>
    </main>
  );
}
