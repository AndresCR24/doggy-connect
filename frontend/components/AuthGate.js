"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

/**
 * Envuelve contenido que requiere sesión activa.
 * Muestra un spinner mientras carga y un aviso de acceso si no está autenticado.
 */
export default function AuthGate({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
        <div className="premium-card p-10 text-center max-w-md space-y-6">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl">
            🔒
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Contenido exclusivo para miembros
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Inicia sesión o crea una cuenta para acceder a esta sección.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-50"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
