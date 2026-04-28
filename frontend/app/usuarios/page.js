"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { usersApi } from "../../lib/apiClient";

const ROLES = ["owner", "walker", "admin"];

const EMPTY_FORM = {
  nombre: "",
  email: "",
  role: "owner",
  telefono: "",
  ciudad: "",
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

function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="premium-card p-5 flex flex-col gap-3 transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-300/40">
          {user.nombre?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{user.nombre}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 capitalize">
          {user.role}
        </span>
      </div>
      {(user.telefono || user.ciudad) && (
        <div className="flex gap-4 text-xs text-slate-500">
          {user.telefono && <span>📞 {user.telefono}</span>}
          {user.ciudad && <span>📍 {user.ciudad}</span>}
        </div>
      )}
      <p className="text-[10px] text-slate-400 font-mono">ID: {user.id}</p>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(user)}
          className="flex-1 rounded-full border border-indigo-200 bg-indigo-50 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="flex-1 rounded-full border border-red-200 bg-red-50 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

function UserForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.email.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido";
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
    if (!body.telefono) delete body.telefono;
    if (!body.ciudad) delete body.ciudad;
    onSave(body);
  }

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300";
  const errCls = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Nombre completo *
        </label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Ej. María García"
          className={inputCls}
        />
        {errors.nombre && <p className={errCls}>{errors.nombre}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Email *
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          className={inputCls}
        />
        {errors.email && <p className={errCls}>{errors.email}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Rol
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className={inputCls}
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Teléfono
          </label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="+57 300 000 0000"
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Ciudad
        </label>
        <input
          name="ciudad"
          value={form.ciudad}
          onChange={handleChange}
          placeholder="Bogotá, Medellín…"
          className={inputCls}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-gray-900 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Guardando…" : initial ? "Actualizar usuario" : "Crear usuario"}
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
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLookup() {
    if (!userId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const user = await usersApi.get(userId.trim());
      onLoaded(user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="premium-card p-5 flex flex-col gap-3">
      <p className="text-sm font-medium text-slate-700">Buscar usuario por ID</p>
      <div className="flex gap-2">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="user-uuid…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={handleLookup}
          disabled={loading || !userId.trim()}
          className="rounded-full bg-gray-900 px-5 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "…" : "Buscar"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "ok" });

  useEffect(() => {
    usersApi.list()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
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
      const user = await usersApi.create(body);
      setUsers((p) => [user, ...p]);
      setShowForm(false);
      notify("Usuario creado exitosamente.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(body) {
    setLoading(true);
    try {
      const updated = await usersApi.update(editUser.id, body);
      setUsers((p) => p.map((u) => (u.id === updated.id ? updated : u)));
      setEditUser(null);
      notify("Usuario actualizado.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId) {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await usersApi.remove(userId);
      setUsers((p) => p.filter((u) => u.id !== userId));
      notify("Usuario eliminado.");
    } catch (e) {
      notify(e.message, "error");
    }
  }

  function handleLoaded(user) {
    setUsers((p) => {
      if (p.find((u) => u.id === user.id)) return p;
      return [user, ...p];
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
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Gestión de Usuarios
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Crea, consulta y edita perfiles de la plataforma
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditUser(null); }}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            + Nuevo usuario
          </button>
        </div>

        {/* Lookup */}
        <LookupPanel onLoaded={handleLoaded} />

        {/* Form */}
        {(showForm || editUser) && (
          <div className="mt-6 premium-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {editUser ? "Editar usuario" : "Crear nuevo usuario"}
            </h2>
            <UserForm
              initial={
                editUser
                  ? {
                      nombre: editUser.nombre,
                      email: editUser.email,
                      role: editUser.role,
                      telefono: editUser.telefono ?? "",
                      ciudad: editUser.ciudad ?? "",
                    }
                  : null
              }
              onSave={editUser ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditUser(null); }}
              loading={loading}
            />
          </div>
        )}

        {/* Cards */}
        {fetching ? (
          <div className="mt-10 text-center text-sm text-slate-400">Cargando usuarios…</div>
        ) : users.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onEdit={(user) => { setEditUser(user); setShowForm(false); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 premium-card p-10 text-center">
            <div className="text-5xl mb-3">👤</div>
            <p className="text-slate-500 text-sm">
              No hay usuarios registrados aún. Crea el primero.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
