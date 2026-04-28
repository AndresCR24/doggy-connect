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
    label: "Backend",
    title: "Microservicios conectados",
    description: "Usa el panel para probar users, pets, walkers, bookings y match."
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
              Panel completo del backend
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              El frontend ahora incluye una seccion para ejecutar todos los endpoints de los microservicios.
            </p>
          </div>
          <a
            href="/backend"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            Abrir panel backend
          </a>
        </div>
      </section>
      <MatchCards />
    </main>
  );
}
