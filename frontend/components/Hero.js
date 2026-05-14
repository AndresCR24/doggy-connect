"use client";

import { useEffect, useState } from "react";
import { featuredDog } from "../lib/matchmaking";
import { createWalkRequest } from "../lib/walkRequests";
import DogPhoto from "./DogPhoto";

function IconSpark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3v2.25M12 18.75V21M3 12h2.25M18.75 12H21M5.64 5.64l1.59 1.59M16.77 16.77l1.59 1.59M5.64 18.36l1.59-1.59M16.77 7.23l1.59-1.59"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
    <section className="relative overflow-hidden bg-mesh-hero">
      <div
        className="pointer-events-none absolute inset-0 pattern-dots opacity-70 mix-blend-multiply"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 right-[-18%] h-[26rem] w-[26rem] animate-blob-soft rounded-full bg-brand-400/35 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-44 left-[-18%] h-[28rem] w-[28rem] animate-blob-soft rounded-full bg-indigo-400/30 blur-3xl [animation-delay:-6s]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[55%] top-20 hidden h-52 w-52 animate-blob-soft rounded-full bg-cyan-300/25 blur-3xl md:block [animation-delay:-3s]"
        aria-hidden="true"
      />

      <div
        className={`fixed right-4 top-[4.75rem] z-50 max-w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-emerald-300/90 bg-white/98 p-4 shadow-elevate-xl shadow-emerald-600/15 backdrop-blur-xl transition-all duration-300 ease-out-expo ${
          showToast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-bold text-white shadow-md">
            ✓
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Solicitud enviada</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Tu solicitud para pasear con {featuredDog.name} fue registrada.
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-300/70 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-800 shadow-md shadow-brand-500/10 backdrop-blur sm:text-[0.8rem]">
              <IconSpark className="h-4 w-4 shrink-0 text-brand-600" />
              Comunidad segura para mascotas
            </div>
            <h1 className="heading-display mt-8 text-balance text-[2.15rem] leading-[1.12] sm:text-5xl lg:text-[3.45rem] lg:leading-[1.06]">
              Matchmaking inteligente para paseos y citas caninas
            </h1>
            <p className="mt-6 max-w-xl border-l-[3px] border-brand-400 pl-5 text-[1.07rem] leading-relaxed text-ink-muted sm:text-lg">
              Crea el perfil de tu perro, sube sus fotos y conéctate con dueños
              que comparten tu ritmo de vida.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="/pet/register" className="btn-primary px-8 py-3.5 text-sm">
                Registrar Mascota
              </a>
              <a href="#match" className="btn-secondary px-8 py-3.5 text-sm">
                Ver Matchmaking
              </a>
            </div>
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-3 sm:gap-4">
              <div className="surface-card-static border-brand-200/40 p-4 text-center shadow-md ring-1 ring-brand-500/10 sm:p-5">
                <div className="bg-gradient-to-br from-brand-700 to-indigo-800 bg-clip-text text-xl font-black tabular-nums text-transparent sm:text-2xl">
                  +12k
                </div>
                <div className="mt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-ink-faint sm:text-[0.7rem]">
                  Perros activos
                </div>
              </div>
              <div className="surface-card-static border-brand-200/40 p-4 text-center shadow-md ring-1 ring-brand-500/10 sm:p-5">
                <div className="bg-gradient-to-br from-brand-700 to-indigo-800 bg-clip-text text-xl font-black tabular-nums text-transparent sm:text-2xl">
                  98%
                </div>
                <div className="mt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-ink-faint sm:text-[0.7rem]">
                  Match positivo
                </div>
              </div>
              <div className="surface-card-static border-brand-200/40 p-4 text-center shadow-md ring-1 ring-brand-500/10 sm:p-5">
                <div className="bg-gradient-to-br from-brand-700 to-indigo-800 bg-clip-text text-xl font-black tabular-nums text-transparent sm:text-2xl">
                  24/7
                </div>
                <div className="mt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-ink-faint sm:text-[0.7rem]">
                  Soporte
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade-in flex justify-center [animation-delay:90ms] md:justify-end">
            <div className="relative w-full max-w-[21rem] sm:max-w-[23rem]">
              <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-brand-400/45 via-indigo-400/25 to-cyan-300/15 blur-2xl" />
              <div className="absolute -right-10 -top-10 hidden h-28 w-28 rotate-6 rounded-[1.75rem] border border-white/70 bg-white/60 shadow-elevate-lg backdrop-blur-md md:block" />
              <div className="relative min-h-[23rem] rounded-[2rem] bg-gradient-to-br from-brand-500 via-violet-600 to-indigo-950 p-[3px] shadow-glow">
                <div className="relative flex flex-col gap-5 overflow-hidden rounded-[1.87rem] bg-white/[0.97] p-6 pt-7 shadow-inner backdrop-blur-sm md:min-h-[23rem]">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.35] pattern-dots-subtle"
                    aria-hidden="true"
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
                      Perfil destacado
                    </span>
                    <span className="badge-soft">{featuredDog.badge}</span>
                  </div>

                  <div className="relative mx-auto w-full max-w-[17rem] overflow-hidden rounded-[1.35rem] bg-slate-100 shadow-[0_12px_40px_-12px_rgba(91,33,182,0.22)] ring-[6px] ring-brand-100/90 aspect-[4/5] max-h-[280px] sm:max-h-[300px]">
                    <DogPhoto
                      dog={featuredDog}
                      fill
                      priority
                      imgClassName="object-cover object-[center_22%] scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5" />
                  </div>

                  <div className="relative flex flex-col gap-1 border-t border-slate-100/90 pt-5">
                    <div className="text-lg font-bold capitalize tracking-tight text-ink">
                      {featuredDog.name} · {featuredDog.age} años
                    </div>
                    <div className="text-sm text-ink-muted">
                      {featuredDog.breed} · Energía {featuredDog.energy}
                    </div>
                    <button
                      type="button"
                      onClick={handleWalkRequest}
                      className="btn-primary mt-5 w-full py-3 text-sm"
                    >
                      Solicitar paseo
                    </button>
                    {requestMessage ? (
                      <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/95 px-3 py-2.5 text-xs font-semibold leading-relaxed text-emerald-900">
                        {requestMessage}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
