"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { petsApi, matchApi } from "../../lib/apiClient";

// ─── Helpers ────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-indigo-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-teal-400 to-emerald-500",
  "from-blue-400 to-cyan-500",
  "from-violet-400 to-fuchsia-500",
  "from-green-400 to-teal-500",
  "from-orange-400 to-red-500",
];

function gradient(id) {
  if (!id) return GRADIENTS[0];
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[n % GRADIENTS.length];
}

const SPECIES_EMOJI = { dog: "🐕", cat: "🐱" };

function petEmoji(pet) {
  return SPECIES_EMOJI[pet?.especie] ?? "🐾";
}

// ─── Componentes internos ────────────────────────────────────────────────────

function Toast({ msg, type }) {
  if (!msg) return null;
  const base =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-white/95 text-slate-900";
  return (
    <div
      className={`fixed right-5 top-5 z-50 w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur ${base}`}
    >
      <p className="text-sm font-medium">{msg}</p>
    </div>
  );
}

/** Tarjeta individual de una mascota en el deck */
function SwipeCard({ pet, swipeDir, isTop }) {
  const g = gradient(pet.id);

  const animClass =
    isTop && swipeDir === "like"
      ? "translate-x-[160%] rotate-[18deg] opacity-0"
      : isTop && swipeDir === "dislike"
      ? "-translate-x-[160%] -rotate-[18deg] opacity-0"
      : "";

  return (
    <div
      className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-[380ms] ease-in-out ${animClass}`}
    >
      {/* Zona superior — avatar */}
      <div
        className={`h-[62%] bg-gradient-to-br ${g} flex flex-col items-center justify-center gap-2 relative`}
      >
        <span className="text-[7rem] drop-shadow-lg leading-none select-none">
          {petEmoji(pet)}
        </span>
        {/* Like/Nope overlay hints */}
        {isTop && swipeDir === "like" && (
          <div className="absolute top-6 left-6 rotate-[-20deg] rounded-xl border-4 border-emerald-400 px-4 py-1 text-3xl font-black text-emerald-400 opacity-90">
            LIKE
          </div>
        )}
        {isTop && swipeDir === "dislike" && (
          <div className="absolute top-6 right-6 rotate-[20deg] rounded-xl border-4 border-rose-400 px-4 py-1 text-3xl font-black text-rose-400 opacity-90">
            NOPE
          </div>
        )}
      </div>

      {/* Zona inferior — info */}
      <div className="h-[38%] bg-white px-6 py-4 flex flex-col justify-center">
        <div className="flex items-end gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
            {pet.nombre}
          </h2>
          {pet.edad != null && (
            <span className="text-base text-slate-400 mb-0.5">
              {pet.edad} {pet.edad === 1 ? "año" : "años"}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-slate-500 capitalize">
          {pet.especie}
          {pet.raza ? ` · ${pet.raza}` : ""}
          {pet.genero ? ` · ${pet.genero}` : ""}
        </p>
        <p className="mt-2 text-[10px] font-mono text-slate-300 truncate">
          {pet.id}
        </p>
      </div>
    </div>
  );
}

/** Stack de 3 tarjetas */
function CardDeck({ queue, currentIdx, swipeDir }) {
  const cards = [
    { offset: 2, scale: "scale-[0.88]", translate: "translate-y-5" },
    { offset: 1, scale: "scale-[0.94]", translate: "translate-y-2.5" },
    { offset: 0, scale: "scale-100",    translate: "translate-y-0" },
  ];

  return (
    <div className="relative w-full h-full">
      {cards.map(({ offset, scale, translate }) => {
        const pet = queue[currentIdx + offset];
        if (!pet) return null;
        return (
          <div
            key={pet.id}
            className={`absolute inset-0 ${scale} ${translate} transition-transform duration-300`}
            style={{ zIndex: 3 - offset }}
          >
            <SwipeCard
              pet={pet}
              swipeDir={swipeDir}
              isTop={offset === 0}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Modal de celebración de match */
function MatchModal({ myPet, matchedPet, onClose }) {
  if (!matchedPet) return null;
  const ga = gradient(myPet?.id);
  const gb = gradient(matchedPet.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-sm premium-card p-8 flex flex-col items-center gap-4 text-center"
        style={{ animation: "popIn 0.35s ease-out both" }}
      >
        {/* Avatars superpuestos */}
        <div className="flex -space-x-6 mb-2">
          <div
            className={`h-24 w-24 rounded-full bg-gradient-to-br ${ga} flex items-center justify-center text-5xl border-4 border-white shadow-2xl shadow-indigo-300/40`}
          >
            {petEmoji(myPet)}
          </div>
          <div
            className={`h-24 w-24 rounded-full bg-gradient-to-br ${gb} flex items-center justify-center text-5xl border-4 border-white shadow-2xl shadow-pink-300/40`}
          >
            {petEmoji(matchedPet)}
          </div>
        </div>

        <div
          className="text-6xl"
          style={{ animation: "heartBeat 0.6s ease-in-out 0.3s both" }}
        >
          💞
        </div>

        <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
          ¡Es un Match!
        </h3>
        <p className="text-sm text-slate-500 max-w-[220px]">
          <span className="font-bold text-slate-800">{myPet?.nombre}</span> y{" "}
          <span className="font-bold text-slate-800">{matchedPet.nombre}</span>{" "}
          se han gustado mutuamente. 🐾
        </p>

        <button
          onClick={onClose}
          className="mt-1 w-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-white font-bold tracking-wide transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/50"
        >
          ¡Genial! Seguir explorando
        </button>
      </div>
    </div>
  );
}

/** Tarjeta de match en la pestaña "Mis Matches" */
function MatchCard({ pet, matchId, matchStatus, onUnmatch }) {
  const g = gradient(pet?.id);
  const STATUS = {
    active:    { label: "Activo",     color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    blocked:   { label: "Bloqueado",  color: "bg-red-50 text-red-700 border-red-200" },
    unmatched: { label: "Desemparejado", color: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const st = STATUS[matchStatus] ?? STATUS.active;

  return (
    <div className="premium-card overflow-hidden transition duration-200 hover:-translate-y-0.5">
      <div className={`h-28 bg-gradient-to-br ${g} flex items-center justify-center text-5xl`}>
        {petEmoji(pet)}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-slate-900 truncate">
            {pet?.nombre ?? "Mascota"}
          </p>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${st.color}`}>
            {st.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 capitalize">
          {pet?.especie}{pet?.raza ? ` · ${pet.raza}` : ""}
          {pet?.edad != null ? ` · ${pet.edad} años` : ""}
        </p>
        {matchStatus === "active" && (
          <button
            onClick={() => onUnmatch(matchId)}
            className="mt-1 rounded-full border border-red-200 bg-red-50 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            Desemparejar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Pantalla de configuración ───────────────────────────────────────────────

function SetupScreen({ onStart }) {
  const [petId, setPetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    if (!petId.trim()) { setError("Ingresa el ID de tu mascota"); return; }
    setLoading(true);
    setError("");
    try {
      const pet = await petsApi.get(petId.trim());
      onStart(pet);
    } catch (e) {
      setError("No se encontró la mascota. Verifica el ID.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex justify-center gap-2 text-6xl mb-4">
            <span>🐕</span>
            <span className="text-5xl self-center">💞</span>
            <span>🐱</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            PawMatch
          </h1>
          <p className="mt-2 text-slate-500 text-sm max-w-sm mx-auto">
            Encuentra la pareja perfecta para tu mascota. Swipe, conecta y crea
            nuevas amistades caninas y felinas.
          </p>
        </div>

        {/* Card */}
        <div className="premium-card p-8 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              ID de tu mascota
            </label>
            <input
              value={petId}
              onChange={(e) => { setPetId(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder="UUID de la mascota…"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>
          <button
            onClick={handleStart}
            disabled={loading || !petId.trim()}
            className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-white font-bold tracking-wide transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/40 disabled:opacity-50"
          >
            {loading ? "Buscando mascota…" : "Comenzar a explorar →"}
          </button>
          <p className="text-center text-xs text-slate-400">
            ¿No tienes ID? Ve a{" "}
            <a href="/mascotas" className="text-indigo-600 hover:underline">
              Gestión de Mascotas
            </a>{" "}
            para registrar tu mascota primero.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function MatchPage() {
  // Setup
  const [myPet, setMyPet] = useState(null);
  const [started, setStarted] = useState(false);

  // Swipe
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Matches
  const [matches, setMatches] = useState([]);
  const [matchedPets, setMatchedPets] = useState({});
  const [newMatchPet, setNewMatchPet] = useState(null);

  // UI
  const [activeTab, setActiveTab] = useState("swipe");
  const [toast, setToast] = useState({ msg: "", type: "ok" });

  function notify(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 3000);
  }

  // ─── Iniciar sesión ──────────────────────────────────────────────────────

  async function handleStart(pet) {
    setMyPet(pet);
    setStarted(true);
    setLoadingQueue(true);

    try {
      // Cargar todos los pets y los swipes ya hechos en paralelo
      const [allPets, mySwipes, myMatches] = await Promise.all([
        petsApi.list(),
        matchApi.getSwipesByPet(pet.id).catch(() => []),
        matchApi.getMatchesByPet(pet.id).catch(() => []),
      ]);

      // Construir set de IDs ya swipeados
      const swipedIds = new Set(
        (Array.isArray(mySwipes) ? mySwipes : []).map((s) => s.to_pet_id)
      );

      // Filtrar: excluir mi propio pet y los ya swipeados
      const filtered = (Array.isArray(allPets) ? allPets : []).filter(
        (p) => p.id !== pet.id && !swipedIds.has(p.id)
      );

      setQueue(filtered);
      setCurrentIdx(0);

      // Cargar datos de pets emparejados
      await loadMatchPets(myMatches, allPets);
      setMatches(Array.isArray(myMatches) ? myMatches : []);
    } catch (e) {
      notify("Error cargando datos: " + e.message, "error");
    } finally {
      setLoadingQueue(false);
    }
  }

  async function loadMatchPets(matchList, allPets) {
    if (!matchList?.length) return;
    const allPetsMap = {};
    (Array.isArray(allPets) ? allPets : []).forEach((p) => {
      allPetsMap[p.id] = p;
    });

    const petsMap = {};
    await Promise.allSettled(
      matchList.map(async (m) => {
        const otherId = m.pet_a_id === myPet?.id ? m.pet_b_id : m.pet_a_id;
        if (allPetsMap[otherId]) {
          petsMap[m.id] = allPetsMap[otherId];
        } else {
          try {
            petsMap[m.id] = await petsApi.get(otherId);
          } catch {}
        }
      })
    );
    setMatchedPets((prev) => ({ ...prev, ...petsMap }));
  }

  // ─── Swipe ───────────────────────────────────────────────────────────────

  const doSwipe = useCallback(
    async (dir) => {
      if (isAnimating || currentIdx >= queue.length) return;
      const target = queue[currentIdx];

      setSwipeDir(dir);
      setIsAnimating(true);

      // Esperar animación
      await new Promise((r) => setTimeout(r, 380));
      setSwipeDir(null);
      setCurrentIdx((i) => i + 1);
      setIsAnimating(false);

      // Llamar API en background
      try {
        await matchApi.createSwipe({
          from_pet_id: myPet.id,
          to_pet_id: target.id,
          action: dir === "like" ? "like" : "dislike",
        });

        // Si es like, verificar si el otro también dio like → crear match
        if (dir === "like") {
          const theirSwipes = await matchApi
            .getSwipesByPet(target.id)
            .catch(() => []);

          const mutualLike = (Array.isArray(theirSwipes) ? theirSwipes : []).some(
            (s) => s.to_pet_id === myPet.id && s.action === "like"
          );

          if (mutualLike) {
            const newMatch = await matchApi.createMatch({
              pet_a_id: myPet.id,
              pet_b_id: target.id,
            });
            setMatches((prev) => [newMatch, ...prev]);
            setMatchedPets((prev) => ({ ...prev, [newMatch.id]: target }));
            setNewMatchPet(target);
          }
        }
      } catch (e) {
        // Si el swipe ya existe u otro error no crítico, ignorar silenciosamente
        if (!e.message?.includes("already")) {
          notify("Error al registrar swipe: " + e.message, "error");
        }
      }
    },
    [isAnimating, currentIdx, queue, myPet]
  );

  // Atajos de teclado
  useEffect(() => {
    if (!started) return;
    function onKey(e) {
      if (e.key === "ArrowRight" || e.key === "l") doSwipe("like");
      if (e.key === "ArrowLeft"  || e.key === "d") doSwipe("dislike");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, doSwipe]);

  // ─── Unmatch ─────────────────────────────────────────────────────────────

  async function handleUnmatch(matchId) {
    if (!confirm("¿Desemparejar esta mascota?")) return;
    try {
      await matchApi.updateMatch(matchId, {
        pet_a_id: myPet.id,
        pet_b_id: matchedPets[matchId]?.id ?? "",
        status: "unmatched",
      });
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, status: "unmatched" } : m))
      );
      notify("Desemparejado correctamente.");
    } catch (e) {
      notify(e.message, "error");
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (!started) {
    return (
      <main>
        <Navbar />
        <SetupScreen onStart={handleStart} />
      </main>
    );
  }

  const remainingCount = Math.max(0, queue.length - currentIdx);
  const hasCards = currentIdx < queue.length;
  const activeMatches = matches.filter((m) => m.status === "active").length;

  return (
    <main>
      <Navbar />
      <Toast msg={toast.msg} type={toast.type} />
      <MatchModal
        myPet={myPet}
        matchedPet={newMatchPet}
        onClose={() => setNewMatchPet(null)}
      />

      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col items-center gap-6">

        {/* Mi mascota + cambiar */}
        <div className="w-full premium-card px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient(myPet.id)} flex items-center justify-center text-xl shadow`}
            >
              {petEmoji(myPet)}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{myPet.nombre}</p>
              <p className="text-xs text-slate-400 capitalize">
                {myPet.especie}{myPet.raza ? ` · ${myPet.raza}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setStarted(false); setQueue([]); setCurrentIdx(0); setMatches([]); }}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition hover:bg-gray-100"
          >
            Cambiar mascota
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-full bg-gray-100 p-1 gap-1 w-full max-w-xs">
          {[
            { key: "swipe",   label: `Explorar (${remainingCount})` },
            { key: "matches", label: `Matches ${activeMatches > 0 ? `(${activeMatches})` : ""}` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                activeTab === t.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: SWIPE ─────────────────────────────────────────────────── */}
        {activeTab === "swipe" && (
          <div className="w-full flex flex-col items-center gap-6">
            {loadingQueue ? (
              <div className="h-[480px] w-full max-w-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3 animate-bounce">🐾</div>
                  <p className="text-slate-400 text-sm">Buscando mascotas…</p>
                </div>
              </div>
            ) : hasCards ? (
              <>
                {/* Card deck */}
                <div className="relative w-full max-w-sm h-[480px]">
                  <CardDeck
                    queue={queue}
                    currentIdx={currentIdx}
                    swipeDir={swipeDir}
                  />
                </div>

                {/* Hint teclado */}
                <p className="text-xs text-gray-400">
                  ← tecla D / → tecla L para swipe rápido
                </p>

                {/* Botones */}
                <div className="flex items-center gap-5">
                  {/* Dislike */}
                  <button
                    onClick={() => doSwipe("dislike")}
                    disabled={isAnimating}
                    className="h-16 w-16 rounded-full bg-white border-2 border-rose-200 flex items-center justify-center text-2xl shadow-lg shadow-rose-100 transition hover:scale-110 hover:border-rose-400 disabled:opacity-40"
                    aria-label="No me gusta"
                  >
                    👎
                  </button>

                  {/* Skip */}
                  <button
                    onClick={() => setCurrentIdx((i) => i + 1)}
                    disabled={isAnimating}
                    className="h-11 w-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-medium transition hover:bg-gray-200 disabled:opacity-40"
                    aria-label="Saltar"
                  >
                    ⏭
                  </button>

                  {/* Like */}
                  <button
                    onClick={() => doSwipe("like")}
                    disabled={isAnimating}
                    className="h-16 w-16 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center text-2xl shadow-lg shadow-emerald-100 transition hover:scale-110 hover:border-emerald-400 disabled:opacity-40"
                    aria-label="Me gusta"
                  >
                    💚
                  </button>
                </div>
              </>
            ) : (
              /* Estado vacío */
              <div className="h-[480px] w-full max-w-sm premium-card flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="text-6xl">🎉</div>
                <h3 className="text-xl font-bold text-slate-900">
                  ¡Has visto todas las mascotas!
                </h3>
                <p className="text-sm text-slate-500">
                  No quedan más mascotas por explorar. Vuelve más tarde cuando
                  se registren nuevas.
                </p>
                <button
                  onClick={() => setActiveTab("matches")}
                  className="rounded-full bg-gray-900 px-6 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
                >
                  Ver mis matches →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MATCHES ───────────────────────────────────────────────── */}
        {activeTab === "matches" && (
          <div className="w-full">
            {matches.length === 0 ? (
              <div className="premium-card p-10 text-center flex flex-col items-center gap-3">
                <div className="text-5xl">💔</div>
                <p className="text-slate-500 text-sm">
                  Aún no tienes matches. ¡Sigue explorando!
                </p>
                <button
                  onClick={() => setActiveTab("swipe")}
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm text-white font-semibold transition hover:-translate-y-0.5"
                >
                  Explorar mascotas
                </button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                {matches.map((m) => (
                  <MatchCard
                    key={m.id}
                    pet={matchedPets[m.id]}
                    matchId={m.id}
                    matchStatus={m.status}
                    onUnmatch={handleUnmatch}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
