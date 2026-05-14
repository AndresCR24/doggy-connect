"use client";

import { useEffect, useMemo, useState } from "react";
import { getCompatibility, mockDogs } from "../lib/matchmaking";
import { createWalkRequest, subscribeWalkRequests } from "../lib/walkRequests";
import DogPhoto from "./DogPhoto";

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-4 backdrop-blur-md sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${dog.name}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="surface-card-static max-h-[min(90vh,40rem)] w-full max-w-lg animate-fade-in overflow-hidden rounded-3xl shadow-elevate-xl ring-2 ring-brand-400/25">
        <div className="relative h-52 w-full overflow-hidden bg-slate-900 sm:h-56">
          <DogPhoto
            dog={dog}
            fill
            imgClassName="object-cover object-[center_28%]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-[3] rounded-full border border-white/25 bg-white/95 px-3.5 py-1.5 text-sm font-semibold text-ink shadow-elevate backdrop-blur transition hover:bg-white"
          >
            Cerrar
          </button>
        </div>
        <div className="flex flex-col gap-6 p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h3 className="text-2xl font-bold capitalize tracking-tight text-ink">{dog.name}</h3>
              <p className="text-sm font-medium text-ink-muted">{dog.breed}</p>
              <p className="text-xs font-medium text-ink-faint">
                {dog.age} años · Energía {dog.energy} · {dog.distanceKm} km
              </p>
            </div>
            <div className="shrink-0 self-start rounded-full border border-brand-200/90 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800">
              Compatibilidad {dog.compatibility}%
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => onConnect(dog)}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              Conectar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 py-2.5 text-sm sm:flex-none sm:px-6"
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
    <section
      id="match"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-x-4 top-24 rounded-[2rem] pattern-dots-subtle opacity-40 sm:inset-x-8"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute left-[8%] top-8 h-44 w-44 animate-blob-soft rounded-full bg-brand-400/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-[5%] h-52 w-52 animate-blob-soft rounded-full bg-indigo-400/14 blur-3xl [animation-delay:-5s]" />

      <div
        className={`fixed right-4 top-[4.5rem] z-50 max-w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-emerald-200/90 bg-white/95 p-4 shadow-elevate-lg shadow-emerald-500/10 backdrop-blur-xl transition-all duration-300 ease-out-expo ${
          showToast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200/70">
            ✓
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Listo</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{toast}</p>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="heading-display text-balance text-3xl sm:text-[2.35rem]">
            Matchmaking
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
            Descubre compañeros de paseo cerca de ti
          </p>
        </div>
        <div
          className="inline-flex shrink-0 rounded-2xl border border-slate-200/90 bg-white/90 p-1.5 shadow-elevate backdrop-blur-md"
          role="group"
          aria-label="Filtro de energía"
        >
          <button
            type="button"
            onClick={() => setPreferredEnergy("alta")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              preferredEnergy === "alta" ? "filter-pill-active" : "filter-pill-idle"
            }`}
          >
            Energía alta
          </button>
          <button
            type="button"
            onClick={() => setPreferredEnergy("todas")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              preferredEnergy === "todas" ? "filter-pill-active" : "filter-pill-idle"
            }`}
          >
            Ver todos
          </button>
        </div>
      </div>

      <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleDogs.map((dog, i) => {
          const isRequested = pendingRequests.has(dog.id);

          return (
            <article
              key={dog.id}
              className="group surface-card relative overflow-hidden rounded-3xl hover:-translate-y-2 hover:shadow-elevate-xl"
            >
              <div className="relative aspect-[5/4] w-full overflow-hidden bg-slate-200 sm:aspect-auto sm:h-52">
                <DogPhoto
                  dog={dog}
                  fill
                  priority={i < 4}
                  imgClassName="object-cover transition duration-700 ease-out-expo group-hover:scale-[1.06]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/15" />
                <div className="absolute left-3 top-3 z-[2] rounded-full border border-white/35 bg-white/95 px-3 py-1 text-xs font-bold text-ink shadow-sm backdrop-blur">
                  {dog.compatibility}% match
                </div>
              </div>
              <div className="flex flex-col gap-4 p-6 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-lg font-bold tracking-tight text-ink">{dog.name}</h3>
                  <span className="shrink-0 rounded-full border border-brand-200/90 bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                    {dog.age} años
                  </span>
                </div>
                <p className="-mt-1 text-sm font-medium text-ink-muted">{dog.breed}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-ink-muted">
                    Energía {dog.energy}
                  </span>
                  <span className="inline-flex rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-faint">
                    {dog.distanceKm} km
                  </span>
                </div>
                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => requestConnect(dog)}
                    className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ease-out-expo ${
                      isRequested
                        ? "cursor-default border border-emerald-300/60 bg-emerald-600 text-white shadow-inner"
                        : "btn-primary py-2.5"
                    }`}
                    aria-disabled={isRequested}
                    disabled={isRequested}
                  >
                    {isRequested ? "Enviado" : "Conectar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDog(dog)}
                    className="btn-ghost shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold"
                  >
                    Ver
                  </button>
                </div>
              </div>
            </article>
          );
        })}
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
