import Navbar from "../../../components/Navbar";
import PetRegisterForm from "../../../components/PetRegisterForm";

export default function RegisterPage() {
  return (
    <main>
      <Navbar />
      <section className="relative overflow-hidden bg-mesh-hero">
        <div
          className="pointer-events-none absolute inset-0 pattern-dots opacity-55 mix-blend-multiply"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 animate-blob-soft rounded-full bg-brand-400/22 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 animate-blob-soft rounded-full bg-indigo-400/18 blur-3xl [animation-delay:-7s]" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div className="animate-fade-in lg:pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-300/85 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-800 shadow-md shadow-brand-500/12 ring-1 ring-white/70 backdrop-blur transition-shadow duration-300 hover:shadow-brand-500/20 sm:text-sm">
                Perfil de mascota
              </div>
              <h1 className="heading-display mt-8 text-balance text-4xl sm:text-5xl">
                Registro de Mascota
              </h1>
              <p className="mt-4 max-w-lg border-l-[3px] border-brand-400/90 pl-5 text-lg leading-relaxed text-ink-muted">
                Completa el perfil para mejorar los matches y coordinar paseos.
              </p>
              <div className="mt-10 grid max-w-md gap-4">
                <div className="surface-card animate-fade-in p-6 stagger-1 [animation-delay:80ms]">
                  <div className="border-l-[3px] border-brand-400/65 pl-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                      Beneficios
                    </div>
                    <div className="mt-1.5 text-lg font-semibold leading-snug text-ink">
                      Más visibilidad y mejores coincidencias
                    </div>
                  </div>
                </div>
                <div className="surface-card animate-fade-in p-6 stagger-2 [animation-delay:140ms]">
                  <div className="border-l-[3px] border-indigo-400/60 pl-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                      Privacidad
                    </div>
                    <div className="mt-1.5 text-lg font-semibold leading-snug text-ink">
                      Fotos almacenadas de forma segura en la nube
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="animate-fade-in lg:sticky lg:top-24 [animation-delay:120ms]">
              <PetRegisterForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
