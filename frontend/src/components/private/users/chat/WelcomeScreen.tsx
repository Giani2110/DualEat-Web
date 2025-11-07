import React from "react";
import type { User } from "@/interface/global";
import { capitalize } from "@/utils/capitalize";
import { Loader } from "lucide-react";

type WelcomeScreenProps = {
  user: User;
  isLoading: boolean;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user, isLoading }) => {
  return (
    <div className="mb-1 w-full max-w-[900px] leading-11">
      <h1 className="text-[32px] text5 font-bold">
        Hola, {capitalize(user?.name || "Usuario")}
      </h1>
      <h1 className="text-[32px]  text5 font-bold">¿En qué puedo ayudarte?</h1>
      <p className="pt-2 text5 text-[18px] Dosis-Light tracking-tight">
        Elija una de las sugerencias a continuación o escriba la suya para
        comenzar a chatear con DualIA.
      </p>

      {isLoading && (
        <div className="w-full mt-4 flex items-center gap-2">
          <Loader color="gray-500" />
          <span className="text-[15px] text5">Esperando respuesta...</span>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
