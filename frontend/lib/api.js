export async function getUploadUrl({ key, contentType }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const url = `${base}/upload-url?key=${encodeURIComponent(
    key
  )}&contentType=${encodeURIComponent(contentType)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("No se pudo obtener URL de subida");
  }
  return res.json();
}

