import Loader from "@/components/ui/feedback/Loader";
import type { CommunityTag } from "@/interface/global";
import type { CommunityDTO } from "@/interface/global.dto";
import { getTags } from "@/services/category.api";
import { useQuery } from "@tanstack/react-query";
import { useMemo, type Dispatch, type SetStateAction } from "react";

interface GroupedTags {
  title: string;
  category_id: number;
  data: CommunityTag[];
}

interface StepProps {
  community: CommunityDTO;
  setCommunity: Dispatch<SetStateAction<CommunityDTO>>;
}

export default function StepOne({ community, setCommunity }: StepProps) {
  const { data: tags, isLoading } = useQuery({
    queryKey: ["categories", "tags"],
    queryFn: async () => {
      const response = await getTags();
      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta del post");
      }
      return response.data as CommunityTag[];
    },

    refetchOnMount: true,
    refetchOnReconnect: true,

    staleTime: 30 * 60 * 1000,
  });

  const groupTagsByCategory = (tags: CommunityTag[]) => {
    const agrupado = tags.reduce(
      (index, tag) => {
        const categoria = tag.category.name;

        if (!index[categoria]) {
          index[categoria] = {
            title: categoria,
            category_id: tag.category.id,
            data: [],
          };
        }
        index[categoria].data.push(tag);

        return index;
      },
      {} as Record<string, GroupedTags>,
    );

    return Object.values(agrupado);
  };

  const sections = useMemo(
    () => (tags ? groupTagsByCategory(tags) : []),
    [tags],
  );

  const handleSelect = (tag: CommunityTag) => {
    const isSelected = community.tags.includes(tag.id);

    if (community.tags.length >= 3 && !isSelected) {
      return;
    }

    setCommunity((prev: CommunityDTO) => {
      if (isSelected) {
        return {
          ...prev,
          tags: prev.tags.filter((t) => t !== tag.id),
        };
      }

      return {
        ...prev,
        tags: [...prev.tags, tag.id],
      };
    });
  };

  return (
    <section className="flex flex-col h-full flex-1 gap-y-2">
      <h1 className="font-bold text-lg text-text-3">
        ¿De qué se trata tu comunidad?
      </h1>
      <p className="text-sm text-text-4">
        Selecciona 3 categorías que definan los intereses principales de los
        miembros de tu comunidad. Esto ayudará a que encuentren contenido
        relevante fácilmente.
      </p>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center h-full w-full">
          <Loader size={20} color="#e5a657" />
        </div>
      ) : (
        sections.map((section) => (
          <div className="mb-3" key={section.category_id}>
            <h2 className="font-bold text-base text-text-3 mb-3">
              {section.title}
            </h2>
            <div className="flex flex-wrap gap-2 w-[90%]">
              {section.data.map((tag) => {
                const isSelected = community.tags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleSelect(tag)}
                    type="button"
                    className={`px-4 py-0.5 cursor-pointer hover:bg-gray-200 rounded-full border ${
                      isSelected
                        ? "bg-bg-yellow border-bg-semi-white"
                        : "border-gray-200"
                    }`}
                  >
                    <span
                      className={`font-outfit-light text-sm ${
                        isSelected ? "text-white" : "text-text-4"
                      }`}
                    >
                      {tag.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
