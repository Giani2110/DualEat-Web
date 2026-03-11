/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/constants";

import { ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

import Logo from "../../assets/images/icon/Logo_DualEat.png";

import "../../assets/scss/error/error.scss";

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const handleNavigate = () => {
    if (user && user.isBusiness) {
      navigate(ROUTES.LOCAL.DASHBOARD);
    } else if (user && !user.isBusiness) {
      navigate(ROUTES.USER.DASHBOARD);
    } else {
      navigate(ROUTES.AUTH.LOGIN);
    }
  };

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    const glitch = () => {
      const durations = [50, 80, 50, 80]; // Tiempos de parpadeo en ms
      let currentIndex = 0;

      const blink = () => {
        if (currentIndex >= durations.length * 2) {
          currentIndex = 0;
          return;
        }

        // Alternar entre visible e invisible
        dot.style.opacity = currentIndex % 2 === 0 ? "0.1" : "1";

        setTimeout(() => {
          currentIndex++;
          blink();
        }, durations[Math.floor(currentIndex / 2)] || 100);
      };

      blink();
    };

    // Ejecutar cada 4 segundos
    const interval = setInterval(glitch, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    // ========================================
    // FUNCIÓN PARA CALCULAR TAMAÑO RESPONSIVE
    // ========================================
    const getResponsiveSize = () => {
      const width = window.innerWidth;

      if (width < 476) {
        // Mobile
        return {
          canvasWidth: Math.min(width - 40, 400),
          canvasHeight: 180,
          spacing: 8,
          dotRadius: 3,
          hollowRadius: 1.5,
          inactiveRadius: 2,
        };
      } else if (width < 640) {
        // Mobile
        return {
          canvasWidth: Math.min(width - 40, 400),
          canvasHeight: 180,
          spacing: 10,
          dotRadius: 3,
          hollowRadius: 1.5,
          inactiveRadius: 2,
        };
      } else if (width < 1224) {
        // Tablet
        return {
          canvasWidth: 560,
          canvasHeight: 220,
          spacing: 12,
          dotRadius: 4,
          hollowRadius: 1.8,
          inactiveRadius: 2.5,
        };
      } else {
        // Desktop
        return {
          canvasWidth: 720,
          canvasHeight: 280,
          spacing: 17,
          dotRadius: 5,
          hollowRadius: 2,
          inactiveRadius: 3,
        };
      }
    };

    const initCanvas = () => {
      const size = getResponsiveSize();

      // Limpiar dots anteriores
      dots.length = 0;

      // ========================================
      // TAMAÑO DEL CANVAS
      // ========================================
      canvas.width = size.canvasWidth;
      canvas.height = size.canvasHeight;

      // ========================================
      // CONFIGURACIÓN
      // ========================================
      const spacing = size.spacing;
      const dotRadius = size.dotRadius;
      const hollowRadius = size.hollowRadius;
      const inactiveRadius = size.inactiveRadius;

      // Colores
      const offColor = "#333333";

      // Estado del hover
      let isHovering = false;
      let hoverProgress = 0;

      // ========================================
      // PATRÓN DEL 404
      // ========================================
      const pattern404 = [
        "000022000220000220000220000220000220000",
        "220112021110220011111112000021102011122",
        "001110201112002111111111022011120211100",
        "001112021110220111020111000011102011122",
        "221110201112002111202111200211120211100",
        "001112021110220111020111000011120211122",
        "221111111112002111202111022011111111100",
        "001111111110220111020111000011111111122",
        "220022001112002111202111200200000011100",
        "002200221110220111020111022000220011122",
        "220022001112002111111111000022002211100",
        "002200221110000011111110000000220011122",
        "00220000220000220000220000220000220000",
      ];

      // ========================================
      // CLASE DOT
      // ========================================
      class Dot {
        x: number;
        y: number;
        row: number;
        col: number;
        radius: number;
        type: "inactive" | "active" | "hollow";
        brightness: number;
        targetBrightness: number;
        changeTimer: number;
        changeDelay: number;
        hoverActive: boolean;

        constructor(
          x: number,
          y: number,
          row: number,
          col: number,
          type: "inactive" | "active" | "hollow"
        ) {
          this.x = x;
          this.y = y;
          this.row = row;
          this.col = col;
          this.type = type;
          this.hoverActive = false;

          // Tamaño según tipo
          if (type === "active") {
            this.radius = dotRadius;
          } else if (type === "hollow") {
            this.radius = hollowRadius;
          } else {
            this.radius = inactiveRadius;
          }

          // Configuración de respiración
          if (type === "active" || type === "hollow") {
            this.brightness = Math.random() * 0.5 + 0.3;
            this.targetBrightness = Math.random() * 0.5 + 0.3;
            this.changeTimer = Math.random() * 100;
            this.changeDelay = Math.random() * 80 + 60;
          } else {
            this.brightness = 0;
            this.targetBrightness = 0;
            this.changeTimer = 0;
            this.changeDelay = 0;
          }
        }

        update() {
          if (this.type === "inactive") return;

          this.changeTimer++;

          // Cambiar brillo objetivo (respiración)
          if (this.changeTimer > this.changeDelay) {
            this.targetBrightness = Math.random() * 0.5 + 0.3;
            this.changeTimer = 0;
            this.changeDelay = Math.random() * 100 + 80;
          }

          // Transición suave
          const speed = 0.015;
          if (this.brightness < this.targetBrightness) {
            this.brightness = Math.min(
              this.brightness + speed,
              this.targetBrightness
            );
          } else if (this.brightness > this.targetBrightness) {
            this.brightness = Math.max(
              this.brightness - speed,
              this.targetBrightness
            );
          }
        }

        draw() {
          if (this.type === "hollow") {
            // ========================================
            // DOTS HUECOS (solo borde)
            // ========================================
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

            // Borde gris que respira
            const gray = Math.floor(80 + this.brightness * 120);
            ctx.strokeStyle = `rgb(${gray}, ${gray}, ${gray})`;
            ctx.lineWidth = 1;

            ctx.stroke();
          } else {
            // ========================================
            // DOTS NORMALES (rellenos)
            // ========================================
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

            if (this.type === "active") {
              if (this.hoverActive) {
                // Rosa/rojo en hover
                const r = Math.floor(320 * this.brightness);
                const g = Math.floor(92 * this.brightness);
                const b = Math.floor(110 * this.brightness);
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              } else {
                // Grises cuando respira
                const gray = Math.floor(80 + this.brightness * 120);
                ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
              }
            } else {
              // Inactivos (apagados)
              ctx.fillStyle = offColor;
            }

            ctx.fill();
          }
        }
      }

      // ========================================
      // CREAR GRILLA CON PATRÓN
      // ========================================
      const createDots = () => {
        const rows = pattern404.length;
        const cols = pattern404[0].length;

        const offsetX = (canvas.width - cols * spacing) / 2;
        const offsetY = (canvas.height - rows * spacing) / 2;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * spacing + offsetX;
            const y = row * spacing + offsetY;
            const char = pattern404[row][col];

            // Determinar tipo de dot
            let type: "inactive" | "active" | "hollow";
            if (char === "1") {
              type = "active";
            } else if (char === "2") {
              type = "hollow";
            } else {
              type = "inactive";
            }

            dots.push(new Dot(x, y, row, col, type));
          }
        }
      };

      createDots();

      // ========================================
      // CALCULAR ALTURA MÁXIMA POR COLUMNA
      // ========================================
      const cols = pattern404[0].length;
      const maxRowPerCol: number[] = new Array(cols).fill(-1);

      // Encontrar el punto más bajo de cada columna
      dots.forEach((dot) => {
        if (
          (dot.type === "active" || dot.type === "hollow") &&
          dot.row > maxRowPerCol[dot.col]
        ) {
          maxRowPerCol[dot.col] = dot.row;
        }
      });

      // ========================================
      // ACTUALIZAR HOVER DE COLUMNAS
      // ========================================
      const updateHoverEffect = () => {
        if (isHovering) {
          hoverProgress = Math.min(hoverProgress + 0.03, 1);
        } else {
          hoverProgress = Math.max(hoverProgress - 0.05, -0.1);
        }

        // Activar dots por columna de abajo hacia arriba
        dots.forEach((dot) => {
          if (dot.type === "inactive") {
            dot.hoverActive = false;
            return;
          }

          const maxRow = maxRowPerCol[dot.col];
          if (maxRow === -1) {
            dot.hoverActive = false;
            return;
          }

          const normalizedRow = 1 - dot.row / maxRow;
          dot.hoverActive = hoverProgress >= normalizedRow;
        });
      };

      // ========================================
      // EVENTOS DE HOVER
      // ========================================
      const handleMouseEnter = () => {
        isHovering = true;
      };

      const handleMouseLeave = () => {
        isHovering = false;
      };

      canvas.addEventListener("mouseenter", handleMouseEnter);
      canvas.addEventListener("mouseleave", handleMouseLeave);

      // ========================================
      // ANIMACIÓN
      // ========================================
      const animate = () => {
        ctx.fillStyle = "#020202";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        updateHoverEffect();

        dots.forEach((dot) => {
          dot.update();
          dot.draw();
        });

        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      // Guardar cleanup functions
      cleanupFunctions.mouseEnter = handleMouseEnter;
      cleanupFunctions.mouseLeave = handleMouseLeave;
    };

    // ========================================
    // VARIABLES GLOBALES
    // ========================================
    const dots: any[] = [];
    let animationFrameId: number;
    const cleanupFunctions = {
      mouseEnter: null as any,
      mouseLeave: null as any,
    };

    // Inicializar canvas
    initCanvas();

    // ========================================
    // REDIMENSIONAR (con debounce)
    // ========================================
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Cancelar animación actual
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        // Remover eventos anteriores
        if (canvas && cleanupFunctions.mouseEnter) {
          canvas.removeEventListener("mouseenter", cleanupFunctions.mouseEnter);
          canvas.removeEventListener("mouseleave", cleanupFunctions.mouseLeave);
        }
        // Reinicializar
        initCanvas();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    // ========================================
    // CLEANUP
    // ========================================
    return () => {
      clearTimeout(resizeTimeout);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (canvas && cleanupFunctions.mouseEnter) {
        canvas.removeEventListener("mouseenter", cleanupFunctions.mouseEnter);
        canvas.removeEventListener("mouseleave", cleanupFunctions.mouseLeave);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen E404 flex flex-col">
      {/* Header */}
      <header className="px-4 mx-5 pt-5 pb-4 sm:pb-5 border-b border-[#2f2f2f]">
        <div className="flex justify-between items-center">
          <div
            role="button"
            onClick={() => handleNavigate()}
            className="flex gap-2 items-center cursor-pointer hover:scale-104 transition-all duration-200"
          >
            <img src={Logo} alt="Logo de DualEat" className="w-6 h-6" />
            <h1 className="text-base sm:text-[17px] md:text-[19px] Dosis-Bold text2">
              DualEat
            </h1>
          </div>

          {user ? (
            <img
              src={user.avatar_url || undefined}
              alt="Imagen de perfil"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#707070] object-cover cursor-pointer hover:scale-105 transition-all duration-200"
            />
          ) : (
            <img
              src={
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
              }
              alt="Imagen de perfil"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#dbdbdb] object-cover cursor-pointer hover:scale-105 transition-all duration-200"
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto w-full py-8 sm:py-12">
          {/* Text Content */}
          <div className="flex flex-col order-2 lg:order-1">
            <div className="flex items-center gap-2 pb-4 sm:pb-5 text1">
              <div
                ref={dotRef}
                className="rounded-full w-2 h-2 bg-[#ff6111] flex-shrink-0"
              />
              <span className="text-xs tracking-wide">ERROR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl Dosis-Bold text2 mb-2 sm:mb-3 leading-tight">
              <span className="Dosis-ExtraBold text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                404
              </span>
              : Ups... ¡Se nos cayó la bandeja!
            </h2>

            <p className="text-sm sm:text-base md:text-lg text4 mb-6 sm:mb-8">
              La página que buscás no está disponible.
            </p>

            <button
              type="button"
              onClick={() => handleNavigate()}
              className="animated-button flex items-center justify-center sm:justify-start gap-2 w-full sm:w-fit px-5  py-2 border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-all duration-100 rounded text-sm sm:text-base cursor-pointer hover:scale-102"
            >
              Volver al inicio
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Canvas */}
          <div className="flex justify-center items-center order-1 lg:order-2">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs sm:text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} DualEat. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
