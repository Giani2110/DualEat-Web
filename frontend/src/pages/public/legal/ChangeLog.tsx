import { useEffect, useState } from "react";
import DownloadSectionBG from "@components/shared/DownloadSectionBG";
import { fetchAndMergeCommits, Commit } from "@services/github.api";
import { Github, ExternalLink, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CACHE_KEY = "dualeat_changelog_cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const ChangeLog = () => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "web" | "backend" | "mobile">("all");
  const [visibleCount, setVisibleCount] = useState<number>(15);

  const loadCommits = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try reading from cache first (if not forced refresh)
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && Date.now() - parsed.timestamp < CACHE_TTL) {
              setCommits(parsed.commits);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing changelog cache:", e);
          }
        }
      }

      // 2. Fetch fresh commits from GitHub API
      const freshCommits = await fetchAndMergeCommits();

      if (freshCommits && freshCommits.length > 0) {
        setCommits(freshCommits);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ commits: freshCommits, timestamp: Date.now() })
        );
      } else {
        // Fallback: If network failed or rate limit hit, check if we have any cache even if expired
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setCommits(parsed.commits);
          } catch (_) {
            setError("No se pudieron obtener los cambios. Por favor, intenta de nuevo más tarde.");
          }
        } else {
          setError("No se pudieron obtener los cambios. Por favor, intenta de nuevo más tarde.");
        }
      }
    } catch (err) {
      console.error("Error in loadCommits:", err);
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setCommits(parsed.commits);
        } catch (_) {
          setError("Ocurrió un error al obtener el historial de cambios.");
        }
      } else {
        setError("Ocurrió un error al obtener el historial de cambios.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommits();
  }, []);

  // Formatea la fecha de manera legible y bonita
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Filtrar commits
  const filteredCommits = commits.filter((commit) => {
    if (filter === "all") return true;
    return commit.repo === filter;
  });

  // Obtener commits actuales según paginación
  const commitsToShow = filteredCommits.slice(0, visibleCount);

  // Configuración de estilos y etiquetas de los badges
  const getRepoBadgeConfig = (repoType: "web" | "backend" | "mobile") => {
    switch (repoType) {
      case "web":
        return {
          label: "Cambios Visuales",
          style: "text-[#0A449B] bg-[#0A449B]/10 border-[#0A449B]/20",
        };
      case "backend":
        return {
          label: "Cambios Internos",
          style: "text-[#e5a657] bg-[#e5a657]/10 border-[#e5a657]/20",
        };
      case "mobile":
        return {
          label: "Cambios en la App",
          style: "text-[#b53325] bg-[#b53325]/10 border-[#b53325]/20",
        };
    }
  };

  return (
    <div className="min-h-screen bgsemi-white pt-[15px]">
      {/* Banner Header */}
      <div className="rounded-[20px] mx-4 bg-gradient-to-t from-[#000000] to-[#434343] text-white h-[400px] relative">
        <div className="max-w-screen-2xl mx-auto text-center pt-[160px]">
          <h1 className="text-[48px] font-bold mb-4">Changelog</h1>
          <p className="text-[18px] max-w-2xl mx-auto leading-[32px] tracking-[-0.3px]">
            Historial de cambios realizados a lo largo del sistema de DualEat
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-4 mt-4">
        <div className="bg-gray py-[70px] px-8 rounded-[20px]">
          {/* Entry 1 */}
          <div className="pb-8 pt-8 border-b border-gray-200 max-w-[55%] mx-auto">
            <h2 className="text-[15px] text4">12 de julio de 2025</h2>

            <h3 className="titleCL font-bold mb-1 mt-3">
              Menús digitales más visuales
            </h3>
            <p className="text6 textCL">
              Los locales ahora pueden incluir imágenes de sus platos en el
              menú. Esto mejora la experiencia del cliente al elegir qué pedir.
            </p>
            <h3 className="titleCL font-bold mb-1 mt-3">
              Mejoras de seguridad en el inicio de sesión
            </h3>
            <p className="text6 textCL">
              Agregamos autenticación por Magic Link. También reforzamos
              validaciones al crear cuenta para evitar registros fraudulentos.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400">
                    ✉️
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">
                    👁️
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Repetir contraseña"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">
                    👁️
                  </span>
                </div>
              </div>
            </div>
            <h3 className="titleCL font-bold mb-1 mt-3">Otras mejoras</h3>
            <ul className="list-disc pl-6 space-y-2 text6 textCL">
              <li>
                Las recetas pueden compartirse fácilmente por WhatsApp o redes
                sociales.
              </li>
              <li>Mejora en la visualización de precios con descuentos.</li>
            </ul>
          </div>

          {/* Entry 2 */}
          <div className="pt-8 pb-8 border-b border-gray-200 max-w-[55%] mx-auto">
            <h2 className="text-[15px] text4">27 de junio de 2025</h2>

            <h3 className="titleCL font-bold mb-1 mt-3">
              Incorporamos filtros por tipo de comida
            </h3>
            <p className="text6 textCL">
              Ahora podés buscar restaurantes y recetas según tu estilo
              alimentario: vegano, sin TACC, bajo en calorías y más. Seguimos
              sumando nuevas categorías.
            </p>
            <h3 className="titleCL font-bold mb-1 mt-3">
              Mejora en escaneo QR dentro de locales
            </h3>
            <p className="text6 textCL">
              El escaneo QR ahora carga el menú más rápido y permite dejar
              reseñas al instante. También suma puntos automáticamente al perfil
              del cliente.
            </p>
            <h3 className="titleCL font-bold mb-1 mt-3">
              Otras mejoras y correcciones
            </h3>
            <ul className="list-disc pl-6 space-y-2 text6 textCL">
              <li>
                Se corrigió un error que impedía guardar ingredientes
                frecuentes.
              </li>
              <li>
                Las notificaciones push ahora se adaptan a tu horario habitual
                de uso.
              </li>
              <li>
                Optimizamos el rendimiento general en celulares de gama
                media/baja.
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Download Section */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden mt-10 mb-10">
        <DownloadSectionBG
          background="bg-gradient-to-b from-[#ED213A] to-[#93291E]"
          background2="bg-red"
        />
      </div>
    </div>
  );
};

export default ChangeLog;
