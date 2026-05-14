function IconHome(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.5 10.5 12 4l7.5 6.5v8.25a.75.75 0 0 1-.75.75H14.25v-5.25a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v5.25H5.25a.75.75 0 0 1-.75-.75V10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconInbox(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.75 7.75h14.5a1 1 0 0 1 .92.61l2.25 5.5A1.75 1.75 0 0 1 21 16.25H3a1.75 1.75 0 0 1-1.42-2.64l2.25-5.5a1 1 0 0 1 .92-.61Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 12.25V11a3.75 3.75 0 1 1 7.5 0v1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/90 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/75">
      <div className="gradient-rule opacity-[0.92]" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-4">
        <a href="/" className="group flex min-w-0 items-center gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-violet-600 to-indigo-700 text-lg text-white shadow-glow ring-2 ring-white/40 transition duration-300 group-hover:scale-[1.06] group-hover:shadow-elevate-xl">
            🐾
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/25 to-transparent opacity-70" />
          </span>
          <span className="truncate bg-gradient-to-r from-slate-900 via-violet-950 to-indigo-900 bg-clip-text text-[1.06rem] font-extrabold tracking-tight text-transparent sm:text-xl">
            Doggy Connect & Walk
          </span>
        </a>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="nav-pill-wrap hidden items-center gap-0.5 sm:flex">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-ink-muted transition-colors duration-200 hover:bg-white hover:text-ink hover:shadow-sm"
            >
              <IconHome className="h-4 w-4 shrink-0 text-brand-600" />
              Inicio
            </a>
            <a
              href="/requests"
              className="inline-flex max-w-[10rem] items-center gap-2 truncate rounded-full px-3.5 py-2 text-sm font-semibold text-ink-muted transition-colors duration-200 hover:bg-white hover:text-ink hover:shadow-sm lg:max-w-none"
            >
              <IconInbox className="h-4 w-4 shrink-0 text-brand-600" />
              <span className="truncate">Solicitudes</span>
            </a>
          </div>
          <div className="flex items-center gap-1 sm:hidden">
            <a
              href="/"
              className="rounded-full border border-slate-200/95 bg-white p-2 text-brand-700 shadow-sm transition hover:bg-brand-50"
              aria-label="Inicio"
            >
              <IconHome className="h-5 w-5" />
            </a>
            <a
              href="/requests"
              className="rounded-full border border-slate-200/95 bg-white p-2 text-brand-700 shadow-sm transition hover:bg-brand-50"
              aria-label="Solicitudes"
            >
              <IconInbox className="h-5 w-5" />
            </a>
          </div>
          <a
            href="/pet/register"
            className="btn-primary whitespace-nowrap px-4 py-2.5 text-xs shadow-glow-soft sm:px-6 sm:text-sm"
          >
            Registrar Mascota
          </a>
        </nav>
      </div>
    </header>
  );
}
