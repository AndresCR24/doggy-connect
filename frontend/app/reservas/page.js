"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import { bookingsApi } from "../../lib/apiClient";

const STATUS_CONFIG = {
  pending:     { label: "Pendiente",    color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  accepted:    { label: "Aceptada",     color: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "En progreso",  color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  completed:   { label: "Completada",   color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled:   { label: "Cancelada",    color: "bg-red-50 text-red-700 border-red-200" },
};

const PAYMENT_CONFIG = {
  pending:  { label: "Pago pendiente", color: "text-yellow-600" },
  paid:     { label: "Pagado ✓",       color: "text-emerald-600" },
  refunded: { label: "Reembolsado",    color: "text-blue-600" },
};

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const base =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-white/95 text-slate-900";
  return (
    <div className={`fixed right-5 top-5 z-50 w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur ${base}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{msg}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "–";
  try {
    return new Date(iso).toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function BookingCard({ booking, onStatusChange, onDelete, onEdit }) {
  const st = STATUS_CONFIG[booking.status] ?? { label: booking.status, color: "bg-gray-100 text-gray-700 border-gray-200" };
  const pay = PAYMENT_CONFIG[booking.payment_status] ?? { label: booking.payment_status, color: "text-gray-500" };
  const nextStatuses = Object.keys(STATUS_CONFIG).filter((s) => s !== booking.status);

  return (
    <div className="premium-card p-5 flex flex-col gap-3 transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 font-mono truncate">ID: {booking.id}</p>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">
            📅 {formatDate(booking.start_time)}
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
          {st.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div className="rounded-lg bg-gray-100 px-2.5 py-2">
          <div className="text-gray-400 mb-0.5">Duración</div>
          <div className="font-semibold">{booking.duration_minutes} min</div>
        </div>
        <div className="rounded-lg bg-gray-100 px-2.5 py-2">
          <div className="text-gray-400 mb-0.5">Precio</div>
          <div className="font-semibold">${booking.price?.toLocaleString("es-CO")}</div>
        </div>
      </div>

      <div className="text-xs text-slate-500 space-y-0.5">
        <p>🐾 Mascota: <span className="font-mono text-slate-700">{booking.pet_id}</span></p>
        <p>👤 Dueño: <span className="font-mono text-slate-700">{booking.owner_user_id}</span></p>
        <p>🦮 Paseador: <span className="font-mono text-slate-700">{booking.walker_user_id}</span></p>
        {booking.notes && <p>📝 {booking.notes}</p>}
      </div>

      <p className={`text-xs font-medium ${pay.color}`}>{pay.label}</p>

      {/* Status changer */}
      <div className="flex gap-1.5 flex-wrap pt-1">
        {nextStatuses.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(booking.id, s)}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition hover:opacity-80 ${STATUS_CONFIG[s]?.color ?? "border-gray-200 text-gray-600"}`}
          >
            → {STATUS_CONFIG[s]?.label ?? s}
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(booking)}
          className="flex-1 rounded-full border border-indigo-200 bg-indigo-50 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(booking.id)}
          className="flex-1 rounded-full border border-red-200 bg-red-50 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

function BookingForm({ initial, onSave, onCancel, loading }) {
  const EMPTY = {
    pet_id: "",
    owner_user_id: "",
    walker_user_id: "",
    start_time: "",
    duration_minutes: "",
    price: "",
    notes: "",
  };
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          start_time: initial.start_time
            ? new Date(initial.start_time).toISOString().slice(0, 16)
            : "",
          notes: initial.notes ?? "",
        }
      : EMPTY
  );
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.pet_id.trim()) e.pet_id = "Requerido";
    if (!form.owner_user_id.trim()) e.owner_user_id = "Requerido";
    if (!form.walker_user_id.trim()) e.walker_user_id = "Requerido";
    if (!form.start_time) e.start_time = "Requerido";
    if (!form.duration_minutes || Number(form.duration_minutes) <= 0)
      e.duration_minutes = "Debe ser mayor a 0";
    if (!form.price || Number(form.price) <= 0) e.price = "Debe ser mayor a 0";
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
    const body = {
      pet_id: form.pet_id.trim(),
      owner_user_id: form.owner_user_id.trim(),
      walker_user_id: form.walker_user_id.trim(),
      start_time: new Date(form.start_time).toISOString(),
      duration_minutes: Number(form.duration_minutes),
      price: Number(form.price),
    };
    if (form.notes.trim()) body.notes = form.notes.trim();
    onSave(body);
  }

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300";
  const errCls = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Pet ID *</label>
          <input name="pet_id" value={form.pet_id} onChange={handleChange}
            placeholder="UUID mascota" className={inputCls} />
          {errors.pet_id && <p className={errCls}>{errors.pet_id}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Owner User ID *</label>
          <input name="owner_user_id" value={form.owner_user_id} onChange={handleChange}
            placeholder="UUID dueño" className={inputCls} />
          {errors.owner_user_id && <p className={errCls}>{errors.owner_user_id}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Walker User ID *</label>
          <input name="walker_user_id" value={form.walker_user_id} onChange={handleChange}
            placeholder="UUID paseador" className={inputCls} />
          {errors.walker_user_id && <p className={errCls}>{errors.walker_user_id}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fecha y hora *</label>
          <input name="start_time" type="datetime-local" value={form.start_time}
            onChange={handleChange} className={inputCls} />
          {errors.start_time && <p className={errCls}>{errors.start_time}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Duración (min) *</label>
          <input name="duration_minutes" type="number" min="1" value={form.duration_minutes}
            onChange={handleChange} placeholder="60" className={inputCls} />
          {errors.duration_minutes && <p className={errCls}>{errors.duration_minutes}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Precio (COP) *</label>
          <input name="price" type="number" min="0" value={form.price}
            onChange={handleChange} placeholder="30000" className={inputCls} />
          {errors.price && <p className={errCls}>{errors.price}</p>}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
        <textarea name="notes" value={form.notes} onChange={handleChange}
          placeholder="Instrucciones especiales, alergias, etc."
          rows={2}
          className={inputCls + " resize-none"} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 rounded-full bg-gray-900 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Guardando…" : initial ? "Actualizar reserva" : "Crear reserva"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm text-gray-700 transition hover:bg-gray-100">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function LookupPanel({ onLoaded }) {
  const [id, setId] = useState("");
  const [mode, setMode] = useState("booking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLookup() {
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    try {
      let result;
      if (mode === "booking") result = [await bookingsApi.get(id.trim())];
      else if (mode === "owner") result = await bookingsApi.getByOwner(id.trim());
      else result = await bookingsApi.getByWalker(id.trim());
      if (!Array.isArray(result)) result = [result];
      onLoaded(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const MODES = [
    { key: "booking", label: "Por Booking ID" },
    { key: "owner", label: "Por Dueño" },
    { key: "walker", label: "Por Paseador" },
  ];

  return (
    <div className="premium-card p-5 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        {MODES.map((m) => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={`rounded-full px-3 py-1 transition ${
              mode === m.key ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={id} onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          placeholder="UUID…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <button onClick={handleLookup} disabled={loading || !id.trim()}
          className="rounded-full bg-gray-900 px-5 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-50">
          {loading ? "…" : "Buscar"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ReservasPage() {
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "ok" });
  const [filterStatus, setFilterStatus] = useState("all");

  function notify(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 3500);
  }

  async function handleCreate(body) {
    setLoading(true);
    try {
      const b = await bookingsApi.create(body);
      setBookings((p) => [b, ...p]);
      setShowForm(false);
      notify("Reserva creada exitosamente.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(body) {
    setLoading(true);
    try {
      const updated = await bookingsApi.update(editBooking.id, body);
      setBookings((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      setEditBooking(null);
      notify("Reserva actualizada.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta reserva?")) return;
    try {
      await bookingsApi.remove(id);
      setBookings((p) => p.filter((x) => x.id !== id));
      notify("Reserva eliminada.");
    } catch (e) {
      notify(e.message, "error");
    }
  }

  async function handleStatusChange(id, status) {
    try {
      const updated = await bookingsApi.updateStatus(id, status);
      setBookings((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      notify(`Estado actualizado a "${STATUS_CONFIG[status]?.label ?? status}".`);
    } catch (e) {
      notify(e.message, "error");
    }
  }

  function handleLoaded(newBookings) {
    setBookings((prev) => {
      const map = new Map(prev.map((b) => [b.id, b]));
      newBookings.forEach((b) => map.set(b.id, b));
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.start_time) - new Date(a.start_time)
      );
    });
  }

  const filtered =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  return (
    <main>
      <Navbar />
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "ok" })} />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Módulo de Reservas
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gestiona las citas de paseo activas e historial
            </p>
          </div>
          <button
            onClick={() => { setShowForm((p) => !p); setEditBooking(null); }}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            {showForm ? "Cancelar" : "+ Nueva reserva"}
          </button>
        </div>

        {/* Form */}
        {(showForm || editBooking) && (
          <div className="mb-8 premium-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {editBooking ? "Editar reserva" : "Nueva reserva"}
            </h2>
            <BookingForm
              initial={editBooking}
              onSave={editBooking ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditBooking(null); }}
              loading={loading}
            />
          </div>
        )}

        <LookupPanel onLoaded={handleLoaded} />

        {/* Status filter tabs */}
        {bookings.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
            <button
              onClick={() => setFilterStatus("all")}
              className={`rounded-full px-3 py-1 transition ${filterStatus === "all" ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-100"}`}
            >
              Todas ({bookings.length})
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = bookings.filter((b) => b.status === key).length;
              if (!count) return null;
              return (
                <button key={key} onClick={() => setFilterStatus(key)}
                  className={`rounded-full border px-3 py-1 transition ${filterStatus === key ? cfg.color + " font-semibold" : "border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Cards */}
        {filtered.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onEdit={(bk) => { setEditBooking(bk); setShowForm(false); }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 premium-card p-10 text-center">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-slate-500 text-sm">
              {bookings.length
                ? "No hay reservas con ese estado."
                : "Busca reservas por ID, dueño o paseador, o crea una nueva."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
