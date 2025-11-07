import { useState } from "react";

import { formatCompactNumber } from "@utils/compactNumber";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import type { Community, CommunityTag } from "@/interface/global";

type CommunityInfoProps = {
  community: Community;
  isCommunity: boolean;
};

const CommunityInfo = ({ community, isCommunity }: CommunityInfoProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className="flex-[1] hidden lg:block bannerBG max-w-[300px] h-fit"
      style={
        {
          "--bg-image": `url('${community?.theme_color}')`,
        } as React.CSSProperties
      }
    >
      <div className="px-5 py-4">
        
        <h1 className="Dosis-Bold text-[18px] text3">{community?.name}</h1>
        {!isCommunity && (
          <p className="text-[15px] mt-2 text5 Dosis-Bold">
            {community?.slug}
          </p>
        )}
        <p
          className={`text-[15px] text4 leading-6 ${
            isOpen ? "line-clamp-3" : "line-clamp-0"
          }`}
        >
          {community?.description}
        </p>

        <button
        type="button"
          className={`text-[13.5px] text4 mt-3 Dosis-Bold text4 rounded-full p-1.5 cursor-pointer w-full hover:bg-[#dbdbdb] ${
            !isOpen ? "hidden" : "block"}`}
          onClick={() => setIsOpen(!isOpen)}
        >Mostrar más</button>
        <div className="flex items-center gap-1 mt-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height={"22"}
            width={"22"}
            viewBox="0 0 640 640"
          >
            <path
              fill="#707070"
              d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z"
            />
          </svg>
          <span
            title={
              community && community?.created_at
                ? formatDistanceToNow(community.created_at, {
                    locale: es,
                    addSuffix: true,
                  })
                : "N/A"
            }
            className="text-[13.5px] text4"
          >
            {community?.created_at
              ? `Creado el ${format(
                  new Date(community.created_at),
                  "d MMM yyyy",
                  {
                    locale: es,
                  }
                )}`
              : "Fecha desconocida"}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#707070"
            className="lucide lucide-globe-icon lucide-globe"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
          <span className="capitalize text-[13.5px] text4">
            {community?.visibility}
          </span>
        </div>

        <div className="flex mt-3 gap-1 items-center justify-center text-[14px]">
          <span className="Dosis-Bold">
            {community?.total_members
              ? formatCompactNumber(community.total_members)
              : "0"}
          </span>
          <span className="text4">Miembros</span>
        </div>
      </div>

      <div className="px-3 pb-5 pt-2 w-full">
        <div className="w-full h-[1px] mx-auto bg-gray-300"></div>
        <h1 className="text-[16px] text5 pt-3 Dosis-Bold tracking-tight">
          Etiquetas de la comunidad
        </h1>
        {Array.isArray(community?.tags) && community.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-4">
            {community?.tags.map((tag: CommunityTag) => (
              <span
                key={tag.id}
                className="bg-[#ebebeb] border border-[#dbdbdb] text4 text-[13px] w-full text-center py-1 px-2 rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[13px] text4">Sin etiquetas</span>
        )}
      </div>
    </div>
  );
};

export default CommunityInfo;
