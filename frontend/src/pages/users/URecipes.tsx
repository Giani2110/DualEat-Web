import { useState, useRef } from "react";
import UIDashboard from "../../components/users/UIDashboard";

import { useAuth } from "../../hooks/useAuth";


 const URecipes = () => { 
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <UIDashboard>
        <section className="mt-10 flex flex-col justify-center h-[70vh] items-center w-full">
            <h1 className="text-[28px] tracking-tight Arvo-Bold">Hola, {user?.name}</h1>
            
            <div
            onClick={focusInput}
            className="w-1/2 px-4 mt-6 py-3 border border-gray-300 rounded-full">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar recetas por nombre o ingredientes"
                    className="outline-none ps-3 placeholder:text-[#707070] placeholder:text-[15px] w-full text5"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {}
            </div>
            

        </section>


    </UIDashboard>
  );
}

export default URecipes;