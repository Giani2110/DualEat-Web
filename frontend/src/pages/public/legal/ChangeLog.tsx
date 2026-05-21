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
        <div className="max-w-screen-2xl mx-auto text-center pt-[160px] px-4">
          <h1 className="text-[48px] Dosis-Bold mb-4 animate-fade-in">Changelog</h1>
          <p className="text-[18px] max-w-2xl mx-auto leading-[32px] tracking-[-0.3px]">
            Historial de cambios realizados a lo largo del sistema de DualEat
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-4 mt-4">
        <div className="bg-gray py-[70px] px-8 rounded-[20px] min-h-[500px]">
          {/* Tabs Filters */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-16 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setVisibleCount(15);
              }}
              className={`px-5 py-2.5 text-[14px] Dosis-Bold border rounded-full transition-all duration-300 cursor-pointer ${
                filter === "all"
                  ? "bg-red text-white border-[#b53325] hover:bg-[#923025]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("web");
                setVisibleCount(15);
              }}
              className={`px-5 py-2.5 text-[14px] Dosis-Bold border rounded-full transition-all duration-300 cursor-pointer ${
                filter === "web"
                  ? "text-white hover:opacity-90"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
              style={{
                backgroundColor: filter === "web" ? "var(--bg-blue)" : undefined,
                borderColor: filter === "web" ? "var(--bg-blue)" : undefined,
              }}
            >
              Cambios Visuales
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("backend");
                setVisibleCount(15);
              }}
              className={`px-5 py-2.5 text-[14px] Dosis-Bold border rounded-full transition-all duration-300 cursor-pointer ${
                filter === "backend"
                  ? "text-white hover:opacity-90"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
              style={{
                backgroundColor: filter === "backend" ? "var(--bg-yellow)" : undefined,
                borderColor: filter === "backend" ? "var(--bg-yellow)" : undefined,
              }}
            >
              Cambios Internos
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("mobile");
                setVisibleCount(15);
              }}
              className={`px-5 py-2.5 text-[14px] Dosis-Bold border rounded-full transition-all duration-300 cursor-pointer ${
                filter === "mobile"
                  ? "text-white hover:opacity-90"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
              style={{
                backgroundColor: filter === "mobile" ? "var(--bg-red)" : undefined,
                borderColor: filter === "mobile" ? "var(--bg-red)" : undefined,
              }}
            >
              Cambios en la App
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => loadCommits(true)}
              disabled={loading}
              title="Sincronizar cambios"
              className="p-2.5 text-gray-500 hover:text-red hover:bg-white rounded-full border border-transparent hover:border-gray-200 cursor-pointer transition-all duration-300 disabled:opacity-50 flex items-center justify-center ml-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* List Section */}
          <div className="max-w-[55%] mx-auto">
            <AnimatePresence mode="wait">
              {loading && commits.length === 0 ? (
                /* Skeleton Loader */
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="pb-8 pt-8 border-b border-gray-200 animate-pulse space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/5"></div>
                      </div>
                      <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ))}
                </motion.div>
              ) : error && commits.length === 0 ? (
                /* Error UI */
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 space-y-4"
                >
                  <p className="text-[18px] text-gray-500 Dosis-Medium">{error}</p>
                  <button
                    type="button"
                    onClick={() => loadCommits(true)}
                    className="inline-flex items-center space-x-2 bg-red text-white Dosis-Bold px-6 py-2.5 rounded-full cursor-pointer hover:bg-[#923025] transition-all duration-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reintentar ahora</span>
                  </button>
                </motion.div>
              ) : commitsToShow.length === 0 ? (
                /* Empty Filter UI */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 text-gray-400 Dosis-Medium text-[18px]"
                >
                  No se encontraron cambios recientes en esta categoría.
                </motion.div>
              ) : (
                /* Commit List */
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="divide-y divide-gray-200"
                >
                  {commitsToShow.map((commit, idx) => {
                    const badge = getRepoBadgeConfig(commit.repo);
                    return (
                      <motion.div
                        key={commit.sha}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
                        className="py-8 group relative"
                      >
                        {/* Meta information: Date & Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h2 className="text-[15px] text4 font-medium">
                            {formatDate(commit.date)}
                          </h2>
                          <span
                            className={`px-3 py-1 text-[11px] font-bold border rounded-full ${badge.style}`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        {/* Title (Subject) */}
                        <h3 className="titleCL Dosis-Bold text-gray-900 mb-1 mt-3 transition-colors duration-200">
                          {commit.title}
                        </h3>

                        {/* Description (Body of the commit) */}
                        {commit.description && (
                          <p className="text6 textCL whitespace-pre-line leading-relaxed text-gray-500 mt-2 pr-4">
                            {commit.description}
                          </p>
                        )}

                        {/* GitHub Commit Link (Elegant detail) */}
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-[12px] text-gray-400 hover:text-red transition-colors duration-200"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Ver commit</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination: Load More Button */}
            {!loading && filteredCommits.length > visibleCount && (
              <div className="text-center pt-10 pb-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 15)}
                  className="bg-red text-white Dosis-Bold px-8 py-3 rounded-full hover:bg-[#923025] hover:shadow-md transition-all duration-300 cursor-pointer text-[14px]"
                >
                  Cargar más cambios
                </button>
              </div>
            )}
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
