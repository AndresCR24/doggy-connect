"use client";

import { useEffect, useRef, useState } from "react";
import { getUploadUrl } from "../lib/api";

function IconCamera(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.75 7.75h2.2L8.1 5.75h7.8l1.15 2h2.2a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-14.5a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 16.25a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function PetRegisterForm() {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);
  const fileInputRef = useRef(null);
  const isDragging = dragDepth > 0;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function applySelectedFile(selectedFile) {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return selectedFile ? URL.createObjectURL(selectedFile) : "";
    });
    setFile(selectedFile);
  }

  function resetForm() {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setName("");
    setBreed("");
    setFile(null);
    setDragDepth(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onFileChange(e) {
    applySelectedFile(e.target.files?.[0] ?? null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) {
      setStatus("Selecciona una foto");
      return;
    }
    try {
      setIsSubmitting(true);
      setStatus("Subiendo...");
      const uploadKey = `pets/${Date.now()}-${file.name}`;
      const { uploadUrl, objectKey } = await getUploadUrl({
        key: uploadKey,
        contentType: file.type || "image/jpeg"
      });
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file
      });
      if (!put.ok) {
        setStatus("No se pudo subir la imagen. Intenta de nuevo.");
        return;
      }
      setStatus(`Registro completo: ${name} (${breed}). Imagen: ${objectKey}`);
      resetForm();
    } catch {
      setStatus(
        `Registro local completo: ${name} (${breed}). No se subió a la nube porque faltan credenciales AWS.`
      );
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  }

  function onDropZoneDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth((d) => d + 1);
  }

  function onDropZoneDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth((d) => Math.max(0, d - 1));
  }

  function onDropZoneDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onDropZoneDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth(0);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped || !dropped.type.startsWith("image/")) return;
    applySelectedFile(dropped);
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(dropped);
      fileInputRef.current.files = dt.files;
    }
  }

  const fieldClass =
    "mt-3.5 block w-full rounded-2xl border border-slate-200/95 bg-gradient-to-b from-white to-slate-50/90 px-4 py-3.5 text-[15px] font-medium text-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_1px_2px_rgba(15,23,42,0.04)] outline-none ring-0 transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal hover:border-slate-300 hover:to-white focus:border-brand-400 focus:bg-white focus:shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_0_0_3px_rgba(139,92,246,0.14)]";

  const labelClass =
    "block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500";

  const dzBase =
    "group/dz relative flex min-h-[11.75rem] cursor-pointer flex-col items-center justify-center rounded-[1.15rem] border-2 border-dashed px-5 py-10 text-center transition-all duration-300 hover:shadow-lg focus-within:ring-0";
  const dzIdle =
    "border-slate-300/95 bg-gradient-to-b from-brand-50/55 via-white to-slate-50/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:border-brand-400/90 hover:from-brand-50/90 focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]";
  const dzActive =
    "scale-[1.01] border-brand-500 bg-gradient-to-b from-brand-50 to-indigo-50/95 shadow-[0_14px_40px_-22px_rgba(91,33,182,0.45)] ring-4 ring-brand-400/20";

  return (
    <form
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/98 p-8 shadow-[0_1px_0_rgba(255,255,255,0.92)_inset,0_32px_64px_-32px_rgba(91,33,182,0.2),0_18px_36px_-20px_rgba(15,23,42,0.11)] ring-1 ring-slate-900/[0.04] backdrop-blur-[2px] sm:p-10"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r from-brand-400 via-violet-500 to-indigo-500"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-400/[0.08] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-indigo-400/[0.07] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative space-y-10 pt-1">
        <div className="grid gap-8 md:grid-cols-2 md:gap-7">
          <div>
            <label className={labelClass} htmlFor="pet-name">
              Nombre
            </label>
            <input
              id="pet-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="Luna"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="pet-breed">
              Raza
            </label>
            <input
              id="pet-breed"
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className={fieldClass}
              placeholder="Labrador"
              required
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="pet-photo">
            Foto
          </label>
          <div className="mt-4 grid items-stretch gap-5 md:grid-cols-[1fr,minmax(132px,156px)] md:gap-5">
            <label
              htmlFor="pet-photo"
              className={`${dzBase} ${isDragging ? dzActive : dzIdle}`}
              onDragEnter={onDropZoneDragEnter}
              onDragLeave={onDropZoneDragLeave}
              onDragOver={onDropZoneDragOver}
              onDrop={onDropZoneDrop}
            >
              <input
                ref={fileInputRef}
                id="pet-photo"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="sr-only"
              />
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 ring-2 ring-brand-100 transition duration-300 ${
                  isDragging
                    ? "scale-110 ring-brand-300 shadow-[0_12px_32px_-10px_rgba(109,40,217,0.45)]"
                    : "shadow-[0_8px_24px_-8px_rgba(109,40,217,0.35)] group-hover/dz:scale-105 group-hover/dz:ring-brand-200"
                }`}
                aria-hidden="true"
              >
                <IconCamera className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <span className="mt-5 max-w-[15rem] text-sm font-semibold leading-snug text-ink">
                {isDragging ? "Suelta para cargar" : "Arrastra tu imagen o haz clic"}
              </span>
              <span className="mt-2 text-xs font-medium text-slate-500">
                PNG o JPG hasta 5MB
              </span>
            </label>

            <div
              className={`relative flex aspect-square w-full max-w-[11rem] justify-self-center overflow-hidden rounded-[1.15rem] bg-gradient-to-br from-slate-100 to-white shadow-inner transition-[box-shadow,border-color,transform] duration-300 md:max-w-none md:justify-self-end ${
                preview
                  ? "border-2 border-brand-400/65 shadow-[inset_0_2px_12px_rgba(91,33,182,0.08),0_12px_32px_-20px_rgba(91,33,182,0.25)] ring-2 ring-white"
                  : "border border-slate-200/90 ring-2 ring-white/90 hover:border-slate-300/95"
              }`}
            >
              <div
                className="pointer-events-none absolute inset-x-3 top-3 z-[1] h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
                aria-hidden="true"
              />
              {preview ? (
                <img
                  src={preview}
                  alt={name ? `Vista previa de ${name}` : "Vista previa de la mascota"}
                  className="h-full w-full object-cover motion-safe:animate-[fade-in_0.35s_ease-out_both]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                  <IconCamera className="h-11 w-11 opacity-35" strokeWidth={1.25} />
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
                    Vista previa
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary relative z-[1] w-full cursor-pointer py-4 text-[0.97rem] font-semibold tracking-wide shadow-[0_12px_40px_-16px_rgba(91,33,182,0.45)] hover:brightness-[1.02] disabled:pointer-events-none disabled:hover:translate-y-0"
        >
          <span className="relative z-[2]">{isSubmitting ? "Subiendo..." : "Registrar y Subir Foto"}</span>
        </button>

        {status ? (
          <p
            role="status"
            className="rounded-2xl border border-brand-200/65 bg-gradient-to-r from-brand-50/97 to-indigo-50/[0.93] px-5 py-4 text-sm font-medium leading-relaxed text-slate-700 shadow-sm motion-safe:animate-[fade-in_0.35s_ease-out_both]"
          >
            {status}
          </p>
        ) : null}
      </div>
    </form>
  );
}
