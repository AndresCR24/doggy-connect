"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { petsApi, usersApi } from "../../lib/apiClient";

const SPECIES = [
  { value: "dog", label: "Perro 🐕" },
  { value: "cat", label: "Gato 🐱" },
];

const GENEROS = ["Macho", "Hembra", "No especificado"];

const EMPTY_FORM = {
  owner_id: "",
  nombre: "",
  especie: "dog",
  raza: "",
  edad: "",
  genero: "",
};

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const base =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-white/95 text-slate-900";
  return (
    <div
      className={`fixed right-5 top-5 z-50 w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur transition-all ${base}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{msg}</p>
        <button
          onClick={onClose}
          className="shrink-0 rounded-full p-0.5 text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const SPECIES_EMOJI = { dog: "🐕", cat: "🐱" };

function PetCard({ pet, ownerName, onEdit, onDelete }) {
  return (
    <div className="premium-card p-5 flex flex-col gap-3 transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-2xl shadow-md shadow-purple-300/40">
          {SPECIES_EMOJI[pet.especie] ?? "🐾"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{pet.nombre}</p>
          <p className="text-xs text-slate-500 capitalize">{pet.especie}</p>
          {ownerName && (
            <p className="text-xs text-indigo-600 font-medium mt-0.5 truncate">
              👤 {ownerName}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        {pet.raza && (
          <span className="rounded-lg bg-gray-100 px-2.5 py-1">
            Raza: {pet.raza}
          </span>
        )}
        {pet.edad != null && pet.edad !== "" && (
          <span className="rounded-lg bg-gray-100 px-2.5 py-1">
            {pet.edad} {pet.edad === 1 ? "año" : "años"}
          </span>
        )}
        {pet.genero && (
          <span className="rounded-lg bg-gray-100 px-2.5 py-1">{pet.genero}</span>
        )}
      </div>
      <p className="text-[10px] text-slate-400 font-mono truncate">ID: {pet.id}</p>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(pet)}
          className="flex-1 rounded-full border border-indigo-200 bg-indigo-50 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(pet.id)}
          className="flex-1 rounded-full border border-red-200 bg-red-50 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

function PetForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.owner_id.trim()) e.owner_id = "El ID del dueño es requerido";
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.especie) e.especie = "La especie es requerida";
    if (form.edad !== "" && (isNaN(Number(form.edad)) || Number(form.edad) < 0))
      e.edad = "La edad debe ser un número positivo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const body = { ...form };
    if (!body.raza) delete body.raza;
    if (!body.genero) delete body.genero;
    body.edad = body.edad !== "" ? Number(body.edad) : undefined;
    if (body.edad === undefined) delete body.edad;
    onSave(body);
  }

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300";
  const errCls = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          ID del dueño (owner_id) *
        </label>
        <input
          name="owner_id"
          value={form.owner_id}
          onChange={handleChange}
          placeholder="UUID del usuario dueño"
          className={inputCls}
          disabled={!!initial}
        />
        {errors.owner_id && <p className={errCls}>{errors.owner_id}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nombre *
          </label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Luna"
            className={inputCls}
          />
          {errors.nombre && <p className={errCls}>{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Especie *
          </label>
          <select
            name="especie"
            value={form.especie}
            onChange={handleChange}
            className={inputCls}
          >
            {SPECIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.especie && <p className={errCls}>{errors.especie}</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Raza
          </label>
          <input
            name="raza"
            value={form.raza}
            onChange={handleChange}
            placeholder="Labrador…"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Edad (años)
          </label>
          <input
            name="edad"
            type="number"
            min="0"
            value={form.edad}
            onChange={handleChange}
            placeholder="3"
            className={inputCls}
          />
          {errors.edad && <p className={errCls}>{errors.edad}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Género
          </label>
          <select
            name="genero"
            value={form.genero}
            onChange={handleChange}
            className={inputCls}
          >
            <option value="">Sin especificar</option>
            {GENEROS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-gray-900 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Guardando…" : initial ? "Actualizar mascota" : "Registrar mascota"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function LookupPanel({ onLoaded }) {
  const [ownerId, setOwnerId] = useState("");
  const [petId, setPetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("owner");

  async function handleLookup() {
    const id = tab === "owner" ? ownerId.trim() : petId.trim();
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const result =
        tab === "owner"
          ? await petsApi.getByOwner(id)
          : [await petsApi.get(id)];
      onLoaded(Array.isArray(result) ? result : [result]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="premium-card p-5 flex flex-col gap-3">
      <div className="flex gap-2 text-xs font-medium">
        {[
          { key: "owner", label: "Por dueño" },
          { key: "pet", label: "Por ID mascota" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3 py-1 transition ${
              tab === t.key
                ? "bg-gray-900 text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={tab === "owner" ? ownerId : petId}
          onChange={(e) =>
            tab === "owner"
              ? setOwnerId(e.target.value)
              : setPetId(e.target.value)
          }
          placeholder={tab === "owner" ? "UUID del dueño…" : "UUID de la mascota…"}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={handleLookup}
          disabled={loading || !(tab === "owner" ? ownerId : petId).trim()}
          className="rounded-full bg-gray-900 px-5 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "…" : "Buscar"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

async function fetchOwnerNames(petList, existingOwners = {}) {
  const uniqueIds = [...new Set(
    petList.map((p) => p.owner_id).filter((id) => id && !existingOwners[id])
  )];
  if (!uniqueIds.length) return existingOwners;
  const results = await Promise.allSettled(uniqueIds.map((id) => usersApi.get(id)));
  const updated = { ...existingOwners };
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value?.nombre) {
      updated[uniqueIds[i]] = r.value.nombre;
    }
  });
  return updated;
}

export default function MascotasPage() {
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editPet, setEditPet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "ok" });

  useEffect(() => {
    petsApi.list()
      .then(async (data) => {
        const list = Array.isArray(data) ? data : [];
        setPets(list);
        const names = await fetchOwnerNames(list);
        setOwners(names);
      })
      .catch((e) => notify(e.message, "error"))
      .finally(() => setFetching(false));
  }, []);

  function notify(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 3500);
  }

  async function handleCreate(body) {
    setLoading(true);
    try {
      const pet = await petsApi.create(body);
      setPets((p) => [pet, ...p]);
      setShowForm(false);
      notify("Mascota registrada exitosamente.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(body) {
    setLoading(true);
    try {
      const updated = await petsApi.update(editPet.id, body);
      setPets((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      setEditPet(null);
      notify("Mascota actualizada.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(petId) {
    if (!confirm("¿Eliminar esta mascota?")) return;
    try {
      await petsApi.remove(petId);
      setPets((p) => p.filter((x) => x.id !== petId));
      notify("Mascota eliminada.");
    } catch (e) {
      notify(e.message, "error");
    }
  }

  async function handleLoaded(newPets) {
    setPets((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      newPets.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    });
    setOwners((prev) => {
      fetchOwnerNames(newPets, prev).then(setOwners);
      return prev;
    });
  }

  return (
    <main>
      <Navbar />
      <Toast
        msg={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: "", type: "ok" })}
      />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Gestión de Mascotas
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Registra, consulta y edita los perfiles de mascotas
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditPet(null); }}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            + Registrar mascota
          </button>
        </div>

        <LookupPanel onLoaded={handleLoaded} />

        {(showForm || editPet) && (
          <div className="mt-6 premium-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {editPet ? "Editar mascota" : "Registrar nueva mascota"}
            </h2>
            <PetForm
              initial={
                editPet
                  ? {
                      owner_id: editPet.owner_id,
                      nombre: editPet.nombre,
                      especie: editPet.especie,
                      raza: editPet.raza ?? "",
                      edad: editPet.edad?.toString() ?? "",
                      genero: editPet.genero ?? "",
                    }
                  : null
              }
              onSave={editPet ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditPet(null); }}
              loading={loading}
            />
          </div>
        )}

        {fetching ? (
          <div className="mt-10 text-center text-sm text-slate-400">Cargando mascotas…</div>
        ) : pets.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                ownerName={owners[pet.owner_id]}
                onEdit={(p) => { setEditPet(p); setShowForm(false); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 premium-card p-10 text-center">
            <div className="text-5xl mb-3">🐾</div>
            <p className="text-slate-500 text-sm">
              No hay mascotas registradas aún. Registra la primera.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
