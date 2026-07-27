import Modal from "@/components/modal/Modal";
import Loader from "@/components/ui/feedback/Loader";
import { useMyCommunities } from "@/hooks/api/community/useCommunity";
import type { Community, CommunityMember } from "@/interface/global";
import { getByName } from "@/services/community.api";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  setCommunity: (community: Community) => void;
}

export default function CommunitySearch({
  isOpen,
  onClose,
  setCommunity,
}: Props) {
  const { data: myCommunities } = useMyCommunities();
  const [search, setSearch] = useState<string>("");

  const {
    data: communities,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["communities", "search", search],

    queryFn: async () => {
      if (!search.trim()) return true;

      const response = await getByName(search);
      return response.data;
    },

    enabled: search.trim().length > 0,
    placeholderData: true,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (search.trim()) {
      refetch();
    }
  }, [search, refetch]);

  const data = useMemo(() => {
    if (search.trim().length > 0) {
      if (!communities) return [];

      if (!Array.isArray(communities)) {
        return [communities];
      }

      return communities;
    }
    return (
      myCommunities?.map((community: CommunityMember) => community.community) ||
      []
    );
  }, [search, communities, myCommunities]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="flex flex-col bg-bg-semi-white p-6 noScroll overflow-y-auto rounded-xl w-[calc(100vw-50px)] md:max-w-[80vw] lg:max-w-[50vw] h-[85vh] md:h-[75vh] transition-all duration-300"
    >
      <section className="flex flex-col gap-y-4 flex-1">
        <div className="flex flex-row items-center justify-between">
          <h1 className="font-bold text-text-3 text-lg">
            Seleccionar comunidad
          </h1>
          <button
            onClick={onClose}
            className="text-text-3 cursor-pointer p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="items-center px-4 justify-start flex flex-row border border-gray-200 rounded-full">
          <input
            type="text"
            className="flex-1 text-sm text-text-5 font-outfit-light py-2 outline-none"
            placeholder="Buscar una comunidad"
            onBlur={(e) => {
              setSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(search);
              }
            }}
          />
          <Search size={18} color="#4A4947" />
        </div>

        {isFetching ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader size={24} color="#e5a657" />
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {data.map((item: Community) => {
              const isMember =
                myCommunities?.some(
                  (cm: CommunityMember) => cm?.community_id === item.id,
                ) ?? false;

              return (
                <button
                  onClick={() => {
                    setCommunity(item);
                    onClose();
                  }}
                  key={item.id}
                  className="w-full flex flex-row items-center justify-start px-6 py-3 border-b border-gray-200 gap-x-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {item.image_url ? (
                    <div className="h-8 w-8 flex-shrink-0">
                      <img
                        className="rounded-full w-full h-full object-cover"
                        src={item.image_url}
                        alt={item.name}
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full flex-shrink-0 bg-bg-semi-black" />
                  )}

                  <div className="flex flex-col flex-1 min-w-0 gap-y-0.5 text-left">
                    <span className="font-bold text-sm text-text-5 truncate">
                      {item.name}
                    </span>
                    <p className="text-xs text-text-5 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-xs text-text-5 truncate">
                      {item.total_members} miembros {isMember && " • Te uniste"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </Modal>
  );
}
