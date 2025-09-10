import React, { useEffect, useRef } from "react";

import { Link, useLocation } from "react-router-dom";
import { OUT_NAVBAR_ROUTES } from "../../constants/navbar-routes";
import { ROUTES } from "../../constants/constants";
import { useAuth } from "../../hooks/useAuth";

import { Search, Plus, Bell } from "lucide-react";
import LogoYellow from "../../assets/images/icon/Logo DualEatYellow.png";

const HeaderUSER: React.FC = () => {
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const { user } = useAuth();

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (Object.values(OUT_NAVBAR_ROUTES).includes(location.pathname)) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 w-full grid-cols-3 bg-[#fcfcfc] border-b border-[#e5a657] h-[60px] px-10 grid items-center justify-between pt-[5px]  pb-[5px] z-50 ${
        scrolled
          ? "bg-white border-b border-[#e5a657]"
          : ""
      } 
    `}
    >
      <Link
        to={ROUTES.PUBLIC.HOME}
        className="flex items-center cursor-pointer"
        tabIndex={-1}
      >
        <img className="w-[28px] h-[28px]" src={LogoYellow} alt="Logo" />
        <span
          className={`ml-3 text-[17px] Arvo-Bold tracking-[-0.01em] text-yellow`}
        >
          DualEat
        </span>
      </Link>

      <div
        onClick={focusInput}
        className={`py-2 px-4 rounded-full cursor-text focus-within:ring-inset focus-within:ring-2 ring-[#e5a657] focus-within:bg-[#faf5f0] bg-[#E5EBEE] hover:bg-[#ebe9df] `}
      >
        <form action="" className="flex items-center gap-2">
          <Search className="w-[16px] h-[16px]" />
          <input
            id="search"
            ref={inputRef}
            type="search"
            placeholder="Buscar posts, recetas en DualEat"
            className="outline-none border-none w-full placeholder:text-[#707070] placeholder:text-[13px] placeholder:tracking-wide"
          />
        </form>
      </div>

      <div className="flex items-center justify-end space-x-3 text-[14px] text-white">
        <Link to={ROUTES.USER.CREATE_POST} className="flex items-center justify-center px-2 py-2 gap-[3px] cursor-pointer hover:bg-[#E5EBEE] rounded-3xl">
          <Plus color="#4A4947" strokeWidth={1.8} size={24} />
          <span className="text-[13px] Arvo text5 tracking-tighter">Crear</span>
        </Link>
        <div className="px-2 py-2 cursor-pointer hover:bg-[#E5EBEE] rounded-3xl">
          <Bell color="#4A4947" strokeWidth={1.8} size={22}/>
        </div>
        <div className="p-1 cursor-pointer hover:bg-[#E5EBEE] rounded-3xl ">
          {user && <img className="w-[30px] h-[30px] rounded-full" src={user.avatar_url || ""} alt="" />}
          
        </div>

      </div>
    </header>
  );
};

export default HeaderUSER;
