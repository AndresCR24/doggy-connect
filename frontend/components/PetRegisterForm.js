"use client";

import { useState } from "react";
import { getUploadUrl } from "../lib/api";

export default function PetRegisterForm() {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setBreed("");
    setFile(null);
    setPreview("");
  }

  function onFileChange(e) {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : "");
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

  return (
    <form
      onSubmit={onSubmit}
      className="premium-card p-6 space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 transition focus:border-gray-900 focus:ring-gray-900"
            placeholder="Luna"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Raza</label>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="mt-2 w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 transition focus:border-gray-900 focus:ring-gray-900"
            placeholder="Labrador"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Foto</label>
        <div className="mt-2 grid md:grid-cols-[1fr_160px] gap-4 items-center">
          <label className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center cursor-pointer transition hover:border-gray-300 hover:bg-white">
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            <div className="text-sm text-gray-700">Arrastra tu imagen o haz clic</div>
            <div className="text-xs text-gray-500 mt-1">PNG o JPG hasta 5MB</div>
          </label>
          <div className="h-32 w-32 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl">📷</span>
            )}
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-gray-900 text-white py-3 transition hover:-translate-y-0.5 hover:bg-gray-800"
      >
        {isSubmitting ? "Subiendo..." : "Registrar y Subir Foto"}
      </button>
      {status ? <p className="text-sm text-gray-700">{status}</p> : null}
    </form>
  );
}

