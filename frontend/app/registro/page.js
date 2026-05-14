import Navbar from "../../components/Navbar";
import RegisterWizard from "../../components/RegisterWizard";

export const metadata = { title: "Registrarse · Doggy Connect & Walk" };

export default function RegistroPage() {
  return (
    <main>
      <Navbar />
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-white min-h-[calc(100vh-73px)]">
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6 py-14 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
          {/* Columna izquierda: copy */}
          <div className="lg:sticky lg:top-24 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-sm font-medium text-indigo-700 shadow-sm">
                Únete a la comunidad
              </div>
              <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Crea tu perfil en Doggy Connect
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-md">
                Registra a tus mascotas, conecta con dueños y paseadores, y haz que cada paseo sea
                una aventura.
              </p>
            </div>

            <div className="grid gap-4 max-w-sm">
              <div className="premium-card p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
                  🐾
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Perfil de mascotas</p>
                  <p className="text-xs text-gray-500">Agrega fotos, raza, edad y más</p>
                </div>
              </div>
              <div className="premium-card p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl flex-shrink-0">
                  💞
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Match inteligente</p>
                  <p className="text-xs text-gray-500">Conecta con mascotas compatibles</p>
                </div>
              </div>
              <div className="premium-card p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl flex-shrink-0">
                  🦮
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Servicios de paseo</p>
                  <p className="text-xs text-gray-500">Ofrece o solicita paseos fácilmente</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              ¿Ya tienes cuenta?{" "}
              <a href="/usuarios" className="text-indigo-600 hover:underline font-medium">
                Ver usuarios registrados
              </a>
            </p>
          </div>

          {/* Columna derecha: wizard */}
          <div className="premium-card p-7 md:p-9">
            <RegisterWizard />
          </div>
        </div>
      </section>
    </main>
  );
}
