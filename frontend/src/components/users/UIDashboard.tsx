import React from "react";
import {
  House,
  Users,
  BookText,
  AlignJustify,
  LogOut,
  ChevronUp,
  Plus,
} from "lucide-react";
import "../../assets/scss/users/users.scss";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CommunityModal from "../modal/CommunityModal";

interface Props {
  children: React.ReactNode;
}

const UIDashboard: React.FC<Props> = ({ children }) => {
  const { logout, user } = useAuth();
  const [isSideBarOpen, setIsSideBarOpen] = React.useState(true);
  const [isPinned, setIsPinned] = React.useState(true);

  const [communityOpen, setCommunityOpen] = React.useState(true);
  const [following, setFollowing] = React.useState(true);

  const [createCommunityModalOpen, setCreateCommunityModalOpen] =
    React.useState(false);

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsSideBarOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsSideBarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleSidebarPin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);

    setIsSideBarOpen(newPinned ? true : false);
  };

  return (
    <div className="min-h-screen bg-[#fbf7f4]">
      <section
        className={`mt-[60px] dashboard-layout min-h-screen ${
          isSideBarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {/* Sidebar */}
        <div
          className={`border-r overflow-hidden sidebar bg-white border-[#e5a657] fixed h-[100vh] ${
            isSideBarOpen ? "w-[240px]" : "w-[60px]"
          } transition-width duration-300`}
        >
          <div className="mt-4 m-[10px] flex flex-col justify-between h-[90vh] text-[13px] pb-3">
            <div className="flex justify-between gap-3 flex-col">
              <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={isSideBarOpen ? "Ocultar menú" : "Mostrar menú"}
                onClick={toggleSidebarPin}
                type="button"
                className="cursor-pointer px-2 py-2 mb-5"
              >
                <AlignJustify color="#c0853c" size={20} />
              </button>

              <Link
                title="Inicio"
                to="/feed"
                className={`navlis rounded-[5px] cursor-pointer px-2 py-2 ${
                  isSideBarOpen && "hover:bg-[#f6f8f9]"
                }`}
              >
                <div>
                  <House color="#c0853c" size={22} strokeWidth={1.7} />
                </div>
                <span
                  className={`ml-3 text4 ${isSideBarOpen ? "block" : "hidden"}`}
                >
                  Inicio
                </span>
              </Link>
              <Link
                title="Explorar comunidades"
                to="/feed"
                className={`navlis rounded-[5px] cursor-pointer px-2 py-2 ${
                  isSideBarOpen && "hover:bg-[#f6f8f9]"
                }`}
              >
                <div>
                  <Users color="#c0853c" size={22} strokeWidth={1.7} />
                </div>
                <span
                  className={`ml-3 text4 ${isSideBarOpen ? "block" : "hidden"}`}
                >
                  Comunidades
                </span>
              </Link>
              <Link
                title="Recetas"
                to="/feed"
                className={`navlis rounded-[5px] cursor-pointer px-2 py-2 ${
                  isSideBarOpen && "hover:bg-[#f6f8f9]"
                }`}
              >
                <div>
                  <BookText color="#c0853c" size={22} strokeWidth={1.5} />
                </div>
                <span
                  className={`ml-3 text4 ${isSideBarOpen ? "block" : "hidden"}`}
                >
                  Recetas
                </span>
              </Link>

              {/** Comunidades */}
              <div
                onClick={() =>
                  isSideBarOpen && setCommunityOpen(!communityOpen)
                }
                className={` transition-all duration-300 w-full py-2 border-t border-[#e5a657] overflow-hidden ${
                  communityOpen ? "h-fit" : "h-[50px]"
                }
                  ${isSideBarOpen && "cursor-pointer"}`}
              >
                <div
                  className={`flex justify-between px-3 items-center rounded-[5px] ${
                    isSideBarOpen && "hover:bg-[#f6f8f9] py-3"
                  } `}
                >
                  <span
                    className={`ml-2 text-left text-[12px] tracking-wider text5  ${
                      isSideBarOpen ? "block" : "hidden"
                    }`}
                  >
                    Comunidades
                  </span>
                  <ChevronUp
                    size={20}
                    color="#333333"
                    className={`transition-transform duration-300 ${
                      communityOpen ? "rotate-180" : "rotate-0"
                    }  ${isSideBarOpen ? "block" : "hidden"}`}
                  />
                </div>
                {communityOpen && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreateCommunityModalOpen(!createCommunityModalOpen);
                    }}
                    type="button"
                    className={`navlis rounded-[5px] cursor-pointer w-full px-2 py-2 ${
                      isSideBarOpen && "hover:bg-[#f6f8f9]"
                    }`}
                  >
                    <Plus
                      className="flex-shrink-0"
                      color="#c0853c"
                      size={22}
                      strokeWidth={1.7}
                    />
                    <span
                      className={`ml-3 text4 whitespace-nowrap ${
                        isSideBarOpen ? "block" : "hidden"
                      }`}
                    >
                      Crear comunidad
                    </span>
                  </button>
                )}
              </div>

              {/** Siguiendo */}
              <div
                onClick={() => setFollowing(!following)}
                className={`transition-all duration-300 w-full py-2 cursor-pointer overflow-hidden ${
                  following ? "h-fit" : "h-[50px]"
                }
                  ${
                    !isSideBarOpen && communityOpen
                      ? "border-t border-[#e5a657]"
                      : "border-none"
                  }
                `}
              >
                <div
                  className={`flex justify-between px-3 items-center rounded-[5px] ${
                    isSideBarOpen && "hover:bg-[#f6f8f9] py-3"
                  } `}
                >
                  <span
                    className={`ml-2 text-left text-[12px] tracking-wider text5 ${
                      isSideBarOpen ? "block" : "hidden"
                    }`}
                  >
                    Siguiendo
                  </span>
                  <ChevronUp
                    size={20}
                    color="#333333"
                    className={`transition-transform duration-300 ${
                      following ? "rotate-180" : "rotate-0"
                    }  ${isSideBarOpen ? "block" : "hidden"}`}
                  />
                </div>
              </div>
            </div>

            {/** Botón de cerrar sesión */}
            <div>
              <button
                type="button"
                onClick={() => handleLogout()}
                className={`navlis w-full rounded-[5px] cursor-pointer px-2 py-3 ${
                  isSideBarOpen && "hover:bg-[#f6f8f9]"
                }`}
              >
                <LogOut
                  color="#b53325"
                  className="flex-shrink-0"
                  size={20}
                  strokeWidth={2.5}
                />
                <span
                  className={`ml-3 text-left text4 whitespace-nowrap ${
                    isSideBarOpen ? "block" : "hidden"
                  }`}
                >
                  Cerrar sesión
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex main-content flex-col p-6 w-[70%] transition-all duration-300">
          {children}
        </div>
      </section>
      {createCommunityModalOpen && (
        <CommunityModal onClose={() => setCreateCommunityModalOpen(false)} user={user} />
      )}
    </div>
  );
};

export default UIDashboard;
