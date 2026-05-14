"use client";

export default function DogPhoto({
  dog,
  fill,
  className = "",
  imgClassName = "",
  priority,
  width,
  height,
}) {
  const alt =
    dog?.name != null
      ? `${dog.name}${dog.breed ? `, ${dog.breed}` : ""}`
      : "Mascota";

  if (dog?.photoUrl) {
    const loading = priority ? "eager" : "lazy";

    if (fill) {
      return (
        <img
          src={dog.photoUrl}
          alt={alt}
          loading={loading}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      );
    }

    return (
      <img
        src={dog.photoUrl}
        alt={alt}
        width={width ?? 320}
        height={height ?? 320}
        loading={loading}
        decoding="async"
        className={`object-cover ${className}`}
      />
    );
  }

  if (fill) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 via-indigo-600 to-slate-900 ${className}`}
      >
        <span className="select-none text-5xl drop-shadow-md sm:text-6xl" aria-hidden="true">
          {dog?.avatar || "🐾"}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`flex items-center justify-center select-none text-5xl ${className}`}
      aria-hidden="true"
    >
      {dog?.avatar || "🐾"}
    </span>
  );
}
