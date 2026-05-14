"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Redirigir si ya hay sesión
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/perfil");
    }
  }, [loading, isAuthenticated, router]);

  function validate() {
    const e = {};
    if (!email.trim()) {
      e.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Introduce un correo válido";
    }
    if (!password) {
      e.password = "La contraseña es requerida";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push("/perfil");
    } catch (err) {
      const msg = err.message ?? "Error al iniciar sesión";
      if (msg.toLowerCase().includes("correo") || msg.toLowerCase().includes("usuario") || msg.toLowerCase().includes("perfil")) {
        setErrors((p) => ({ ...p, email: msg }));
      } else if (msg.toLowerCase().includes("contraseña") || msg.toLowerCase().includes("incorrectos") || msg.toLowerCase().includes("notauthorized")) {
        setErrors((p) => ({ ...p, password: "Correo o contraseña incorrectos" }));
      } else if (msg.toLowerCase().includes("confirm")) {
        setGlobalError("Debes confirmar tu cuenta primero. Revisa tu correo electrónico.");
      } else {
        setGlobalError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-indigo-50/40 to-white flex flex-col">
      {/* Decoración */}
      <div className="fixed -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-28 -left-28 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl pointer-events-none" />

      {/* Header mínimo */}
      <header className="relative z-10 sticky top-0 w-full border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-400/40">
              🐾
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-900">Doggy Connect & Walk</span>
          </Link>
          <Link
            href="/registro"
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Crear cuenta
          </Link>
        </div>
      </header>

      {/* Contenido */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Marca */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl shadow-xl shadow-indigo-300/40 mb-4">
              🐾
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Bienvenido de nuevo</h1>
            <p className="mt-1.5 text-sm text-slate-500">Ingresa a tu cuenta para gestionar tus mascotas</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="premium-card p-7 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  setGlobalError("");
                }}
                placeholder="tu@correo.com"
                autoComplete="email"
                className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-1 ${
                  errors.email
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-300"
                    : "border-gray-200 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña <span className="text-red-400">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    setGlobalError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm transition focus:outline-none focus:ring-1 ${
                    errors.password
                      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-300"
                      : "border-gray-200 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  tabIndex={-1}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Error global */}
            {globalError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {globalError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-indigo-600 hover:underline">
              Regístrate gratis
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
