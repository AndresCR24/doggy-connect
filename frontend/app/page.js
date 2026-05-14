import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MatchCards from "../components/MatchCards";

function IconCloudLock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.5 18.75h9a3.75 3.75 0 0 0 .101-7.493 4.501 4.501 0 0 0-8.733-1.236 3.751 3.751 0 0 0-2.868 7.229"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15v2.25M12 15a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMatch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3v2.25M12 18.75V21M4.5 12h2.25M17.25 12H21M6.75 6.75l1.59 1.59M15.66 15.66l1.59 1.59M6.75 17.25l1.59-1.59M15.66 8.34l1.59-1.59"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconCommunity(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M16.5 9.75a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM9 18a4.5 4.5 0 0 1 9 0v.75H9V18ZM6 10.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM4.5 18v-.75a3.75 3.75 0 0 1 6.731-2.273"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const highlightIcons = [IconCloudLock, IconMatch, IconCommunity];

const highlights = [
  {
    label: "Seguridad",
    title: "Fotos en la nube",
    description: "Subidas directas y seguras mediante URLs firmadas."
  },
  {
    label: "Experiencia",
    title: "Match inteligente",
    description: "Encuentra compañeros de paseo con filtros y afinidad."
  },
  {
    label: "Comunidad",
    title: "Eventos cercanos",
    description: "Organiza caminatas y conoce dueños en tu zona."
  }
];

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <section className="relative overflow-hidden border-t border-slate-200/40 bg-[linear-gradient(180deg,#fff_0%,#fafaff_42%,#fff_100%)] py-[4.25rem] sm:py-[5.25rem]">
        <div
          className="pointer-events-none absolute inset-0 pattern-dots opacity-[0.28] mix-blend-multiply"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-[-20%] top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-brand-400/[0.09] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-[-18%] h-[22rem] w-[22rem] rounded-full bg-indigo-400/[0.07] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div
            className="pointer-events-none absolute left-1/2 top-[-2rem] hidden h-[3px] w-[min(20rem,88%)] max-w-xl -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-brand-400/65 to-transparent md:top-[-2.5rem] md:block"
            aria-hidden="true"
          />

          <ul className="mt-8 grid list-none gap-6 p-0 sm:grid-cols-2 md:gap-7 lg:mt-14 lg:grid-cols-3">
            {highlights.map((item, i) => {
              const Icon = highlightIcons[i] ?? IconMatch;
              const n = String(i + 1).padStart(2, "0");
              return (
                <li key={item.title} className="min-w-0">
                  <div
                    className="animate-fade-in motion-reduce:animate-none"
                    style={{ animationDelay: `${70 + i * 70}ms` }}
                  >
                    <div className="group relative isolate flex h-full min-h-[17.75rem] flex-col rounded-[1.875rem] p-[1.25px] shadow-[0_26px_64px_-40px_rgba(91,33,182,0.35),0_16px_40px_-32px_rgba(15,23,42,0.12)] [background:linear-gradient(142deg,#a855f7_0%,rgba(147,51,234,0.72)_44%,rgba(99,102,241,0.88)_92%)] ring-1 ring-white/65 transition-[box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_38px_80px_-38px_rgba(91,33,182,0.42),0_20px_48px_-28px_rgba(15,23,42,0.14)]">
                      <div className="relative flex h-full min-h-[inherit] flex-1 flex-col overflow-hidden rounded-[1.835rem] border border-white/85 bg-gradient-to-br from-white from-25% via-white/97 to-brand-50/25 px-7 pb-10 pt-11 backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-0 before:transition before:duration-300 group-hover:before:opacity-100 sm:px-9 sm:pb-11 sm:pt-[3.35rem]">
                        <span
                          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/55 to-transparent"
                          aria-hidden="true"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute left-6 top-[2.75rem] h-[4.25rem] w-[3px] rounded-full bg-gradient-to-b from-brand-500 via-violet-600 to-indigo-600 opacity-90 shadow-[6px_0_28px_-6px_rgba(109,40,217,0.5)] sm:left-[1.875rem] sm:top-[3rem] sm:h-[4.85rem] sm:opacity-95"
                        />

                        <span
                          aria-hidden="true"
                          className="absolute right-3 top-2 select-none bg-gradient-to-br from-brand-200/95 via-brand-600/95 to-indigo-800 bg-clip-text font-black tabular-nums tracking-tighter text-transparent text-[clamp(3.25rem,7.5vw,4.65rem)] leading-none [-webkit-background-clip:text] sm:right-6 sm:top-3"
                          style={{
                            WebkitTextFillColor: "transparent"
                          }}
                        >
                          {n}
                        </span>

                        <div className="relative z-[1] flex flex-1 flex-col pr-14 sm:pr-16 md:mt-3">
                          <div className="mb-7 inline-flex h-[3.125rem] w-[3.125rem] shrink-0 items-center justify-center rounded-[0.95rem] bg-[linear-gradient(145deg,#f5f3ff_12%,rgba(237,233,254,0.6)_92%)] text-brand-700 shadow-[0_10px_32px_-16px_rgba(109,40,217,0.42),inset_0_1px_0_rgba(255,255,255,0.95)] ring-[1px] ring-brand-500/[0.12] ring-offset-4 ring-offset-white/80 transition duration-300 group-hover:scale-[1.06] group-hover:text-brand-900 group-hover:ring-brand-400/25 group-hover:[box-shadow:0_14px_40px_-18px_rgba(109,40,217,0.5)]">
                            <Icon className="h-7 w-7" strokeWidth={1.65} />
                          </div>

                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.26em] text-brand-700/90">
                            {item.label}
                          </p>
                          <h3 className="mt-2 text-[1.28rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[1.4rem]">
                            {item.title}
                          </h3>
                          <p className="mt-5 max-w-none flex-1 text-[0.96rem] leading-[1.65] text-slate-600 md:max-w-[19rem] lg:max-w-none">
                            {item.description}
                          </p>
                        </div>

                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -bottom-[18%] -right-[8%] opacity-[0.055] transition duration-300 group-hover:opacity-[0.08]"
                        >
                          <Icon className="h-[9.5rem] w-[9.5rem] text-brand-700" strokeWidth={1} />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <MatchCards />
    </main>
  );
}
