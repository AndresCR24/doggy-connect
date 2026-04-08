import Navbar from "../../../components/Navbar";
import PetRegisterForm from "../../../components/PetRegisterForm";

export default function RegisterPage() {
  return (
    <main>
      <Navbar />
      <section className="bg-gradient-to-b from-white via-indigo-50/40 to-white">
        <div className="mx-auto max-w-6xl px-6 py-14 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-sm font-medium text-indigo-700 shadow-sm">
              Perfil de mascota
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Registro de Mascota
            </h1>
            <p className="text-gray-600 mt-2">
              Completa el perfil para mejorar los matches y coordinar paseos.
            </p>
            <div className="mt-6 grid gap-4">
              <div className="premium-card p-4">
                <div className="text-sm text-gray-500">Beneficios</div>
                <div className="mt-2 text-gray-900 font-medium">
                  Más visibilidad y mejores coincidencias
                </div>
              </div>
              <div className="premium-card p-4">
                <div className="text-sm text-gray-500">Privacidad</div>
                <div className="mt-2 text-gray-900 font-medium">
                  Fotos almacenadas de forma segura en la nube
                </div>
              </div>
            </div>
          </div>
          <PetRegisterForm />
        </div>
      </section>
    </main>
  );
}
