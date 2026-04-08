"use client";

import { useEffect, useMemo, useState } from "react";
import { getCompatibility, mockDogs } from "../lib/matchmaking";
import { createWalkRequest, subscribeWalkRequests } from "../lib/walkRequests";

function DogProfileModal({ dog, onClose, onConnect }) {
  useEffect(() => {
    if (!dog) return;

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dog, onClose]);

  if (!dog) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${dog.name}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg premium-card overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-6xl">{dog.avatar}</span>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm text-gray-700 transition hover:bg-white"
          >
            Cerrar
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                {dog.name}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{dog.breed}</p>
              <p className="mt-2 text-xs text-gray-500">
                {dog.age} años • Energía {dog.energy} • {dog.distanceKm} km
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
              Compatibilidad {dog.compatibility}%
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onConnect(dog)}
              className="flex-1 rounded-full bg-gray-900 text-white py-2 transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              Conectar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchCards() {
  const [preferredEnergy, setPreferredEnergy] = useState("todas");
  const [selectedDog, setSelectedDog] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(() => new Set());
  const [toast, setToast] = useState("");
  const [showToast, setShowToast] = useState(false);

  const visibleDogs = useMemo(() => {
    const isAll = preferredEnergy === "todas";
    const filteredDogs = mockDogs.filter(
      (dog) => isAll || dog.energy === preferredEnergy
    );

    const scoredDogs = filteredDogs.map((dog) => ({
      ...dog,
      compatibility: getCompatibility(dog, preferredEnergy)
    }));

    return scoredDogs.sort((a, b) => b.compatibility - a.compatibility);
  }, [preferredEnergy]);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 2600);
    return () => clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    return subscribeWalkRequests((nextRequests) => {
      setPendingRequests(
        new Set(
          nextRequests
            .filter((r) => r?.status === "pending")
            .map((r) => r?.dog?.id)
            .filter(Boolean)
        )
      );
    });
  }, []);

  async function requestConnect(dog) {
    const { didCreate } = await createWalkRequest({ dog, source: "match" });

    setPendingRequests((prev) => {
      const next = new Set(prev);
      next.add(dog.id);
      return next;
    });

    setToast(
      didCreate
        ? `Solicitud enviada a ${dog.name}. Te avisaremos si acepta.`
        : `Ya tienes una solicitud pendiente con ${dog.name}.`
    );
    setShowToast(true);
  }

  return (
    <section id="match" className="mx-auto max-w-6xl px-6 py-16">
      <div
        className={`fixed right-5 top-5 z-50 w-[22rem] rounded-2xl border border-emerald-200 bg-white/95 p-4 shadow-2xl shadow-emerald-200/50 backdrop-blur transition-all duration-300 ${
          showToast
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 pointer-events-none opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-700">
            ✓
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Listo</p>
            <p className="mt-1 text-sm text-slate-600">{toast}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Matchmaking</h2>
          <p className="text-gray-600 mt-1">
            Descubre compañeros de paseo cerca de ti
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 p-1 backdrop-blur">
          <button
            onClick={() => setPreferredEnergy("alta")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              preferredEnergy === "alta"
                ? "bg-gray-900 text-white shadow-lg shadow-slate-900/20"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Energía alta
          </button>
          <button
            onClick={() => setPreferredEnergy("todas")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              preferredEnergy === "todas"
                ? "bg-gray-900 text-white shadow-lg shadow-slate-900/20"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Ver todos
          </button>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleDogs.map((dog) => (
          (() => {
            const isRequested = pendingRequests.has(dog.id);

            return (
          <article
            key={dog.id}
            className="group premium-card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-24px_rgba(15,23,42,0.45)]"
          >
            <div className="relative h-44 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-6xl transition duration-300 group-hover:scale-110">
                {dog.avatar}
              </span>
              <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                {dog.compatibility}% match
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{dog.name}</h3>
                <span className="text-xs rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
                  {dog.age} años
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{dog.breed}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                  Energía {dog.energy}
                </span>
                <span>•</span>
                <span>{dog.distanceKm} km</span>
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => requestConnect(dog)}
                  className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                    isRequested
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : "bg-gray-900 text-white hover:-translate-y-0.5 hover:bg-gray-800"
                  }`}
                  aria-disabled={isRequested}
                  disabled={isRequested}
                >
                  {isRequested ? "Enviado" : "Conectar"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDog(dog)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Ver
                </button>
              </div>
            </div>
          </article>
            );
          })()
        ))}
      </div>

      <DogProfileModal
        dog={selectedDog}
        onClose={() => setSelectedDog(null)}
        onConnect={(dog) => {
          requestConnect(dog);
          setSelectedDog(null);
        }}
      />
    </section>
  );
}
