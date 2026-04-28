"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { walkersApi, usersApi, bookingsApi } from "../../lib/apiClient";

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
        <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-700">✕</button>
      </div>
    </div>
  );
}

const VERIFICATION_COLORS = {
  pending:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const VERIFICATION_LABELS = {
  pending:  "Pendiente",
  approved: "Verificado ✓",
  rejected: "Rechazado",
};

function WalkerCard({ walker, userName, onMatch }) {
  const stars = Math.round(walker.rating || 0);
  return (
    <div className="premium-card p-5 flex flex-col gap-3 transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-300/40 shrink-0">
          🦮
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 truncate">
            {userName || walker.user_id}
          </p>
          <p className="text-xs text-slate-400 font-mono truncate">ID: {walker.id}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            VERIFICATION_COLORS[walker.estado_verificacion] ?? ""
          }`}
        >
          {VERIFICATION_LABELS[walker.estado_verificacion] ?? walker.estado_verificacion}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div className="rounded-lg bg-gray-100 px-3 py-2">
          <div className="text-gray-400 mb-0.5">Precio/hora</div>
          <div className="font-semibold text-slate-800">
            ${walker.precio_por_hora?.toLocaleString("es-CO")}
          </div>
        </div>
        <div className="rounded-lg bg-gray-100 px-3 py-2">
          <div className="text-gray-400 mb-0.5">Experiencia</div>
          <div className="font-semibold text-slate-800">
            {walker.experiencia_anios ?? 0} años
          </div>
        </div>
        <div className="rounded-lg bg-gray-100 px-3 py-2">
          <div className="text-gray-400 mb-0.5">Radio</div>
          <div className="font-semibold text-slate-800">{walker.radio_servicio_km} km</div>
        </div>
        <div className="rounded-lg bg-gray-100 px-3 py-2">
          <div className="text-gray-400 mb-0.5">Paseos</div>
          <div className="font-semibold text-slate-800">{walker.completed_walks ?? 0}</div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-amber-500">
        {"★".repeat(stars)}{"☆".repeat(5 - stars)}
        <span className="text-slate-400 ml-1">{(walker.rating || 0).toFixed(1)}</span>
      </div>

      <button
        onClick={() => onMatch(walker)}
        className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 py-2 text-sm text-white font-medium transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/40"
      >
        📅 Agendar Servicio
      </button>
    </div>
  );
}

function WalkerForm({ initial, onSave, onCancel, loading }) {
  const EMPTY = {
    user_id: "",
    precio_por_hora: "",
    experiencia_anios: "",
    radio_servicio_km: "5",
    verificado: false,
    estado_verificacion: "pending",
  };
  const [form, setForm] = useState(initial ?? EMPTY);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.user_id.trim()) e.user_id = "El user_id es requerido";
    if (!form.precio_por_hora || Number(form.precio_por_hora) <= 0)
      e.precio_por_hora = "El precio debe ser mayor a 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const body = {
      user_id: form.user_id.trim(),
      precio_por_hora: Number(form.precio_por_hora),
      radio_servicio_km: Number(form.radio_servicio_km) || 5,
      verificado: form.verificado,
      estado_verificacion: form.estado_verificacion,
    };
    if (form.experiencia_anios !== "")
      body.experiencia_anios = Number(form.experiencia_anios);
    onSave(body);
  }

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300";
  const errCls = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">User ID *</label>
        <input name="user_id" value={form.user_id} onChange={handleChange}
          placeholder="UUID del usuario paseador" className={inputCls} disabled={!!initial} />
        {errors.user_id && <p className={errCls}>{errors.user_id}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Precio/hora (COP) *</label>
          <input name="precio_por_hora" type="number" min="0" value={form.precio_por_hora}
            onChange={handleChange} placeholder="25000" className={inputCls} />
          {errors.precio_por_hora && <p className={errCls}>{errors.precio_por_hora}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Experiencia (años)</label>
          <input name="experiencia_anios" type="number" min="0" value={form.experiencia_anios}
            onChange={handleChange} placeholder="2" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Radio (km)</label>
          <input name="radio_servicio_km" type="number" min="1" value={form.radio_servicio_km}
            onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Estado verificación</label>
          <select name="estado_verificacion" value={form.estado_verificacion}
            onChange={handleChange} className={inputCls}>
            {["pending", "approved", "rejected"].map((v) => (
              <option key={v} value={v}>{VERIFICATION_LABELS[v]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 rounded-full bg-gray-900 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Guardando…" : initial ? "Actualizar paseador" : "Registrar paseador"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm text-gray-700 transition hover:bg-gray-100">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// Fecha mínima: hoy en formato YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function BookingModal({ walker, walkerName, onClose, onSend }) {
  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300";

  const [form, setForm] = useState({
    pet_id: "",
    owner_user_id: "",
    fecha: "",
    hora: "09:00",
    duration_minutes: "60",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!walker) return null;

  // Precio estimado
  const hours = Math.max(0, Number(form.duration_minutes) / 60);
  const precioEstimado = (walker.precio_por_hora || 0) * hours;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.pet_id.trim()) e.pet_id = "Requerido";
    if (!form.owner_user_id.trim()) e.owner_user_id = "Requerido";
    if (!form.fecha) e.fecha = "Selecciona una fecha";
    if (!form.hora) e.hora = "Selecciona una hora";
    if (!form.duration_minutes || Number(form.duration_minutes) < 30)
      e.duration_minutes = "Mínimo 30 minutos";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSend() {
    if (!validate()) return;
    setLoading(true);
    try {
      // Combinar fecha + hora → ISO 8601
      const start_time = new Date(`${form.fecha}T${form.hora}:00`).toISOString();
      await onSend({
        pet_id: form.pet_id.trim(),
        owner_user_id: form.owner_user_id.trim(),
        walker_user_id: walker.user_id,
        start_time,
        duration_minutes: Number(form.duration_minutes),
        price: precioEstimado,
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch (e) {
      setErrors((p) => ({ ...p, _general: e.message }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 overflow-y-auto"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md premium-card p-6 flex flex-col gap-4 my-4">
        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl shadow">
            🦮
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Agendar paseo</h3>
            <p className="text-xs text-slate-400">
              {walkerName || "Paseador"} · ${(walker.precio_por_hora || 0).toLocaleString("es-CO")}/hr
            </p>
          </div>
        </div>

        {/* IDs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ID mascota *</label>
            <input name="pet_id" value={form.pet_id} onChange={handleChange}
              placeholder="UUID mascota" className={inputCls} />
            {errors.pet_id && <p className="mt-0.5 text-xs text-red-600">{errors.pet_id}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ID dueño *</label>
            <input name="owner_user_id" value={form.owner_user_id} onChange={handleChange}
              placeholder="UUID usuario" className={inputCls} />
            {errors.owner_user_id && <p className="mt-0.5 text-xs text-red-600">{errors.owner_user_id}</p>}
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">📅 Fecha *</label>
            <input type="date" name="fecha" value={form.fecha} min={todayStr()}
              onChange={handleChange} className={inputCls} />
            {errors.fecha && <p className="mt-0.5 text-xs text-red-600">{errors.fecha}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">🕐 Hora *</label>
            <input type="time" name="hora" value={form.hora}
              onChange={handleChange} className={inputCls} />
            {errors.hora && <p className="mt-0.5 text-xs text-red-600">{errors.hora}</p>}
          </div>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">⏱ Duración (minutos) *</label>
          <div className="flex gap-2">
            {[30, 60, 90, 120].map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => setForm((p) => ({ ...p, duration_minutes: String(min) }))}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition ${
                  form.duration_minutes === String(min)
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {min >= 60 ? `${min / 60}h` : `${min}m`}
              </button>
            ))}
          </div>
          <input type="number" name="duration_minutes" value={form.duration_minutes}
            min="30" step="15" onChange={handleChange}
            className={`mt-2 ${inputCls}`} placeholder="O ingresa minutos manualmente" />
          {errors.duration_minutes && <p className="mt-0.5 text-xs text-red-600">{errors.duration_minutes}</p>}
        </div>

        {/* Precio estimado */}
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-indigo-600 font-medium">Precio estimado</span>
          <span className="text-lg font-extrabold text-indigo-700">
            ${precioEstimado.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Notas (opcional)</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
            placeholder="Instrucciones especiales para el paseador…"
            className={`resize-none ${inputCls}`} />
        </div>

        {errors._general && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{errors._general}</p>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-1">
          <button onClick={handleSend} disabled={loading}
            className="flex-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm text-white font-semibold transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/40 disabled:opacity-50">
            {loading ? "Agendando…" : "Confirmar reserva"}
          </button>
          <button onClick={onClose}
            className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm text-gray-700 transition hover:bg-gray-100">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaseadoresPage() {
  const [walkers, setWalkers] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [fetchingList, setFetchingList] = useState(true);
  const [lookupId, setLookupId] = useState("");
  const [lookupMode, setLookupMode] = useState("walker");
  const [showForm, setShowForm] = useState(false);
  const [matchTarget, setMatchTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "ok" });

  // Filters
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);

  function notify(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 3500);
  }

  useEffect(() => {
    walkersApi.list()
      .then(async (data) => {
        const list = Array.isArray(data) ? data : [];
        setWalkers(list);
        await enrichWithUserNames(list);
      })
      .catch((e) => notify(e.message, "error"))
      .finally(() => setFetchingList(false));
  }, []);

  async function enrichWithUserNames(list) {    const unknown = list.filter((w) => !userNames[w.user_id]).map((w) => w.user_id);
    if (!unknown.length) return;
    const results = await Promise.allSettled(unknown.map((id) => usersApi.get(id)));
    setUserNames((prev) => {
      const next = { ...prev };
      results.forEach((r, i) => {
        if (r.status === "fulfilled") next[unknown[i]] = r.value.nombre;
      });
      return next;
    });
  }

  async function handleLookup() {
    if (!lookupId.trim()) return;
    setFetchingList(true);
    try {
      let result;
      if (lookupMode === "walker") {
        result = [await walkersApi.get(lookupId.trim())];
      } else {
        result = await walkersApi.getByUser(lookupId.trim());
        if (!Array.isArray(result)) result = [result];
      }
      setWalkers((prev) => {
        const map = new Map(prev.map((w) => [w.id, w]));
        result.forEach((w) => map.set(w.id, w));
        return Array.from(map.values());
      });
      await enrichWithUserNames(result);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setFetchingList(false);
    }
  }

  async function handleCreate(body) {
    setFormLoading(true);
    try {
      const w = await walkersApi.create(body);
      setWalkers((p) => [w, ...p]);
      setShowForm(false);
      notify("Paseador registrado.");
      await enrichWithUserNames([w]);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleMatchSend(bookingBody) {
    const booking = await bookingsApi.create(bookingBody);
    notify(`✅ Paseo agendado para el ${new Date(booking.start_time ?? bookingBody.start_time).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })}`);
  }

  const filtered = useMemo(() => {
    return walkers.filter((w) => {
      if (onlyVerified && w.estado_verificacion !== "approved") return false;
      if (minPrice && w.precio_por_hora < Number(minPrice)) return false;
      if (maxPrice && w.precio_por_hora > Number(maxPrice)) return false;
      return true;
    });
  }, [walkers, onlyVerified, minPrice, maxPrice]);

  return (
    <main>
      <Navbar />
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "ok" })} />
      <BookingModal
        walker={matchTarget}
        walkerName={matchTarget ? userNames[matchTarget.user_id] : null}
        onClose={() => setMatchTarget(null)}
        onSend={handleMatchSend}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Explorar Paseadores
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Encuentra el paseador ideal para tu mascota
            </p>
          </div>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            {showForm ? "Cancelar" : "+ Registrar paseador"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 premium-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Registrar nuevo paseador</h2>
            <WalkerForm
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={formLoading}
            />
          </div>
        )}

        {/* Lookup + Filters */}
        <div className="premium-card p-5 flex flex-col gap-4 mb-8">
          <div className="flex gap-2 text-xs font-medium">
            {[
              { key: "walker", label: "Por Walker ID" },
              { key: "user", label: "Por User ID" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setLookupMode(t.key)}
                className={`rounded-full px-3 py-1 transition ${
                  lookupMode === t.key
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
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder={lookupMode === "walker" ? "UUID del paseador…" : "UUID del usuario…"}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={handleLookup}
              disabled={fetchingList || !lookupId.trim()}
              className="rounded-full bg-gray-900 px-5 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-50"
            >
              {fetchingList ? "…" : "Buscar"}
            </button>
          </div>

          {/* Filters */}
          {walkers.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-1 border-t border-gray-100 text-xs text-slate-600 items-center">
              <span className="font-medium text-slate-700">Filtros:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="accent-indigo-600"
                />
                Solo verificados
              </label>
              <div className="flex items-center gap-2">
                <span>Precio:</span>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Mín"
                  className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
                <span>–</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Máx"
                  className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
              </div>
              <span className="text-gray-400">({filtered.length} resultado{filtered.length !== 1 ? "s" : ""})</span>
            </div>
          )}
        </div>

        {/* Cards */}
        {fetchingList ? (
          <div className="text-center text-sm text-slate-400 py-10">Cargando paseadores…</div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((w) => (
              <WalkerCard
                key={w.id}
                walker={w}
                userName={userNames[w.user_id]}
                onMatch={setMatchTarget}
              />
            ))}
          </div>
        ) : (
          <div className="premium-card p-10 text-center">
            <div className="text-5xl mb-3">🦮</div>
            <p className="text-slate-500 text-sm">
              {walkers.length
                ? "Ningún paseador cumple los filtros actuales."
                : "No hay paseadores registrados aún."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
