"use client";

import { useState, useCallback } from "react";
import { usersApi, walkersApi, petsApi, authApi } from "../lib/apiClient";

// ─── Constantes ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Tu perfil" },
  { id: 2, label: "Rol" },
  { id: 3, label: "Mascotas" },
];

const EMPTY_USER = {
  nombre: "",
  email: "",
  contraseña: "",
  confirmar: "",
  telefono: "",
  ciudad: "",
};

const EMPTY_WALKER = {
  precio_por_hora: "",
  experiencia_anios: "0",
  radio_servicio_km: "5",
};

const newPet = () => ({
  nombre: "",
  especie: "dog",
  raza: "",
  edad: "",
  genero: "No especificado",
  file: null,
  preview: "",
});

// ─── Componentes de UI genéricos ────────────────────────────────────────────

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const selectCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none";

// ─── Indicador de progreso ───────────────────────────────────────────────────

function StepIndicator({ currentStep, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, idx) => {
        const done = currentStep > s.id;
        const active = currentStep === s.id;
        return (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? "bg-indigo-600 text-white"
                    : active
                    ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? "✓" : s.id}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block ${
                  active ? "text-indigo-600" : done ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mb-4 transition-all duration-300 ${
                  currentStep > s.id ? "bg-indigo-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Paso 1: Datos personales ────────────────────────────────────────────────

function StepProfile({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tu información personal</h2>
        <p className="text-sm text-gray-500 mt-1">Cuéntanos quién eres para crear tu perfil.</p>
      </div>
      <Field label="Nombre completo" required error={errors.nombre}>
        <input
          type="text"
          name="nombre"
          value={data.nombre}
          onChange={onChange}
          placeholder="María García"
          className={inputCls}
          autoComplete="name"
        />
      </Field>
      <Field label="Correo electrónico" required error={errors.email}>
        <input
          type="email"
          name="email"
          value={data.email}
          onChange={onChange}
          placeholder="maria@ejemplo.com"
          className={inputCls}
          autoComplete="email"
        />
      </Field>
      <Field label="Contraseña" required error={errors.contraseña}>
        <input
          type="password"
          name="contraseña"
          value={data.contraseña}
          onChange={onChange}
          placeholder="Mínimo 6 caracteres"
          className={inputCls}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Confirmar contraseña" required error={errors.confirmar}>
        <input
          type="password"
          name="confirmar"
          value={data.confirmar}
          onChange={onChange}
          placeholder="Repite tu contraseña"
          className={inputCls}
          autoComplete="new-password"
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Teléfono" error={errors.telefono}>
          <input
            type="tel"
            name="telefono"
            value={data.telefono}
            onChange={onChange}
            placeholder="+57 300 000 0000"
            className={inputCls}
            autoComplete="tel"
          />
        </Field>
        <Field label="Ciudad" error={errors.ciudad}>
          <input
            type="text"
            name="ciudad"
            value={data.ciudad}
            onChange={onChange}
            placeholder="Bogotá"
            className={inputCls}
            autoComplete="address-level2"
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Paso 2: Rol ─────────────────────────────────────────────────────────────

function StepRole({ isWalker, onToggle, walkerData, onWalkerChange, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tu rol en la comunidad</h2>
        <p className="text-sm text-gray-500 mt-1">
          Puedes ser dueño de mascotas, paseador, o ambas cosas.
        </p>
      </div>

      {/* Toggle paseador */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between rounded-2xl border-2 p-5 text-left transition duration-200 ${
          isWalker
            ? "border-indigo-500 bg-indigo-50/70"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition ${
              isWalker ? "bg-indigo-100" : "bg-gray-100"
            }`}
          >
            🦮
          </div>
          <div>
            <p className="font-semibold text-gray-900">Soy paseador de mascotas</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Ofrece tus servicios a dueños de mascotas
            </p>
          </div>
        </div>
        {/* Radio visual */}
        <div
          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
            isWalker ? "border-indigo-500 bg-indigo-500" : "border-gray-300 bg-white"
          }`}
        >
          {isWalker && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </button>

      {/* Campos de paseador */}
      {isWalker && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 space-y-5">
          <p className="text-sm font-semibold text-indigo-800">Configura tu servicio de paseo</p>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Precio por hora (COP)" required error={errors.precio_por_hora}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  name="precio_por_hora"
                  value={walkerData.precio_por_hora}
                  onChange={onWalkerChange}
                  min="1"
                  placeholder="25000"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-7 pr-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </Field>
            <Field label="Años de experiencia" error={errors.experiencia_anios}>
              <input
                type="number"
                name="experiencia_anios"
                value={walkerData.experiencia_anios}
                onChange={onWalkerChange}
                min="0"
                max="50"
                placeholder="2"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </Field>
          </div>
          <Field label={`Radio de servicio: ${walkerData.radio_servicio_km} km`}>
            <input
              type="range"
              name="radio_servicio_km"
              value={walkerData.radio_servicio_km}
              onChange={onWalkerChange}
              min="1"
              max="30"
              className="w-full accent-indigo-600 mt-1"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 km</span>
              <span>30 km</span>
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

// ─── Formulario de mascota individual ───────────────────────────────────────

function PetForm({ pet, index, onChangePet, onRemove, canRemove, error }) {
  function handleChange(e) {
    const { name, value } = e.target;
    onChangePet(index, { ...pet, [name]: value });
  }

  function handleFile(e) {
    const file = e.target.files?.[0] ?? null;
    const preview = file ? URL.createObjectURL(file) : "";
    onChangePet(index, { ...pet, file, preview });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 transition hover:border-gray-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{pet.especie === "cat" ? "🐱" : "🐕"}</span>
          <p className="font-semibold text-gray-900">
            {pet.nombre ? pet.nombre : `Mascota ${index + 1}`}
          </p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs text-red-400 hover:text-red-600 transition font-medium"
          >
            Eliminar
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            value={pet.nombre}
            onChange={handleChange}
            placeholder="Max"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Especie <span className="text-red-400">*</span>
          </label>
          <select
            name="especie"
            value={pet.especie}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none"
          >
            <option value="dog">Perro 🐕</option>
            <option value="cat">Gato 🐱</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Raza</label>
          <input
            type="text"
            name="raza"
            value={pet.raza}
            onChange={handleChange}
            placeholder="Labrador"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Edad (años)</label>
          <input
            type="number"
            name="edad"
            value={pet.edad}
            onChange={handleChange}
            min="0"
            max="30"
            placeholder="3"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Género</label>
          <select
            name="genero"
            value={pet.genero}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none"
          >
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
            <option value="No especificado">No especificado</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Foto <span className="text-gray-400">(opcional)</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 transition">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {pet.preview ? (
              <img
                src={pet.preview}
                alt="preview"
                className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <span className="text-gray-400 text-xl flex-shrink-0">📷</span>
            )}
            <span className="text-xs text-gray-500 truncate">
              {pet.file ? pet.file.name : "Seleccionar foto"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── Paso 3: Mascotas ────────────────────────────────────────────────────────

function StepPets({ pets, onChangePet, onAddPet, onRemovePet, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tus mascotas</h2>
        <p className="text-sm text-gray-500 mt-1">
          Agrega al menos una mascota para completar tu registro.
        </p>
      </div>

      {errors.pets && (
        <p className="text-sm text-red-500 font-medium">{errors.pets}</p>
      )}

      <div className="space-y-4">
        {pets.map((pet, i) => (
          <PetForm
            key={i}
            pet={pet}
            index={i}
            onChangePet={onChangePet}
            onRemove={onRemovePet}
            canRemove={pets.length > 1}
            error={errors[`pet_${i}`]}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddPet}
        className="w-full rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition flex items-center justify-center gap-2"
      >
        <span className="text-lg leading-none">+</span>
        Agregar otra mascota
      </button>
    </div>
  );
}

// ─── Pantalla de confirmación de email ─────────────────────────────────────

function ConfirmEmailScreen({ email, onConfirmed }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  async function handleConfirm(e) {
    e.preventDefault();
    if (!code.trim()) { setError("Introduce el código"); return; }
    setLoading(true);
    setError("");
    try {
      await authApi.confirm(email, code.trim());
      onConfirmed();
    } catch (err) {
      setError(err.message || "Código incorrecto. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResent(false);
    setError("");
    try {
      await authApi.resendCode(email);
      setResent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="text-center space-y-6 py-4">
      <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-4xl">
        📧
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Confirma tu correo</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
          Enviamos un código de 6 dígitos a{" "}
          <span className="font-semibold text-indigo-700">{email}</span>.
          Revísalo e intróducelo a continuación.
        </p>
      </div>
      <form onSubmit={handleConfirm} className="space-y-4 max-w-xs mx-auto">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          placeholder="123456"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {resent && <p className="text-sm text-emerald-600">✓ Código reenviado</p>}
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full rounded-full bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Verificando…" : "Confirmar cuenta"}
        </button>
      </form>
      <button
        type="button"
        onClick={handleResend}
        className="text-sm text-indigo-600 hover:underline"
      >
        ¿No recibiste el código? Reenviar
      </button>
    </div>
  );
}

// ─── Pantalla de éxito ───────────────────────────────────────────────────────

function SuccessScreen({ userName, petCount }) {
  return (
    <div className="text-center space-y-6 py-6">
      <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl">
        🎉
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">¡Registro exitoso!</h3>
        <p className="mt-2 text-gray-600 max-w-sm mx-auto">
          Bienvenido,{" "}
          <span className="font-semibold text-indigo-700">{userName}</span>. Tu perfil y{" "}
          {petCount === 1 ? "tu mascota han" : `tus ${petCount} mascotas han`} sido registrados.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <a
          href="/mascotas"
          className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
        >
          Ver mis mascotas
        </a>
        <a
          href="/match"
          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-50"
        >
          💞 Hacer match
        </a>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
}

// ─── Wizard principal ────────────────────────────────────────────────────────

export default function RegisterWizard() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false); // pantalla de confirmar email

  const [userData, setUserData] = useState(EMPTY_USER);
  const [isWalker, setIsWalker] = useState(false);
  const [walkerData, setWalkerData] = useState(EMPTY_WALKER);
  const [pets, setPets] = useState([newPet()]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Resultado del registro
  const [createdUserName, setCreatedUserName] = useState("");

  // ── Handlers de cambio ──
  function handleUserChange(e) {
    const { name, value } = e.target;
    setUserData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function handleWalkerChange(e) {
    const { name, value } = e.target;
    setWalkerData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  const handleChangePet = useCallback((index, updatedPet) => {
    setPets((prev) => prev.map((p, i) => (i === index ? updatedPet : p)));
  }, []);

  function handleAddPet() {
    setPets((p) => [...p, newPet()]);
  }

  function handleRemovePet(index) {
    setPets((p) => p.filter((_, i) => i !== index));
  }

  // ── Validación por paso ──
  function validateStep1() {
    const e = {};
    if (!userData.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!userData.email.trim()) {
      e.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      e.email = "Introduce un correo válido";
    }
    if (!userData.contraseña) {
      e.contraseña = "La contraseña es requerida";
    } else if (userData.contraseña.length < 6) {
      e.contraseña = "La contraseña debe tener al menos 6 caracteres";
    }
    if (!userData.confirmar) {
      e.confirmar = "Confirma tu contraseña";
    } else if (userData.contraseña !== userData.confirmar) {
      e.confirmar = "Las contraseñas no coinciden";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    if (!isWalker) return true;
    const e = {};
    const precio = parseFloat(walkerData.precio_por_hora);
    if (!walkerData.precio_por_hora || isNaN(precio) || precio <= 0) {
      e.precio_por_hora = "Introduce un precio válido (mayor a 0)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep3() {
    const e = {};
    let valid = true;
    pets.forEach((pet, i) => {
      if (!pet.nombre.trim()) {
        e[`pet_${i}`] = "El nombre de la mascota es requerido";
        valid = false;
      }
    });
    if (pets.length === 0) {
      e.pets = "Agrega al menos una mascota";
      valid = false;
    }
    setErrors(e);
    return valid;
  }

  // ── Navegación ──
  function goNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    setStep((s) => s + 1);
  }

  function goBack() {
    setGlobalError("");
    setErrors({});
    setStep((s) => s - 1);
  }

  // ── Envío final ──
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setGlobalError("");

    try {
      // 1. Registrar credenciales en Cognito
      await authApi.register({
        email: userData.email.trim(),
        password: userData.contraseña,
        nombre: userData.nombre.trim(),
      });

      // 2. Crear perfil en DynamoDB (microservicio users)
      const role = isWalker ? "walker" : "owner";
      const userPayload = {
        nombre: userData.nombre.trim(),
        email: userData.email.trim(),
        role,
        ...(userData.telefono.trim() && { telefono: userData.telefono.trim() }),
        ...(userData.ciudad.trim() && { ciudad: userData.ciudad.trim() }),
      };
      const user = await usersApi.create(userPayload);

      // 3. Crear perfil de paseador si aplica
      if (isWalker) {
        const walkerPayload = {
          user_id: user.id,
          precio_por_hora: parseFloat(walkerData.precio_por_hora),
          experiencia_anios: parseInt(walkerData.experiencia_anios) || 0,
          radio_servicio_km: parseInt(walkerData.radio_servicio_km) || 5,
        };
        await walkersApi.create(walkerPayload);
      }

      // 4. Crear mascotas
      for (const pet of pets) {
        const petPayload = {
          owner_id: user.id,
          nombre: pet.nombre.trim(),
          especie: pet.especie,
          ...(pet.raza.trim() && { raza: pet.raza.trim() }),
          ...(pet.edad !== "" && { edad: parseInt(pet.edad) }),
          ...(pet.genero && pet.genero !== "No especificado" && { genero: pet.genero }),
        };
        await petsApi.create(petPayload);
      }

      setCreatedUserName(userData.nombre.trim());
      // Mostrar pantalla de confirmación de email (Cognito envía código)
      setNeedsConfirm(true);
    } catch (err) {
      setGlobalError(err.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──
  if (needsConfirm && !done) {
    return (
      <ConfirmEmailScreen
        email={userData.email.trim()}
        onConfirmed={() => { setNeedsConfirm(false); setDone(true); }}
      />
    );
  }

  if (done) {
    return <SuccessScreen userName={createdUserName} petCount={pets.length} />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepIndicator currentStep={step} total={STEPS.length} />

      <div className="min-h-[320px]">
        {step === 1 && (
          <StepProfile data={userData} onChange={handleUserChange} errors={errors} />
        )}
        {step === 2 && (
          <StepRole
            isWalker={isWalker}
            onToggle={() => setIsWalker((v) => !v)}
            walkerData={walkerData}
            onWalkerChange={handleWalkerChange}
            errors={errors}
          />
        )}
        {step === 3 && (
          <StepPets
            pets={pets}
            onChangePet={handleChangePet}
            onAddPet={handleAddPet}
            onRemovePet={handleRemovePet}
            errors={errors}
          />
        )}
      </div>

      {globalError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            ← Atrás
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            Continuar →
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Registrando...
              </>
            ) : (
              "Crear cuenta 🐾"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
