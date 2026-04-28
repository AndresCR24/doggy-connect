"use client";

import { useEffect, useMemo, useState } from "react";
import { buildUrl, DEFAULT_SERVICE_URLS, SERVICES } from "../lib/backendCatalog";

const STORAGE_KEY = "doggy_backend_service_urls_v1";

function pretty(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function readStoredUrls() {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function ServiceUrlForm({ serviceUrls, onChange }) {
  return (
    <section className="premium-card p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-600">
            Configuracion
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            URLs de microservicios
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Asigna la URL base de cada servicio desplegado o ejecutado con serverless offline.
            Se guarda en tu navegador para no volver a escribirla.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ejemplo: http://localhost:3000 o tu endpoint de API Gateway.
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {SERVICES.map((service) => (
          <label key={service.id} className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{service.title}</span>
            <input
              type="url"
              value={serviceUrls[service.id] || ""}
              onChange={(event) => onChange(service.id, event.target.value)}
              placeholder="https://tu-servicio.execute-api..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function EndpointCard({ endpoint, baseUrl }) {
  const initialParams = useMemo(
    () => Object.fromEntries((endpoint.params || []).map((param) => [param.name, ""])),
    [endpoint.params]
  );
  const initialBody = useMemo(() => pretty(endpoint.bodyTemplate), [endpoint.bodyTemplate]);

  const [params, setParams] = useState(initialParams);
  const [bodyText, setBodyText] = useState(initialBody);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setParams(initialParams);
    setBodyText(initialBody);
    setResponse(null);
  }, [initialParams, initialBody, endpoint.id]);

  async function executeRequest() {
    if (!baseUrl.trim()) {
      setResponse({
        ok: false,
        status: "Sin URL",
        data: "Configura primero la URL base del microservicio."
      });
      return;
    }

    const missingParam = (endpoint.params || []).find((param) => !String(params[param.name] || "").trim());
    if (missingParam) {
      setResponse({
        ok: false,
        status: "Parametro faltante",
        data: `Completa el campo ${missingParam.label.toLowerCase()}.`
      });
      return;
    }

    let parsedBody;
    if (endpoint.bodyTemplate) {
      try {
        parsedBody = JSON.parse(bodyText || "{}");
      } catch {
        setResponse({
          ok: false,
          status: "JSON invalido",
          data: "El cuerpo de la solicitud no tiene un JSON valido."
        });
        return;
      }
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const url = buildUrl(baseUrl, endpoint.path, params);
      const requestInit = {
        method: endpoint.method,
        headers: endpoint.bodyTemplate ? { "Content-Type": "application/json" } : undefined,
        body: endpoint.bodyTemplate ? JSON.stringify(parsedBody) : undefined
      };

      const res = await fetch(url, requestInit);
      const contentType = res.headers.get("content-type") || "";
      let data = null;

      if (res.status !== 204) {
        data = contentType.includes("application/json") ? await res.json() : await res.text();
      }

      setResponse({
        ok: res.ok,
        status: `${res.status} ${res.statusText}`,
        data: data ?? "Sin contenido"
      });
    } catch (error) {
      setResponse({
        ok: false,
        status: "Error de red",
        data: error instanceof Error ? error.message : "No se pudo completar la solicitud"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_-18px_rgba(15,23,42,0.22)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{endpoint.title}</h4>
          <div className="mt-1 text-sm text-slate-500">{endpoint.path}</div>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white">
          {endpoint.method}
        </span>
      </div>

      {(endpoint.params || []).length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {endpoint.params.map((param) => (
            <label key={param.name} className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{param.label}</span>
              <input
                type="text"
                value={params[param.name] || ""}
                onChange={(event) =>
                  setParams((current) => ({
                    ...current,
                    [param.name]: event.target.value
                  }))
                }
                placeholder={param.placeholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </label>
          ))}
        </div>
      ) : null}

      {endpoint.bodyTemplate ? (
        <div className="mt-5">
          <div className="mb-2 text-sm font-medium text-slate-700">Body JSON</div>
          <textarea
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            rows={10}
            className="w-full rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition focus:border-indigo-400"
          />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={executeRequest}
          disabled={isLoading}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? "Ejecutando..." : "Ejecutar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setParams(initialParams);
            setBodyText(initialBody);
            setResponse(null);
          }}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Restaurar ejemplo
        </button>
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-slate-700">Respuesta</div>
          {response ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                response.ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {response.status}
            </span>
          ) : null}
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl bg-white p-4 text-xs text-slate-700">
          {response ? pretty(response.data) : "Aun no se ha ejecutado este endpoint."}
        </pre>
      </div>
    </article>
  );
}

export default function BackendStudio() {
  const [serviceUrls, setServiceUrls] = useState(DEFAULT_SERVICE_URLS);
  const [activeServiceId, setActiveServiceId] = useState(SERVICES[0].id);

  useEffect(() => {
    const stored = readStoredUrls();
    setServiceUrls({
      ...DEFAULT_SERVICE_URLS,
      ...stored
    });
  }, []);

  function updateUrl(serviceId, nextUrl) {
    setServiceUrls((current) => {
      const next = { ...current, [serviceId]: nextUrl };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }

  const activeService = SERVICES.find((service) => service.id === activeServiceId) || SERVICES[0];

  return (
    <section className="bg-gradient-to-b from-white via-indigo-50/40 to-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-sm font-medium text-indigo-700 shadow-sm">
            Backend coverage
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Panel de microservicios
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Este frontend ya incluye una seccion operativa para cada modulo del backend:
            usuarios, mascotas, paseadores, reservas y match.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => setActiveServiceId(service.id)}
              className={`premium-card p-5 text-left transition ${
                activeServiceId === service.id
                  ? "border-slate-900 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.45)]"
                  : "hover:-translate-y-1"
              }`}
            >
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-600">
                {service.endpoints.length} endpoints
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{service.title}</div>
              <p className="mt-2 text-sm text-slate-600">{service.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <ServiceUrlForm serviceUrls={serviceUrls} onChange={updateUrl} />
        </div>

        <section className="mt-8 premium-card p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-600">
                {activeService.title}
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                {activeService.description}
              </h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              URL activa: {serviceUrls[activeService.id] || "sin configurar"}
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {activeService.endpoints.map((endpoint) => (
              <EndpointCard
                key={endpoint.id}
                endpoint={endpoint}
                baseUrl={serviceUrls[activeService.id] || ""}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}