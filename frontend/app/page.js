import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MatchCards from "../components/MatchCards";

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
  },
  {
    label: "Registro",
    title: "Perfil completo",
    description: "Crea tu cuenta, agrega tus mascotas y empieza a hacer match."
  }
];

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <section className="mx-auto max-w-6xl px-6 py-12 grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="premium-card p-6 transition duration-300 hover:-translate-y-1"
          >
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{item.title}</div>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <div className="premium-card p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-indigo-600 font-medium uppercase tracking-[0.18em]">Nuevo</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Crea tu cuenta en segundos
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Regístrate, agrega tus mascotas y, si quieres, ofrece servicios de paseo. Todo en un solo flujo.
            </p>
          </div>
          <a
            href="/registro"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            Registrarse
          </a>
        </div>
      </section>
      <MatchCards />
    </main>
  );
}
