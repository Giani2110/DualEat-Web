import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";

import { useCommunity } from "@hooks/useUCommunity";
import { useChat } from "@/hooks/chat/useChat";

import "@assets/scss/private/users/users.scss";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import ChatModal from "@/components/modal/ChatModal";
import { useRecent, type MinimalCommunityPlus } from "@/hooks/useRecent";
import type { User } from "@/interface/global";
import { NavItem } from "@/components/ui/buttons/NavButton";

interface Props {
  children: React.ReactNode;
  user: User;
}

const UIDashboard: React.FC<Props> = ({ children, user }) => {
  const { userCommunities } = useCommunity();
  const { handleCommunityClick } = useRecent(user.id);
  const {
    chats,
    chat_id,
    setChatID,
    setConversation,
    removeChatID,
    setStarted,
  } = useChat();

  const navigate = useNavigate();

  const [open, setOpen] = useState({
    communities: true,
    chats: true,
    sidebar: true,
  });

  const [editingChatId, setEditingChatId] = useState<string>("");
  const [type, setType] = useState<"title" | "delete" | "">("");

  const sidebarContent = (
    <section className="flex flex-col gap-y-2 h-full">
      <div className="flex flex-col gap-y-2 border-b border-[#dbdbdb] pb-4">
        {/* Inicio */}
        <NavItem
          label="Inicio"
          path={ROUTES.USER.DASHBOARD}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#83898f"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-house-icon lucide-house"
            >
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          }
        />
        {/* Explorar */}
        <NavItem
          label="Explorar"
          path={ROUTES.USER.EXPLORE}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#83898f"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-users-round-icon lucide-users-round"
            >
              <path d="M18 21a8 8 0 0 0-16 0" />
              <circle cx="10" cy="8" r="5" />
              <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
            </svg>
          }
        />

        {/* Recetas */}
        <NavItem
          label="Recetas"
          path={ROUTES.USER.RECIPES}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#83898f"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-cooking-pot-icon lucide-cooking-pot"
            >
              <path d="M2 12h20" />
              <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
              <path d="m4 8 16-4" />
              <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
            </svg>
          }
        />
      </div>

      {/* Comunidades */}
      <div className="border-b border-[#dbdbdb]">
        <button
          title="Comunidades"
          onClick={() => setOpen({ ...open, communities: !open.communities })}
          className="w-full flex items-center justify-between cursor-pointer py-4"
        >
          <h3 className="text-[14px] text4 Dosis-Bold">Comunidades</h3>
          <ChevronUp
            size={16}
            color="#333333"
            className={`transition-transform duration-300 ${
              open.communities ? "rotate-0" : "rotate-180"
            } `}
          />
        </button>

        {/* Lista de comunidades */}
        {open.communities && (
          <>
            {/* Botón crear comunidad */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                //setCreateCommunityModalOpen(!createCommunityModalOpen);
              }}
              type="button"
              className={`flex items-center hover:bg-[#e9e9e9] cursor-pointer w-full py-2 px-1 mb-2 border-y border-dashed border-[#dbdbdb]`}
            >
              <Plus
                className="flex-shrink-0"
                color="#e5a657"
                size={20}
                strokeWidth={1.7}
              />
              <span className={`ml-[14px] text5 text-[14px] whitespace-nowrap`}>
                Crear comunidad
              </span>
            </button>

            {/* Listado de comunidades del usuario */}
            {userCommunities.map((community) => {
              const communityInfo = {
                id: community.community.id,
                name: community.community.name,
                image_url: community.community.image_url,
                slug: community.community.slug,
              };
              return (
                <button
                  type="button"
                  key={community.community.id}
                  title={community.community.name}
                  onClick={() => {
                    handleCommunityClick(communityInfo as MinimalCommunityPlus);
                  }}
                  className="navlis flex-[1] rounded-[8px] cursor-pointer w-full py-[5px] px-2 hover:bg-[#e9e9e9]"
                >
                  <img
                    src={
                      community.community.image_url ??
                      "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                    }
                    className="rounded-full h-4 w-4 flex-shrink-0"
                    alt="Imagen de la comunidad"
                  />
                  <span className="ml-[10px] text-[14px] text5 whitespace-nowrap">
                    {community.community.name}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Chats */}
      <div className="border-b border-[#dbdbdb]">
        <button
          onClick={() => setOpen({ ...open, chats: !open.chats })}
          className="w-full flex items-center justify-between cursor-pointer  py-4 "
        >
          <h3 className="text-[14px] text4 Dosis-Bold">Chats</h3>
          <ChevronUp
            size={16}
            color="#333333"
            className={`transition-transform duration-300 ${
              open.chats ? "rotate-0" : "rotate-180"
            } `}
          />
        </button>

        {open.chats && (
          <div tabIndex={-1} className={`flex flex-col gap-1.5 mt-2`}>
            {chats ? (
              chats.map((chat) => {
                return (
                  <div
                    key={chat.chatId}
                    className={`navlis rounded-[8px] cursor-pointer w-full py-[5px] px-2 hover:bg-[#e9e9e9]`}
                    onClick={() => {
                      setChatID(chat.chatId);

                      navigate(`/recipes/`);
                    }}
                  >
                    <p className="ml-[10px] text-[14px] text5">{chat.title}</p>
                  </div>
                );
              })
            ) : (
              <p className="ml-[10px] text-[14px] text5">No chats available</p>
            )}
          </div>
        )}
      </div>
    </section>
  );

  //BGUser
  return (
    <>
      <div className={`min-h-screen`}>
        <section className={`lg:grid grid-cols-[200px_1fr] pt-15 min-h-screen`}>
          {/* Sidebar */}
          <div
            className={`border-r hidden lg:block sidebar bg-[#ffffff] border-[#dbdbdb] fixed h-[100vh] w-[250px]`}
          >
            <div className="mt-4 flex flex-col justify-between h-[90vh] ms-4 me-5 text-[13px] pb-3 relative">
              {sidebarContent}
            </div>
          </div>

          {/* Contenido ${isSideBarOpen ? "ps-[3%] md:ps-[10%]" : "ps-[3%] md:ps-[4%]"}*/}
          <div className={`main-content`}>{children}</div>
        </section>
      </div>

      {type === "title" || (type === "delete" && editingChatId) ? (
        <ChatModal
          type={type}
          chat_id={editingChatId}
          onClose={() => setType("")}
        />
      ) : null}
    </>
  );
};

export default UIDashboard;
