"use client";

import { useEffect, useState } from "react";
import { featuredDog } from "../lib/matchmaking";
import { createWalkRequest } from "../lib/walkRequests";

export default function Hero() {
  const [requestMessage, setRequestMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  async function handleWalkRequest() {
    const { didCreate } = await createWalkRequest({ dog: featuredDog, source: "hero" });
    setRequestMessage(
      didCreate
        ? `Solicitud enviada con éxito. ${featuredDog.name} aparecerá en tus solicitudes activas.`
        : `Ya tienes una solicitud pendiente con ${featuredDog.name}.`
    );
    setShowToast(true);
  }

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 2800);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-white">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-purple-300/40 blur-3xl" />
      <div
        className={`fixed right-5 top-5 z-50 w-[22rem] rounded-2xl border border-emerald-200 bg-white/95 p-4 shadow-2xl shadow-emerald-200/50 backdrop-blur transition-all duration-300 ${
          showToast
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-700">✓</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Solicitud enviada</p>
            <p className="mt-1 text-sm text-slate-600">
              Tu solicitud para pasear con {featuredDog.name} fue registrada.
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-10 items-center relative">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-sm font-medium text-indigo-700 shadow-sm">
            Comunidad segura para mascotas
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Matchmaking inteligente para paseos y citas caninas
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">
            Crea el perfil de tu perro, sube sus fotos y conéctate con dueños
            que comparten tu ritmo de vida.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/pet/register"
              className="inline-flex items-center rounded-full bg-gray-900 px-6 py-3 text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              Registrar Mascota
            </a>
            <a
              href="#match"
              className="inline-flex items-center rounded-full border border-gray-300 bg-white/75 px-6 py-3 text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-100"
            >
              Ver Matchmaking
            </a>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            <div className="premium-card p-4">
              <div className="text-2xl font-semibold text-gray-900">+12k</div>
              <div className="text-xs text-gray-500">Perros activos</div>
            </div>
            <div className="premium-card p-4">
              <div className="text-2xl font-semibold text-gray-900">98%</div>
              <div className="text-xs text-gray-500">Match positivo</div>
            </div>
            <div className="premium-card p-4">
              <div className="text-2xl font-semibold text-gray-900">24/7</div>
              <div className="text-xs text-gray-500">Soporte</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="relative w-80 h-96">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-600 shadow-[0_25px_50px_-20px_rgba(79,70,229,0.55)]" />
            <div className="absolute inset-2 rounded-[1.75rem] bg-white/90 backdrop-blur-md p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Perfil destacado</div>
                <div className="text-xs rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
                  {featuredDog.badge}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-6xl">{featuredDog.avatar}</span>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {featuredDog.name} • {featuredDog.age} años
                </div>
                <div className="text-sm text-gray-500">
                  {featuredDog.breed} • Energía {featuredDog.energy}
                </div>
                <button
                  onClick={handleWalkRequest}
                  className="mt-4 w-full rounded-full bg-gray-900 py-2 text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
                >
                  Solicitar paseo
                </button>
                {requestMessage ? (
                  <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    {requestMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
