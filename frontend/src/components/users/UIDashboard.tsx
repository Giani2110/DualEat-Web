import React, { useState } from "react";
import {
  AlignJustify,
  LogOut,
  ChevronUp,
  Plus,
} from "lucide-react";
import "../../assets/scss/users/users.scss";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/constants";
import { useLocation } from "react-router-dom";

import CommunityModal from "../modal/CommunityModal";
import { useCommunity } from "../../hooks/useUCommunity";

import "../../assets/scss/users/users.scss";

interface Props {
  children: React.ReactNode;
  isSideBarOpen?: boolean;
  toggleSidebar: () => void;
}

const UIDashboard: React.FC<Props> = ({
  children,
  toggleSidebar,
  isSideBarOpen,
}) => {
  const { logout, user } = useAuth();
  const { userCommunities } = useCommunity();
  const location = useLocation();

  const [communityOpen, setCommunityOpen] = useState(true);
  const [following, setFollowing] = useState(true);

  const [createCommunityModalOpen, setCreateCommunityModalOpen] =
    useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleSidebarOpen = () => {
    toggleSidebar();
  };

  const sidebarContent = (
    <>
      <div className="flex flex-col">
        <Link
          title="Inicio"
          to={ROUTES.USER.DASHBOARD}
          className={`navlis rounded-[8px] cursor-pointer px-4 hover:bg-[#e9e9e9] py-[10px]`}
        >
          {location.pathname === ROUTES.USER.DASHBOARD ? (
            <>
             <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640"><path fill="#e5a657" d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z"/></svg>
             <span className={`ml-3 text4 text-[15px] Dosis-Bold text3`}>Inicio</span>
             </>
          ) : (
            <>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640"><path fill="#e5a657" d="M304 70.1C313.1 61.9 326.9 61.9 336 70.1L568 278.1C577.9 286.9 578.7 302.1 569.8 312C560.9 321.9 545.8 322.7 535.9 313.8L527.9 306.6L527.9 511.9C527.9 547.2 499.2 575.9 463.9 575.9L175.9 575.9C140.6 575.9 111.9 547.2 111.9 511.9L111.9 306.6L103.9 313.8C94 322.6 78.9 321.8 70 312C61.1 302.2 62 287 71.8 278.1L304 70.1zM320 120.2L160 263.7L160 512C160 520.8 167.2 528 176 528L224 528L224 424C224 384.2 256.2 352 296 352L344 352C383.8 352 416 384.2 416 424L416 528L464 528C472.8 528 480 520.8 480 512L480 263.7L320 120.3zM272 528L368 528L368 424C368 410.7 357.3 400 344 400L296 400C282.7 400 272 410.7 272 424L272 528z"/></svg>
            <span className={`ml-3 text4 text-[15px]`}>Inicio</span>
            </>
          )}
         
          
        </Link>
        <Link
          title="Explorar comunidades"
          to={ROUTES.USER.EXPLORE}
          className={`navlis rounded-[8px] cursor-pointer px-4 hover:bg-[#e9e9e9] py-[10px]`}
        >
          {location.pathname === ROUTES.USER.EXPLORE ? (
            <>
             <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640"><path fill="#e5a657" d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"/></svg>
             <span className={`ml-3 text4 text-[15px] Dosis-Bold text3`}>Explorar</span>
             </>
          ) : (
            <>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640"><path fill="#e5a657" d="M320 256C355.3 256 384 227.3 384 192C384 156.7 355.3 128 320 128C284.7 128 256 156.7 256 192C256 227.3 284.7 256 320 256zM320 80C381.9 80 432 130.1 432 192C432 253.9 381.9 304 320 304C258.1 304 208 253.9 208 192C208 130.1 258.1 80 320 80zM296 400C238.6 400 192 446.6 192 504L192 520C192 533.3 181.3 544 168 544C154.7 544 144 533.3 144 520L144 504C144 420.1 212.1 352 296 352L344 352C427.9 352 496 420.1 496 504L496 520C496 533.3 485.3 544 472 544C458.7 544 448 533.3 448 520L448 504C448 446.6 401.4 400 344 400L296 400zM431.4 306.8C443.1 295.5 453 282.4 460.8 268C466.7 270.6 473.2 272 480 272C506.5 272 528 250.5 528 224C528 197.5 506.5 176 480 176L479.2 176C477.6 159.4 473.4 143.6 467.1 128.9C471.3 128.3 475.7 128 480 128C533 128 576 171 576 224C576 277 533 320 480 320C462.3 320 445.7 315.2 431.4 306.8zM160 128C164.4 128 168.7 128.3 172.9 128.9C166.6 143.6 162.4 159.5 160.8 176L160 176C133.5 176 112 197.5 112 224C112 250.5 133.5 272 160 272C166.8 272 173.3 270.6 179.2 268C187 282.4 196.9 295.5 208.6 306.8C194.4 315.2 177.8 320 160 320C107 320 64 277 64 224C64 171 107 128 160 128zM149.3 368C134.2 384.3 121.8 403 112.8 423.6C74.8 439.1 48 476.4 48 520C48 533.3 37.3 544 24 544C10.7 544 0 533.3 0 520C0 436.9 66.6 369.4 149.3 368zM527.2 423.6C518.2 403 505.7 384.2 490.7 368C573.4 369.4 640 436.9 640 520C640 533.3 629.3 544 616 544C602.7 544 592 533.3 592 520C592 476.4 565.2 439.1 527.2 423.6z"/></svg>
            <span className={`ml-3 text4 text-[15px]`}>Explorar</span>
            </>
          )}
          
        </Link>
        <Link
          title="Recetas"
          to={ROUTES.USER.RECIPES}
          className={`navlis rounded-[8px] cursor-pointer px-4 hover:bg-[#e9e9e9] py-[10px]`}
        >
          {location.pathname === ROUTES.USER.RECIPES ? (
            <>
             <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640"><path fill="#e5a657" d="M480 576L192 576C139 576 96 533 96 480L96 160C96 107 139 64 192 64L496 64C522.5 64 544 85.5 544 112L544 400C544 420.9 530.6 438.7 512 445.3L512 512C529.7 512 544 526.3 544 544C544 561.7 529.7 576 512 576L480 576zM192 448C174.3 448 160 462.3 160 480C160 497.7 174.3 512 192 512L448 512L448 448L192 448zM224 216C224 229.3 234.7 240 248 240L424 240C437.3 240 448 229.3 448 216C448 202.7 437.3 192 424 192L248 192C234.7 192 224 202.7 224 216zM248 288C234.7 288 224 298.7 224 312C224 325.3 234.7 336 248 336L424 336C437.3 336 448 325.3 448 312C448 298.7 437.3 288 424 288L248 288z"/></svg>
             <span className={`ml-3 text4 text-[15px] Dosis-Bold`}>Recetas</span>
             </>
          ) : (
            <>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640"><path fill="#e5a657" d="M184 64C135.4 64 96 103.4 96 152L96 496C96 540.2 131.8 576 176 576L520 576C533.3 576 544 565.3 544 552C544 538.7 533.3 528 520 528L512 528L512 451.9C531.3 439 544 417 544 392L544 136C544 96.2 511.8 64 472 64L184 64zM464 464L464 528L176 528C158.3 528 144 513.7 144 496C144 478.3 158.3 464 176 464L464 464zM176 416C164.6 416 153.8 418.4 144 422.7L144 152C144 129.9 161.9 112 184 112L472 112C485.3 112 496 122.7 496 136L496 392C496 405.3 485.3 416 472 416L176 416zM224 216C224 229.3 234.7 240 248 240L424 240C437.3 240 448 229.3 448 216C448 202.7 437.3 192 424 192L248 192C234.7 192 224 202.7 224 216zM248 288C234.7 288 224 298.7 224 312C224 325.3 234.7 336 248 336L424 336C437.3 336 448 325.3 448 312C448 298.7 437.3 288 424 288L248 288z"/></svg>
            <span className={`ml-3 text4 text-[15px]`}>Recetas</span>
            </>
          )}
          
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
                  setCreateCommunityModalOpen(!createCommunityModalOpen);
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
                    src={
                      (community.community.image_url !== null &&
                        community.community.image_url) ||
                      "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                    }
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
  );

  return (
    <div
      className={`min-h-screen bgFood ${
        isSideBarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      {isSideBarOpen && (
        <div
          onClick={toggleSidebarOpen}
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
        />
      )}
      <section
        className={`dashboard-layout pt-15 ${
          isSideBarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {/* Sidebar mobile */}
        <div
          className={`fixed pt-6 pe-4 top-10 left-0 h-full bg-white shadow-lg overflow-y-auto border-r border-[#e5a657] z-40 transform transition-transform duration-300
    ${isSideBarOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
        >
          <div className="w-[250px] h-full justify-between max-h-[90vh] flex flex-col p-4">
            {sidebarContent}
          </div>
        </div>
        {/* Sidebar */}
        <div
          className={`border-r hidden md:block overflow-visible sidebar bg-[#fcfcfc] border-[#e5a657] fixed h-[100vh] ${
            isSideBarOpen ? "w-[280px]" : "w-[40px]"
          } transition-width duration-300`}
        >
          <div className="mt-4 flex flex-col justify-between h-[90vh] ms-4  me-9 text-[13px] pb-3 relative">
            {/* Botón posicionado en el borde derecho */}
            <button
              title={isSideBarOpen ? "Ocultar menú" : "Mostrar menú"}
              onClick={toggleSidebarOpen}
              type="button"
              className={`cursor-pointer py-1 absolute top-2 z-10 bg-white border border-[#e5a657] rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow ${
                isSideBarOpen ? "-right-[55px]" : "-right-[45px]"
              }`}
            >
              <AlignJustify color="#e27434" size={20} />
            </button>

            {isSideBarOpen && sidebarContent}
          </div>
        </div>

        {/* Contenido ${isSideBarOpen ? "ps-[3%] md:ps-[10%]" : "ps-[3%] md:ps-[4%]"}*/}
        <div
          className={`main-content`}
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
