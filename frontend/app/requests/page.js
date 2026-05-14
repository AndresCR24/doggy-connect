"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import DogPhoto from "../../components/DogPhoto";
import { clearWalkRequests, listWalkRequests, removeWalkRequest, subscribeWalkRequests } from "../../lib/walkRequests";

function IconClipboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 5h-.75a2.25 2.25 0 0 0-2.25 2.25v11A2.25 2.25 0 0 0 8.25 20.5h7.5a2.25 2.25 0 0 0 2.25-2.25v-11A2.25 2.25 0 0 0 15.75 5H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 6.75h6v-.75a2.25 2.25 0 0 0-4.5 0v.75Zm3-3v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.75 12.75h4.5M9.75 15.75h4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconRefresh(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.5 9.75v4.5m0-4.5a7.5 7.5 0 0 1 13.03-5.03M19.5 14.25v-4.5m0 4.5a7.5 7.5 0 0 1-13.03 5.03"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9.75 10.75v6m4.5-6v6M5 8.25h14m-11.75 0-.442 10.167a1.5 1.5 0 0 0 1.497 1.583h8.39a1.5 1.5 0 0 0 1.497-1.583L16.75 8.25m-6 0V6a1.5 1.5 0 0 1 1.5-1.5h1.5A1.5 1.5 0 0 1 15 6v2.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrowLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDate(ms) {
  try {
    return new Date(ms).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    setRequests(listWalkRequests());
    return subscribeWalkRequests((next) => setRequests(next));
  }, []);

  return (
    <main className="relative min-h-[calc(100vh-4rem)]">
      <Navbar />
      <section className="relative overflow-hidden bg-mesh-hero pb-24 pt-10 sm:pt-14">
        <div
          className="pointer-events-none absolute inset-0 pattern-dots opacity-[0.52] mix-blend-multiply"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 top-8 h-72 w-72 animate-blob-soft rounded-full bg-brand-400/18 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-[-15%] top-40 h-64 w-64 animate-blob-soft rounded-full bg-indigo-400/14 blur-3xl [animation-delay:-6s]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-24 right-[10%] h-52 w-52 animate-blob-soft rounded-full bg-violet-300/14 blur-3xl [animation-delay:-3s]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl lg:pt-1">
              <div className="inline-flex items-center rounded-full border border-brand-300/85 bg-white/95 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-800 shadow-md shadow-brand-500/12 ring-1 ring-white/70 backdrop-blur sm:text-[0.68rem]">
                Bandeja
              </div>
              <h1 className="heading-display mt-6 text-balance text-[2rem] leading-tight sm:text-[2.55rem]">
                Mis solicitudes
              </h1>
              <p className="mt-5 max-w-xl border-l-[3px] border-brand-400/90 pl-5 text-[1.02rem] leading-relaxed text-ink-muted">
                Aquí verás las solicitudes que has enviado desde la app.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200/85 bg-white/95 p-1.5 shadow-elevate-lg shadow-brand-500/5 backdrop-blur-xl ring-1 ring-white/80 lg:mt-2 lg:shrink-0">
              <button
                type="button"
                onClick={() => setRequests(listWalkRequests())}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-xs font-semibold text-ink-muted transition duration-200 hover:border-brand-200/80 hover:bg-brand-50/60 hover:text-ink active:scale-[0.98] sm:text-sm"
              >
                <IconRefresh className="h-4 w-4 shrink-0 text-brand-600" />
                Refrescar
              </button>
              <span
                className="hidden h-7 w-px shrink-0 self-center bg-gradient-to-b from-transparent via-slate-200 to-transparent sm:block"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => clearWalkRequests()}
                disabled={requests.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-xs font-semibold text-ink-muted transition duration-200 hover:border-rose-200/90 hover:bg-rose-50/50 hover:text-rose-950 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-transparent disabled:hover:bg-transparent sm:text-sm"
              >
                <IconTrash className="h-4 w-4 shrink-0 text-rose-500/95" />
                Limpiar
              </button>
              <span
                className="hidden h-7 w-px shrink-0 self-center bg-gradient-to-b from-transparent via-slate-200 to-transparent sm:block"
                aria-hidden="true"
              />
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-xs font-semibold text-ink-muted transition duration-200 hover:border-slate-200 hover:bg-slate-50 hover:text-ink active:scale-[0.98] sm:text-sm"
              >
                <IconArrowLeft className="h-4 w-4 shrink-0 text-brand-600" />
                Volver
              </a>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="relative mx-auto mt-16 max-w-2xl">
              <div
                className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-brand-400/18 via-transparent to-indigo-400/12 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-brand-500/20 via-violet-500/10 to-transparent opacity-60 blur-xl"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/[0.97] px-8 py-[3.75rem] text-center shadow-[0_1px_0_rgba(255,255,255,0.92)_inset,0_36px_70px_-36px_rgba(91,33,182,0.22),0_16px_32px_-18px_rgba(15,23,42,0.1)] ring-1 ring-slate-900/[0.035] backdrop-blur-[2px] motion-safe:animate-[fade-in_0.55s_ease-out_both] sm:px-12 sm:py-20">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r from-brand-400 via-violet-500 to-indigo-500"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -right-28 -top-28 h-48 w-48 rounded-full bg-brand-400/[0.09] blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-indigo-400/[0.08] blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.32] pattern-dots-subtle"
                  aria-hidden="true"
                />

                <div className="relative mx-auto flex max-w-md flex-col items-center">
                  <div className="relative">
                    <div
                      className="absolute inset-[-10px] rounded-[1.85rem] bg-gradient-to-br from-brand-400/45 to-indigo-500/35 opacity-75 blur-xl"
                      aria-hidden="true"
                    />
                    <div className="relative flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-brand-500 via-violet-600 to-indigo-800 text-white shadow-[0_20px_44px_-14px_rgba(109,40,217,0.62)] ring-[7px] ring-brand-50/95">
                      <div
                        className="pointer-events-none absolute inset-[2px] rounded-[1.2rem] ring-1 ring-white/35"
                        aria-hidden="true"
                      />
                      <IconClipboard className="relative h-11 w-11" strokeWidth={1.6} />
                    </div>
                  </div>
                  <p className="mt-9 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-ink-faint">
                    Sin actividad
                  </p>
                  <p className="mt-2.5 bg-gradient-to-br from-slate-800 via-violet-950 to-indigo-900 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-[1.35rem]">
                    Aún no hay solicitudes
                  </p>
                  <p className="mt-4 max-w-[22rem] text-balance text-[0.98rem] leading-relaxed text-ink-muted sm:text-base">
                    Ve a matchmaking y presiona{" "}
                    <span className="font-semibold text-ink">“Conectar”</span> o{" "}
                    <span className="font-semibold text-ink">“Solicitar paseo”</span>.
                  </p>
                  <div className="mt-6 h-px w-full max-w-[14rem] bg-gradient-to-r from-transparent via-brand-300/50 to-transparent sm:max-w-xs" aria-hidden />
                  <div className="mt-8 flex w-full flex-col gap-3.5 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
                    <a href="/#match" className="btn-primary flex-1 px-8 py-3 text-sm sm:flex-none">
                      Ir al matchmaking
                    </a>
                    <a href="/" className="btn-secondary flex-1 px-8 py-3 text-sm sm:flex-none">
                      Volver al inicio
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
              {requests.map((req) => {
                const dog = req?.dog || {};
                return (
                  <article
                    key={req.id}
                    className="group surface-card flex animate-fade-in gap-5 p-6 sm:p-7"
                  >
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 rounded-[1.15rem] bg-gradient-to-br from-brand-400/35 to-indigo-500/25 opacity-0 blur-md transition duration-300 group-hover:opacity-100" />
                    <div className="relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-2xl bg-slate-200 shadow-elevate-lg ring-2 ring-white">
                      <DogPhoto dog={dog} fill imgClassName="object-cover" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-bold tracking-tight text-ink">
                          {dog?.name || "Mascota"}
                        </div>
                        <div className="truncate text-sm font-medium text-ink-muted">
                          {dog?.breed || "—"}
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full border border-emerald-200/90 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-800 shadow-sm">
                        Pendiente
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[0.72rem] font-medium text-ink-faint">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/90 px-2 py-1 text-ink-muted">
                        <span className="tabular-nums">{formatDate(req.createdAt)}</span>
                      </span>
                      {req.source ? (
                        <span className="rounded-lg bg-brand-50 px-2 py-1 font-semibold text-brand-800">
                          {req.source}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-xs font-medium leading-relaxed text-ink-faint">
                      Energía {dog?.energy || "—"}
                      {typeof dog?.distanceKm === "number" ? ` • ${dog.distanceKm} km` : ""}
                      {typeof dog?.compatibility === "number"
                        ? ` • Compatibilidad ${dog.compatibility}%`
                        : ""}
                    </p>
                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => removeWalkRequest(req.id)}
                        className="rounded-full border border-rose-200/95 bg-gradient-to-b from-rose-50 to-white px-5 py-2 text-xs font-semibold text-rose-800 shadow-sm transition hover:border-rose-300 hover:from-rose-100 hover:shadow-md"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        </div>
      </section>
    </main>
  );
}
