import { useCallback, useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import type { Community, TagCategory } from "@/interface/global";
import { getTagCategories } from "@/services/category.api";
import { getByCategorySkeleton } from "@/services/community.api";

import { useAuth } from "@hooks/useAuth";

import { useNavigate, useParams } from "react-router-dom";

import CommunityCard from "@/components/private/users/cards/CommunityCard";
import {
  useJoinLeave,
  useMyCommunities,
} from "@/hooks/api/community/useCommunity";
import { ROUTES } from "@/api/constants/constants";

const TODO_CATEGORY = { id: 0, slug: "todo", name: "Todos" } as TagCategory;

interface CommunityByTags {
  id: number;
  name: string;
  items: Community[];
}

export default function ExploreScreen() {
  const { data: myCommunities } = useMyCommunities();
  const { mutate: joinLeave } = useJoinLeave();

  const { category_id } = useParams<{ category_id: string }>();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<TagCategory | null>(
    null,
  );

  console.log(myCommunities);

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getTagCategories();
      return response.data as TagCategory[];
    },
    staleTime: 1000 * 60 * 30,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities", category_id],
    queryFn: async () => {
      const response = await getByCategorySkeleton(Number(category_id));

      return response.data as CommunityByTags[];
    },
    staleTime: 1000 * 60 * 20,
  });

  const extendedData = useMemo(() => {
    if (!data) return [TODO_CATEGORY];
    return [TODO_CATEGORY, ...data];
  }, [data]);

  useEffect(() => {
    if (category_id && data) {
      const foundCategory = data.find((c) => c.id.toString() === category_id);
      if (foundCategory) setSelectedCategory(foundCategory);
    } else if (!category_id) {
      setSelectedCategory(TODO_CATEGORY);
    }
  }, [category_id, data]);

  const handlePressCategory = useCallback(
    (item: TagCategory) => {
      if (selectedCategory?.id === item.id) return;
      setSelectedCategory(item);
    },
    [selectedCategory],
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedCategory) return;

    if (selectedCategory.id !== 0) {
      navigate(
        ROUTES.USER.EXPLORE(
          selectedCategory.id.toString(),
          selectedCategory.slug,
        ),
      );
    } else {
      navigate(ROUTES.USER.EXPLORE());
    }
  }, [selectedCategory, navigate]);

  const categoriesWithCommunities = useMemo(() => {
    if (!communities) return [];

    const seenCommunityIds = new Set();

    return communities.reduce<CommunityByTags[]>((acc, category) => {
      const uniqueItems = category.items.filter((community) => {
        if (seenCommunityIds.has(community.id)) {
          return false;
        } else {
          seenCommunityIds.add(community.id);
          return true;
        }
      });

      if (uniqueItems.length > 0) {
        acc.push({
          ...category,
          items: uniqueItems,
        });
      }

      return acc;
    }, []);
  }, [communities]);

  return (
    <main className="flex flex-col gap-y-6 mt-8 px-6 md:px-16">
      <h1 className="text-[28px] text-text-3 tracking-tight font-bold">
        Explorar
      </h1>

      <section className="flex flex-row overflow-x-auto gap-x-4">
        {extendedData.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePressCategory(item as TagCategory)}
            className={`flex-shrink-0 cursor-pointer transition-all duration-200 items-center justify-center py-1.5 px-4 rounded-full ${
              selectedCategory?.id === item.id
                ? "bg-bg-semi-black border-none text-white"
                : "bg-bg-semi-white border border-gray-300 hover:bg-gray-100 text-text-5"
            }`}
          >
            <p
              className={`text-sm ${
                selectedCategory?.id === item.id ? "text-text-1" : "text-text-5"
              }`}
            >
              {item.name}
            </p>
          </button>
        ))}
      </section>

      <section>
        {isLoading ? (
          <div className="w-full min-h-[350px] grid grid-cols-2 lg:grid-cols-3 gap-5"></div>
        ) : categoriesWithCommunities?.length === 0 ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center py-6">
            <p className="text-[14px] text-[#4C4C4C] mt-3">No hay resultados</p>
          </div>
        ) : (
          <div className="w-full flex-1 grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
            {categoriesWithCommunities.map((item) =>
              item.items.map((community) => {
                const isJoined = myCommunities?.some(
                  (c) => c.community.id === community.id,
                );

                return (
                  <button
                    key={community.id}
                    onClick={() => {
                      navigate(`/c/${community.slug}`);
                    }}
                    className="border border-gray-300 px-3 py-2.5 flex-col rounded-[15px] gap-y-1.5"
                  >
                    <div className="flex flex-row items-center gap-x-2.5">
                      <img
                        src={community.image_url}
                        className="w-11 h-11 rounded-full"
                      />
                      <div className="flex flex-col">
                        <p className="text-[17px] font-dosis-bold text-text-3 tracking-tighter">
                          {community.name}
                        </p>
                        <span className="text-[13px] font-dosis-regular text-text-5 tracking-tighter">
                          {community.total_members} miembros
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          joinLeave({
                            community,
                            join: !isJoined,
                          })
                        }
                        className="ml-auto"
                      >
                        <p
                          className={`text-[13px] rounded-full px-2.5 py-1.5 tracking-tighter font-dosis-bold 
                            ${
                              isJoined
                                ? "bg-bg-gray text-text-3 border border-gray-600"
                                : "bg-bg-semi-black text-text-1"
                            }`}
                        >
                          {isJoined ? "Te uniste" : "Unirse"}
                        </p>
                      </button>
                    </div>

                    <p className="text-sm leading-5 text-text-4 tracking-tighter truncate">
                      {community.description}
                    </p>
                  </button>
                );
              }),
            )}
          </div>
        )}
      </section>
    </main>
  );
}
