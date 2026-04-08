export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-400/40">
            🐾
          </div>
          <div className="text-xl font-semibold tracking-tight text-gray-900">Doggy Connect & Walk</div>
        </div>
        <nav className="flex items-center gap-4">
          <a
            href="/"
            className="hidden sm:inline-flex rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Inicio
          </a>
          <a
            href="/requests"
            className="hidden sm:inline-flex rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Solicitudes
          </a>
          <span className="hidden sm:block h-6 w-px bg-gray-200" aria-hidden="true" />
          <a
            href="/pet/register"
            className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            Registrar Mascota
          </a>
        </nav>
      </div>
    </header>
  );
}
