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
  }
];

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <section className="mx-auto max-w-6xl px-6 py-12 grid md:grid-cols-3 gap-6">
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
      <MatchCards />
    </main>
  );
}
