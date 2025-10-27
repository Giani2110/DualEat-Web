import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/constants";

import { useCommunity } from "@hooks/useUCommunity";
import { useChat } from "@/hooks/useChat";

import "@assets/scss/private/users/users.scss";
import { ChevronDown, Ellipsis } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

const UIDashboard: React.FC<Props> = ({ children }) => {
  const { userCommunities } = useCommunity();
  const {
    chats,
    chat_id,
    setActiveChatId,
    setConversation,
    removeActiveChatId,
    setStarted,
  } = useChat();

  const location = useLocation();

  const [filter, setFilter] = useState("");

  const [isOpen, setIsOpen] = useState(true);
  const [openOptions, setOpenOptions] = useState<string>("");
  const divRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(e.target as Node)) {
        setOpenOptions("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sidebarContent = (
    <>
      <div className="flex flex-col">
        {/** Comunidades */}
        <div
          className={`transition-all duration-300 cursor-pointer w-full py-[10px] overflow-hidden
          `}
        >
          <div className={`flex justify-between px-3 items-center py-[10px]`}>
            <span className={`text-[15px] Dosis-Bold text5`}>Comunidades</span>
          </div>

          {userCommunities.map((community) => (
            <Link
              key={community.community.id}
              title={community.community.name}
              to={`/c/${community.community.slug}/`}
              className={`navlis flex-[1] rounded-[8px] cursor-pointer w-full py-[5px] px-2 hover:bg-[#e9e9e9]`}
            >
              <img
                src={
                  (community.community.image_url !== null &&
                    community.community.image_url) ||
                  "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                }
                className={`rounded-full h-4 w-4 flex-shrink-0`}
                alt="Imagen de la comunidad"
              />

              <span className={`ml-[10px] text-[14px] text4 whitespace-nowrap`}>
                {community.community.name}
              </span>
            </Link>
          ))}
        </div>
        <div className="border-t border-gray-300 mt-2"></div>

        <div className="mt-4">
          {location.pathname === ROUTES.USER.RECIPES && (
            <>
              <input
                placeholder="Buscar chats"
                onChange={(e) => setFilter(e.target.value)}
                className="border border-[#dbdbdb] p-2 rounded-[5px] w-full outline-0"
                type="text"
              />
              <div
                typeof="button"
                onClick={() => {
                  setStarted(false);
                  setConversation([]);
                  removeActiveChatId();
                }}
                className="flex items-center p-2 hover:bg-[#E9E9E9] mt-4 cursor-pointer border-t border-b border-dashed border-[#dbdbdb]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height={18}
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="#4A4947"
                    d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L368 46.1 465.9 144 490.3 119.6c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L432 177.9 334.1 80 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"
                  />
                </svg>
                <span className="ml-2 text-[14px] text4">
                  Nueva conversación
                </span>
              </div>

              <div className="mx-2 mt-5 flex flex-col justify-between h-full min-h-screen">
                <div className="flex-1">
                  <div
                    typeof="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex justify-between items-center cursor-pointer hover:bg-[#F8F8F8] p-1.5 rounded-[5px]"
                  >
                    <p className="Dosis-Bold text5 text-[15px]">Chats</p>
                    <ChevronDown
                      size={18}
                      className={`text5 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <div
                    className={`flex flex-col gap-1.5 mt-2 overflow-y-scroll scroll2 pe-3 ${
                      isOpen ? "max-h-[400px] min-h-[300px]" : "max-h-0"
                    }`}
                  >
                    {chats
                      .filter((chat) =>
                        chat.title.toLowerCase().includes(filter.toLowerCase())
                      )
                      .map((chat) => {
                        const isActive = chat_id === chat.chatId;
                        const isOptionsOpen = openOptions === chat.chatId;

                        return (
                          <div
                            key={chat.chatId}
                            className={`cursor-pointer flex justify-between items-center hover:bg-[#E9E9E9] px-2 py-1 rounded-[5px] transition-all duration-100 ${
                              isActive ? "bg-yellow" : ""
                            }`}
                            onClick={() => setActiveChatId(chat.chatId)}
                            ref={isOptionsOpen ? divRef : null}
                          >
                            <p
                              className={`text-[14px] ${
                                isActive ? "text1" : "text5"
                              }`}
                            >
                              {chat.title}
                            </p>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenOptions(chat.chatId);
                              }}
                              className={` group p-1 rounded-full relative ${
                                isActive
                                  ? "hover:bg-[#fff]"
                                  : "hover:bg-[#4A4947]"
                              }`}
                            >
                              <Ellipsis
                                size={14}
                                className={`rotate-90 flex-shrink-0 ${
                                  isActive
                                    ? "text1 group-hover:text-[#2F2F2F]!"
                                    : "text5 group-hover:text-[#fff]!"
                                }`}
                              />
                              {isOptionsOpen && (
                                <div className="absolute right-0 top-5 bg-white shadow-md rounded-md p-2">
                                  {/* Opciones del chat */}
                                  <button>Eliminar</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-center text4 text-[13px] leading-4.5">
                    Los chats duran aproximamente 7 días. Luego se borraran sin
                    excepcion
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen BGUser`}>
      <section className={`lg:grid grid-cols-[280px_1fr] pt-15 min-h-screen`}>
        {/* Sidebar */}
        <div
          className={`border-r hidden lg:block sidebar bg-[#ffffff] border-[#e5a657] fixed h-[100vh] w-[280px]`}
        >
          <div className="mt-4 flex flex-col justify-between h-[90vh] ms-4 me-5 text-[13px] pb-3 relative">
            {sidebarContent}
          </div>
        </div>

        {/* Contenido ${isSideBarOpen ? "ps-[3%] md:ps-[10%]" : "ps-[3%] md:ps-[4%]"}*/}
        <div className={`main-content`}>{children}</div>
      </section>
    </div>
  );
};

export default UIDashboard;
