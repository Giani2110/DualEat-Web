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
import { ROUTES } from "../../constants/constants";

import CommunityModal from "../modal/CommunityModal";
import { useCommunity } from "../../hooks/useUCommunity";

import "../../assets/scss/users/users.scss";

interface Props {
  children: React.ReactNode;
}

const UIDashboard: React.FC<Props> = ({ children }) => {
  const { logout, user } = useAuth();
  const { userCommunities } = useCommunity();
  const [isSideBarOpen, setIsSideBarOpen] = React.useState(true);
  const [isPinned, setIsPinned] = React.useState(true);

  const [communityOpen, setCommunityOpen] = React.useState(true);
  const [following, setFollowing] = React.useState(true);

  const [createCommunityModalOpen, setCreateCommunityModalOpen] =
    React.useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleSidebarPin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);

    setIsSideBarOpen(newPinned ? true : false);
  };

  return (
    <div className="min-h-screen bgFood">
      <section
        className={`dashboard-layout pt-15 ${
          isSideBarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {/* Sidebar */}
        <div
          className={`border-r overflow-visible sidebar bg-[#fcfcfc] border-[#e5a657] fixed h-[100vh] ${
            isSideBarOpen ? "w-[280px]" : "w-[40px]"
          } transition-width duration-300`}
        >
          <div className="mt-4 flex flex-col justify-between h-[90vh] ms-4  me-9 text-[13px] pb-3 relative">
            {/* Botón posicionado en el borde derecho */}
            <button
              title={isSideBarOpen ? "Ocultar menú" : "Mostrar menú"}
              onClick={toggleSidebarPin}
              type="button"
              className={`cursor-pointer py-1 absolute top-2 z-10 bg-white border border-[#e5a657] rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow ${
                isSideBarOpen ? "-right-[55px]" : "-right-[45px]"
              }`}
            >
              <AlignJustify color="#e27434" size={20} />
            </button>

            {isSideBarOpen && (
              <>
                <div className="flex flex-col">
                  <Link
                    title="Inicio"
                    to={ROUTES.USER.DASHBOARD}
                    className={`navlis rounded-[8px] cursor-pointer px-4 hover:bg-[#e9e9e9] py-[10px]`}
                  >
                    <div>
                      <House color="#e5a657" size={22} strokeWidth={1.7} />
                    </div>
                    <span className={`ml-3 text4 text-[15px]`}>Inicio</span>
                  </Link>
                  <Link
                    title="Explorar comunidades"
                    to={ROUTES.USER.EXPLORE}
                    className={`navlis rounded-[8px] cursor-pointer px-4 hover:bg-[#e9e9e9] py-[10px]`}
                  >
                    <div>
                      <Users color="#e5a657" size={22} strokeWidth={1.7} />
                    </div>
                    <span className={`ml-3 text4 text-[15px]`}>Explorar</span>
                  </Link>
                  <Link
                    title="Recetas"
                    to={ROUTES.USER.RECIPES}
                    className={`navlis rounded-[8px] cursor-pointer px-4 hover:bg-[#e9e9e9] py-[10px]`}
                  >
                    <div>
                      <BookText color="#e5a657" size={22} strokeWidth={1.5} />
                    </div>
                    <span className={`ml-3 text4 text-[15px]`}>Recetas</span>
                  </Link>

                  <div className="border-t border-[#e5a657] mt-5"></div>

                  {/** Comunidades */}
                  <div
                    onClick={() => setCommunityOpen(!communityOpen)}
                    className={` transition-all duration-300 cursor-pointer w-full py-[10px] overflow-hidden ${
                      communityOpen ? "h-fit" : "h-[50px]"
                    }
                  `}
                  >
                    <div
                      className={`flex justify-between px-1 items-center rounded-[8px] hover:bg-[#e9e9e9] py-[10px]`}
                    >
                      {isSideBarOpen && (
                        <>
                          <span
                            className={`ml-2 text-left text-[15px] tracking-wider text5`}
                          >
                            Comunidades
                          </span>
                          <ChevronUp
                            size={20}
                            color="#333333"
                            className={`transition-transform duration-300 ${
                              communityOpen ? "rotate-180" : "rotate-0"
                            } `}
                          />
                        </>
                      )}
                    </div>
                    {communityOpen && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCreateCommunityModalOpen(
                              !createCommunityModalOpen
                            );
                          }}
                          type="button"
                          className={`navlis rounded-[8px] cursor-pointer w-full py-[10px] ${
                            isSideBarOpen ? "hover:bg-[#e9e9e9] px-5" : "px-2"
                          }`}
                        >
                          <Plus
                            className="flex-shrink-0"
                            color="#e5a657"
                            size={26}
                            strokeWidth={1.7}
                          />
                          <span
                            className={`ml-2 text4 text-[15px] whitespace-nowrap ${
                              isSideBarOpen ? "block" : "hidden"
                            }`}
                          >
                            Crear comunidad
                          </span>
                        </button>

                        {userCommunities.map((community) => (
                          <Link
                            key={community.community.id}
                            title={community.community.name}
                            to={`/comunidad/${community.community.id}`}
                            className={`navlis flex-[1] rounded-[8px] cursor-pointer w-full py-[7px] hover:bg-[#e9e9e9] px-4`}
                          >
                            <img
                              src={community.community.image_url !== null && community.community.image_url || "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"}
                              className={`rounded-full h-8 w-8 flex-shrink-0`}
                              alt="Imagen de la comunidad"
                            />

                            <span
                              className={`ml-[10px] text-[15px] text4 whitespace-nowrap`}
                            >
                              {community.community.name}
                            </span>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="border-t border-[#e5a657] mt-5"></div>

                  {/** Siguiendo */}
                  <div
                    onClick={() => setFollowing(!following)}
                    className={`transition-all duration-300 w-full py-2 cursor-pointer overflow-hidden ${
                      following ? "h-fit" : "h-[50px]"
                    }
                  
                `}
                  >
                    <div
                      className={`flex justify-between px-1 items-center rounded-[5px] ${
                        isSideBarOpen && "hover:bg-[#e9e9e9] py-3"
                      } `}
                    >
                      <span
                        className={`ml-2 text-left text-[15px] tracking-wider text5 ${
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
                      isSideBarOpen && "hover:bg-[#e9e9e9]"
                    }`}
                  >
                    <LogOut
                      color="#b53325"
                      className="flex-shrink-0"
                      size={20}
                      strokeWidth={2.5}
                    />
                    <span
                      className={`ml-3 text-left text-[15px] text4 whitespace-nowrap ${
                        isSideBarOpen ? "block" : "hidden"
                      }`}
                    >
                      Cerrar sesión
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div
          className={`main-content ${isSideBarOpen ? "ps-[10%]" : "ps-[4%]"}`}
        >
          {children}
        </div>
      </section>
      {createCommunityModalOpen && user && (
        <CommunityModal
          onClose={() => setCreateCommunityModalOpen(false)}
          user={user}
        />
      )}
    </div>
  );
};

export default UIDashboard;
