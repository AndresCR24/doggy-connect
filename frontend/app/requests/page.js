"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { clearWalkRequests, listWalkRequests, removeWalkRequest, subscribeWalkRequests } from "../../lib/walkRequests";

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
    <main>
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Mis solicitudes</h1>
            <p className="mt-1 text-gray-600">Aquí verás las solicitudes que has enviado desde la app.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRequests(listWalkRequests())}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              Refrescar
            </button>
            <button
              type="button"
              onClick={() => clearWalkRequests()}
              disabled={requests.length === 0}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Limpiar
            </button>
            <a
              href="/"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              Volver
            </a>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="mt-10 premium-card p-6">
            <div className="text-sm text-gray-500">Aún no hay solicitudes</div>
            <div className="mt-2 text-gray-900 font-medium">
              Ve a matchmaking y presiona “Conectar” o “Solicitar paseo”.
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => {
              const dog = req?.dog || {};
              return (
                <article key={req.id} className="premium-card p-5 flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-3xl">
                    {dog?.avatar || "🐾"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-gray-900 truncate">{dog?.name || "Mascota"}</div>
                        <div className="text-sm text-gray-600 truncate">{dog?.breed || "—"}</div>
                      </div>
                      <div className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                        Pendiente
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {formatDate(req.createdAt)}
                      {req.source ? ` • ${req.source}` : ""}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Energía {dog?.energy || "—"}
                      {typeof dog?.distanceKm === "number" ? ` • ${dog.distanceKm} km` : ""}
                      {typeof dog?.compatibility === "number" ? ` • Compatibilidad ${dog.compatibility}%` : ""}
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => removeWalkRequest(req.id)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 transition hover:bg-rose-100"
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
      </section>
    </main>
  );
}

