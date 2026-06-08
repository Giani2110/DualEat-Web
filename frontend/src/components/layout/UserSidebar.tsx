import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import type { User } from "@/interface/global";
import { SidebarItem, UserSidebarItems } from "../ui/buttons/sidebar-items";
import { useAuth } from "@/hooks/useAuth";

import "@assets/scss/private/users/users.scss";

interface Props {
  children: React.ReactNode;
  user: User;
}

export default function UserSidebar({ children, user }: Props) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [open, setOpen] = useState({
    communities: true,
    chats: true,
    sidebar: true,
  });

  const size = 20;

  return (
    <section
      className={`flex flex-col min-h-screen pt-15 transition-[grid-template-columns] duration-300 ease-in-out lg:grid ${
        open.sidebar ? "lg:grid-cols-[350px_1fr]" : "lg:grid-cols-[50px_1fr]"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`border-r hidden lg:flex bg-bg-semi-white border-[#dbdbdb] flex-col justify-between top-15 bottom-0 fixed transition-all duration-300 ${open.sidebar ? "w-[350px] p-4" : "w-[40px]"}`}
      >
        <button
          style={{ zIndex: 99 }}
          onClick={() => setOpen({ ...open, sidebar: !open.sidebar })}
          className="absolute -right-3 top-5 bg-[#dbdbdb]/80 backdrop-blur-md z-[200] p-2 rounded-full shadow-sm cursor-pointer hover:bg-[#c9c9c9] transition"
        >
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
          >
            <path
              fill="#707070"
              d="M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z"
            />
          </svg>
        </button>

        <div
          style={{ flex: 1, display: open.sidebar ? "flex" : "none" }}
          className="flex flex-col gap-y-6"
        >
          <header className="flex flex-row items-center gap-x-3">
            <img
              src={user?.avatar_url ?? ""}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-[14px] text-text-4 whitespace-nowrap">
                ¡Bienvenido de nuevo!
              </span>
              <span className="text-[16px] text-text-3 font-bold whitespace-nowrap">
                {user?.name}
              </span>
            </div>
          </header>

          <nav className="flex flex-col gap-y-4 w-full overflow-y-auto overflow-x-hidden shrink-0">
            <SidebarItem
              label="Inicio"
              path={ROUTES.USER.DASHBOARD}
              onPress={() => navigate(ROUTES.USER.DASHBOARD)}
              isExpanded={null}
              icon={
                <img
                  src="https://img.icons8.com/?size=100&id=i6fZC6wuprSu&format=png&color=707070"
                  style={{ width: size, height: size }}
                />
              }
            />
            {/* Perfil */}
            <SidebarItem
              label="Perfil"
              path={ROUTES.USER.PROFILE(user.id, user.slug)}
              onPress={() => navigate(ROUTES.USER.PROFILE(user.id, user.slug))}
              isExpanded={null}
              icon={
                <svg width={size} height={size} viewBox="0 0 640 640">
                  <path
                    className="shrink-0"
                    fill={"#707070"}
                    d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"
                  />
                </svg>
              }
            />

            {/* Notificaciones */}
            <SidebarItem
              label="Notificaciones"
              path={ROUTES.USER.CHAT}
              isExpanded={null}
              icon={
                <svg width={size} height={size} viewBox="0 0 640 640">
                  <path
                    className="shrink-0"
                    fill={"#707070"}
                    d="M320 64C306.7 64 296 74.7 296 88L296 97.7C214.6 109.3 152 179.4 152 264L152 278.5C152 316.2 142 353.2 123 385.8L101.1 423.2C97.8 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L506.2 480C527.1 480 544 463.1 544 442.2C544 435.5 542.2 428.9 538.9 423.2L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9zM488.4 432L151.5 432L164.4 409.9C187.7 370 200 324.6 200 278.5L200 264C200 197.7 253.7 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z"
                  />
                </svg>
              }
            />

            <div className=" border-t border-gray-400" />
            <UserSidebarItems user={user} navigate={navigate} size={size} />
            <div className=" border-t border-gray-400" />
          </nav>
        </div>

        <footer className={`${open.sidebar ? "flex" : "hidden"} shrink-0`}>
          <button
            type="button"
            className="p-2 cursor-pointer w-full flex flex-row font-bold text-red text-[14px] items-center justify-start gap-x-4 border-y border-dashed border-[#B53325] whitespace-nowrap"
            onClick={() => logout()}
          >
            <svg
              className="shrink-0"
              width={size}
              height={size}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
            >
              <path
                fill={"#B53325"}
                d="M224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160zM566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L438.6 169.3C426.1 156.8 405.8 156.8 393.3 169.3C380.8 181.8 380.8 202.1 393.3 214.6L466.7 288L256 288C238.3 288 224 302.3 224 320C224 337.7 238.3 352 256 352L466.7 352L393.3 425.4C380.8 437.9 380.8 458.2 393.3 470.7C405.8 483.2 426.1 483.2 438.6 470.7L566.6 342.7z"
              />
            </svg>
            Cerrar sesión
          </button>
        </footer>
      </aside>

      {/* Children */}
      <div style={{ height: "100%" }} className={`main-content min-w-0`}>
        {children}
      </div>
    </section>
  );
}
