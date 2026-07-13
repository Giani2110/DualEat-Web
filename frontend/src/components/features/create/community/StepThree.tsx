import type { CommunityDTO } from "@/interface/global.dto";
import { type Dispatch, type SetStateAction } from "react";
import bgFood from "@assets/images/background-food.jpg";

interface StepProps {
  community: CommunityDTO;
  setCommunity: Dispatch<SetStateAction<CommunityDTO>>;
  error: Error | null;
}

export default function StepThree({
  error,
  community,
  setCommunity,
}: StepProps) {
  return (
    <section className="flex flex-row flex-1 gap-4">
      <aside className="flex flex-col justify-center h-full flex-1 gap-y-3">
        <h1 className="font-bold text-xl text-text-3">
          Cuéntanos sobre tu comunidad
        </h1>
        <p className="font-outfit-light text-sm text-text-4">
          Danos un nombre y una descripción para tu comunidad. Cuanto más
          detallada sea la descripción, mejor podrán entender los usuarios de
          qué se trata tu comunidad.
        </p>

        <div className="flex flex-col gap-y-4">
          {/** Input nombre de la comunidad  */}
          <div className="flex flex-col items-end gap-y-1.5">
            <input
              type="text"
              title="Nombre de la comunidad"
              value={community.name}
              minLength={3}
              maxLength={28}
              onChange={(e) =>
                setCommunity({ ...community, name: e.target.value })
              }
              placeholder="Nombre de la comunidad"
              className="font-outfit-light w-full placeholder:text-[#4A4947] text-sm text-text-3 border border-gray-200 rounded-lg px-4 py-2 outline-bg-yellow"
            />

            <div className="flex flex-row w-full items-center justify-between">
              <span className="text-bg-red text-xs font-outfit-light">
                {error?.message}
              </span>

              <span
                className={`font-normal text-xs ${community.name.length > 28 ? "text-bg-red" : "text-text-6"}`}
              >
                {28 - community.name.length}
              </span>
            </div>
          </div>

          {/** Input descripción de la comunidad */}
          <div className="flex flex-col items-end gap-y-1.5">
            <textarea
              title="Descripción de la comunidad"
              value={community.description}
              minLength={10}
              maxLength={500}
              onChange={(e) =>
                setCommunity({ ...community, description: e.target.value })
              }
              placeholder="Descripción"
              className="font-outfit-light w-full placeholder:text-[#4A4947] text-sm text-text-3 border border-gray-200 rounded-lg px-4 py-2 max-h-[200px] overflow-y-auto outline-bg-yellow"
            />
            <span
              className={`font-normal text-xs ${community.description.length > 500 ? "text-bg-red" : "text-text-6"}`}
            >
              {500 - community.description.length}
            </span>
          </div>
        </div>
      </aside>

      <section className="flex flex-col flex-1 hidden lg:flex">
        <img
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
          src={bgFood}
          alt="Background image"
        />
      </section>
    </section>
  );
}
