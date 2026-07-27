import { useState } from "react";

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
    <section className="w-full h-fit border border-dashed border-gray-200 rounded-[10px] overflow-hidden">
      <div className="px-5 py-5 flex flex-col gap-3">
        <div>
          <h1 className="font-bold text-[18px] text-gray-900 leading-snug">
            {community?.name}
          </h1>
          {!isCommunity && (
            <p className="text-[14px] mt-1 text-gray-500 font-semibold">
              c/{community?.slug}
            </p>
          )}
        </div>

        <p
          className={`text-[14px] text-gray-600 leading-relaxed ${
            isOpen ? "line-clamp-4" : "line-clamp-none"
          }`}
        >
          {community?.description}
        </p>

        {community?.description && community.description.length > 120 && (
          <button
            type="button"
            className="text-[13px] text-blue hover:underline font-bold cursor-pointer text-left self-start"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Mostrar más" : "Mostrar menos"}
          </button>
        )}

        <div className="flex flex-col gap-2.5 mt-2 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="18"
              width="18"
              viewBox="0 0 640 640"
              className="shrink-0 fill-gray-400"
            >
              <path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z" />
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
              className="text-[13.5px]"
            >
              {community?.created_at
                ? `Creado el ${format(
                    new Date(community.created_at),
                    "d MMM yyyy",
                    {
                      locale: es,
                    },
                  )}`
                : "Fecha desconocida"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 stroke-gray-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-[13.5px]">
              <span className="font-bold text-gray-900">
                {community?.total_members ?? 0}
              </span>{" "}
              Miembros
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 w-full border-t border-gray-100 bg-gray-50/50">
        <h3 className="text-[14px] text-gray-900 font-bold tracking-tight mb-3">
          Etiquetas de la comunidad
        </h3>
        {Array.isArray(community?.tags) && community.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {community?.tags.map((tag: CommunityTag) => (
              <span
                key={tag.id}
                className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 text-[12.5px] py-1 px-2.5 rounded-full transition duration-150 cursor-pointer shadow-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[13px] text-gray-400">Sin etiquetas</span>
        )}
      </div>
    </section>
  );
};

export default CommunityInfo;
