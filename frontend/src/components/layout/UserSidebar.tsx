import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";

import { useAuth } from "@/hooks/useAuth";

import "@assets/scss/private/users/users.scss";
import { LogOut } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

import { motion, AnimatePresence } from "framer-motion";
import type { UserSessionData } from "@/context/auth/AuthProvider";
import { useMyCommunities } from "@/hooks/api/community/useCommunity";
import CommunityModal from "../features/create/community/CommunityModal";
import { SidebarItem } from "../ui/buttons/sidebar-item";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  user: UserSessionData;
}

export default function UserSidebar({
  isOpen,
  setIsOpen,
  children,
  user,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const { unreadCount } = useNotifications();

  const [expanded, setExpanded] = useState({
    comunity: false,
    chat: false,
    create: false,
  });

  const { data: communities } = useMyCommunities();

  const size = 20;

  if (Object.values(ROUTES.PUBLIC).includes(location.pathname)) {
    return <>{children}</>;
  }

  const renderSidebarContent = (isMobileSidebar: boolean) => {
    const isVisible = isMobileSidebar || isOpen;

    return (
      <>
        <div
          style={{ flex: 1, display: isVisible ? "flex" : "none" }}
          className="flex flex-col gap-y-6"
        >
          <button
            onClick={() => {
              navigate(
                ROUTES.USER.PROFILE(user?.id as string, user?.slug as string),
              );
            }}
            className="flex flex-row items-center gap-x-3 text-left w-full focus:outline-none"
          >
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
          </button>

          <nav className="flex flex-col gap-y-4 w-full overflow-y-auto overflow-x-hidden shrink-0">
            <SidebarItem
              label="Inicio"
              path={ROUTES.USER.DASHBOARD}
              onPress={() => {
                navigate(ROUTES.USER.DASHBOARD);
                if (isMobileSidebar) setIsOpen(false);
              }}
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
              onPress={() => {
                navigate(ROUTES.USER.PROFILE(user.id, user.slug));
                if (isMobileSidebar) setIsOpen(false);
              }}
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
              path={ROUTES.USER.NOTIFICATIONS}
              onPress={() => {
                if (isMobileSidebar) setIsOpen(false);
                navigate(ROUTES.USER.NOTIFICATIONS);
              }}
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
              extra={
                unreadCount > 0 ? (
                  <div className="bg-bg-blue rounded-full h-5 w-5 flex items-center justify-center self-center">
                    <p className="text-text-1 font-bold text-[10px]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </p>
                  </div>
                ) : null
              }
            />

            <div className=" border-t border-gray-200" />
            <SidebarItem
              icon={
                <svg
                  width={size}
                  height={size}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                >
                  <path
                    fill={"#707070"}
                    d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
                  />
                </svg>
              }
              label="Explorar"
              isExpanded={null}
              onPress={() => navigate(ROUTES.USER.EXPLORE("", ""))}
            />

            <SidebarItem
              icon={
                <svg width={size} height={size} viewBox="0 0 640 640">
                  <path
                    fill={"#707070"}
                    d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"
                  />
                </svg>
              }
              label="Crear comunidad"
              isExpanded={null}
              onPress={() => {
                if (isMobileSidebar) setIsOpen(false);
                setExpanded({ ...expanded, create: !expanded.create });
              }}
            />

            <SidebarItem
              icon={
                <img
                  src="https://img.icons8.com/fluency-systems-regular/48/conference-call--v1.png"
                  alt="Community icon"
                  color="#707070"
                  style={{ width: size, height: size }}
                />
              }
              label="Comunidades"
              isExpanded={expanded.comunity}
              onPress={() =>
                setExpanded({ ...expanded, comunity: !expanded.comunity })
              }
            />

            {expanded.comunity &&
              communities?.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={
                    <img
                      src={item.community.image_url}
                      alt="Imágen de comunidad"
                      style={{ width: 25, height: 25 }}
                      className="object-cover rounded-full"
                    />
                  }
                  label={item.community.name}
                  isExpanded={null}
                  onPress={() => {
                    if (isMobileSidebar) setIsOpen(false);
                    navigate(ROUTES.USER.COMMUNITY(item.community?.slug || ""));
                  }}
                />
              ))}

            <SidebarItem
              icon={
                <svg width={size} height={size} viewBox="0 0 640 640">
                  <path
                    fill={"#707070"}
                    d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z"
                  />
                </svg>
              }
              label="Chats"
              isExpanded={expanded.chat}
              onPress={() => setExpanded({ ...expanded, chat: !expanded.chat })}
            />
            <div className=" border-t border-gray-200" />
          </nav>
        </div>

        <footer className={`${isVisible ? "flex" : "hidden"} shrink-0`}>
          <button
            type="button"
            className="p-2 cursor-pointer w-full flex flex-row font-bold text-bg-red text-sm items-center justify-start gap-x-4
            border-y border-dashed hover:bg-[#B53325]! hover:text-[#ffffff]! duration-200 transition-all border-bg-red whitespace-nowrap"
            onClick={() => {
              if (isMobileSidebar) setIsOpen(false);
              logout();
            }}
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </footer>
      </>
    );
  };

  return (
    <section
      className={`flex flex-col min-h-screen pt-15 transition-[grid-template-columns] duration-300 ease-in-out md:grid ${
        isOpen ? "md:grid-cols-[350px_1fr]" : "md:grid-cols-[50px_1fr]"
      }`}
    >
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: isOpen ? 350 : 40 }}
        animate={{ width: isOpen ? 350 : 40 }}
        transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
        className={`z-50 border-r hidden md:flex bg-bg-semi-white border-[#dbdbdb] flex-col justify-between top-15 bottom-0 fixed ${isOpen ? "p-4" : undefined}`}
      >
        <button
          style={{ zIndex: 99 }}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-4 top-5 border border-gray-300 backdrop-blur-md p-2 rounded-full shadow-sm cursor-pointer hover:bg-[#878787]/10 transition-all duration-200"
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

        {renderSidebarContent(false)}
      </motion.aside>

      {/* Mobile Drawer (visible on screens < md) */}
      <AnimatePresence>
        {isOpen && (
          <div
            style={{ zIndex: 999 }}
            className="fixed top-[60px] bottom-0 left-0 right-0 flex md:hidden"
          >
            {/* Drawer Sidebar on the Left */}
            <motion.aside
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              exit={{ width: 0 }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              style={{ zIndex: 1000 }}
              className="bg-bg-semi-white border-l border-gray-400 max-w-[90vw] shadow-xl shadow-gray-200 overflow-y-auto p-4 flex flex-col justify-between"
            >
              {renderSidebarContent(true)}
            </motion.aside>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1 }}
              className="bg-black/40"
              onClick={() => setIsOpen(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {expanded.create && (
        <CommunityModal
          user={user}
          onClose={() => setExpanded({ ...expanded, create: !expanded.create })}
        />
      )}

      {/* Children */}
      <div className={`main-content min-w-0 flex-1 flex flex-col`}>
        {children}
      </div>
    </section>
  );
}
