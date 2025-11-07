import { useEffect, useState } from "react";
import { useAuth } from "@hooks/useAuth";
import {
  getCommunityByTag,
  getRecommendedCommunities,
  getPopularCommunities,
  getTrendingCommunities,
} from "@services/community.api";

import { getCategoriesTag } from "@services/tag-category.api";
import { getByCategoryId } from "@services/community-tag.api";

import type { CategoryTag, Community, CommunityTag } from "@interface/global";
import { useNavigate, useParams } from "react-router-dom";

import CommunityCard from "@/components/private/users/cards/CommunityCard";

const UExplore = () => {
  const [tags, setTags] = useState<CategoryTag[]>([]);

  const [communities, setCommunities] = useState<Community[]>([]);

  const [communityTags, setCommunityTags] = useState<CommunityTag[]>([]);

  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { user } = useAuth();

  // Estado para las comunidades recomendadas (nuevo)
  const [popularCommunities, setPopularCommunities] = useState<Community[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<
    Community[]
  >([]);
  const [trendingCommunities, setTrendingCommunities] = useState<Community[]>(
    []
  );

  //const [hasMorePopular, setHasMorePopular] = useState(false);
  //const [hasMoreTrending, setHasMoreTrending] = useState(true);
  const [hasMoreRecommended, setHasMoreRecommended] = useState(false);

  const [visibleCount, setVisibleCount] = useState(4);
  const [visibleTrendingCount, setVisibleTrendingCount] = useState(4);

  const renderedCommunityIds = new Set<number>();

  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getCategoriesTag();
      if (response && response.success) {
        setTags(response.data as CategoryTag[]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch communities and community tags based on URL slug
  useEffect(() => {
    if (!categorySlug && user) {
      const fetchData = async () => {
        // Obtener comunidades recomendadas
        const recommendedResponse = await getRecommendedCommunities(
          String(user.id)
        );
        if (recommendedResponse && recommendedResponse?.success) {
          setRecommendedCommunities(recommendedResponse.data as Community[]);
        }

        // Obtener comunidades similares
        const popularResponse = await getPopularCommunities();
        if (popularResponse && popularResponse?.success) {
          setPopularCommunities(popularResponse.data as Community[]);
        }

        // Obtener comunidades de tendencia
        const trendingResponse = await getTrendingCommunities();
        if (trendingResponse && trendingResponse?.success) {
          setTrendingCommunities(trendingResponse.data as Community[]);
        }

        setCommunityTags([]);
        setCommunities([]);
      };
      fetchData();
      return;
    }

    // Lógica para una categoría específica
    if (categorySlug && tags.length > 0) {
      const originalName = categorySlug.replace(/_/g, " ");
      const foundTag = tags.find(
        (tag) => tag.name.toLowerCase() === originalName.toLowerCase()
      );

      if (foundTag) {
        const fetchData = async () => {
          const communityTagsResponse = await getByCategoryId(foundTag.id);
          if (communityTagsResponse && communityTagsResponse.success) {
            setCommunityTags(communityTagsResponse.data as CommunityTag[]);
          }

          const communitiesResponse = await getCommunityByTag(foundTag.id);
          if (communitiesResponse && communitiesResponse.success) {
            setCommunities(communitiesResponse.data as Community[]);
          }
        };
        fetchData();
      } else {
        console.log("No se encontró la categoría");
        setCommunityTags([]);
        setCommunities([]);
      }
    }
  }, [categorySlug, tags, user]);

  const handleCommunityByTag = (tag: CategoryTag) => {
    const slug = tag.name.replace(/\s+/g, "_").toLowerCase();
    navigate(`/explore/${slug}`);
  };

  const handleAllCommunities = () => {
    navigate("/explore");
  };

  return (
    <section className="mt-10 ps-[50px] w-[80%] flex flex-col mx-auto">
      <h2 className="text-[30px] Dosis-Bold text-black mb-4">
        Explorar comunidades
      </h2>

      {/* Category Tags */}
      <div className="flex gap-3 items-center overflow-hidden mt-3">
        <div>
          <button
            type="button"
            className={` border-[#dbdbdb] p-2 text-[12px] border cursor-pointer hover:bg-[#dbdbdb] rounded-lg 
              ${
                !categorySlug
                  ? "bg-red hover:bg-[#923025] text1"
                  : "bg-white text5"
              }`}
            onClick={handleAllCommunities}
          >
            Todos
          </button>
        </div>
        {tags.map((tag) => {
          return (
            <div
              key={tag.id}
              onClick={() => handleCommunityByTag(tag)}
              className={`p-2 border-[#dbdbdb] border cursor-pointer hover:bg-[#dbdbdb] rounded-lg ${
                categorySlug === tag.name.replace(/\s+/g, "_").toLowerCase()
                  ? "bg-red hover:bg-[#923025]!"
                  : "bg-white"
              }`}
            >
              <h3
                className={`text-[12px] ${
                  categorySlug === tag.name.replace(/\s+/g, "_").toLowerCase()
                    ? "text1"
                    : "text5"
                }`}
              >
                {tag.name}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Renderiza las comunidades recomendadas si estás en la vista "Todos" */}
      {!categorySlug && recommendedCommunities.length > 0 && (
        <div className="mt-10 w-[80%]">
          <h3 className="text-[18px] text5 Dosis-Bold mb-4 tracking-tight">
            Recomendadas para ti
          </h3>
          <div
            className={`overflow-hidden ${
              hasMoreRecommended ? "h-fit" : "max-h-[300px]"
            } `}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </div>
          {recommendedCommunities.length > 4 && (
            <button
              type="button"
              className="text-[13px] text3 tracking-tight bg-gray px-5 py-2 rounded-[40px] cursor-pointer"
              onClick={() => setHasMoreRecommended(!hasMoreRecommended)}
            >
              Mostrar más
            </button>
          )}
        </div>
      )}

      {!categorySlug && popularCommunities.length > 0 && (
        <div className="mt-10 w-[80%]">
          <h3 className="text-[18px] text5 Dosis-Bold mb-4 tracking-tight">
            Más populares
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            {popularCommunities.slice(0, visibleCount).map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>

          {visibleCount < popularCommunities.length && (
            <button
              type="button"
              className="text-[12px] text1 flex mx-auto tracking-tight bg-blue px-3 py-2 rounded-[40px] cursor-pointer"
              onClick={() => setVisibleCount((prev) => prev + 4)}
            >
              Mostrar más
            </button>
          )}
        </div>
      )}

      {!categorySlug && trendingCommunities.length > 0 && (
        <div className="mt-10 w-[80%]">
          <h3 className="text-[18px] text5 Dosis-Bold mb-4 tracking-tight">
            En tendencia en todo el mundo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            {trendingCommunities
              .slice(0, visibleTrendingCount)
              .map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
          </div>

          {visibleTrendingCount < trendingCommunities.length && (
            <button
              type="button"
              className="text-[12px] text1 flex mx-auto tracking-tight bg-blue px-3 py-2 rounded-[40px] cursor-pointer"
              onClick={() => setVisibleTrendingCount((prev) => prev + 4)}
            >
              Mostrar más
            </button>
          )}
        </div>
      )}

      {/* Renderiza las comunidades por tags si no estás en la vista "Todos" */}
      {categorySlug && (
        <div className="mt-10 w-[80%]">
          {communityTags.map((ctag) => {
            const communitiesInTag = communities.filter(
              (c) =>
                c.tags?.some((t) => t.id === ctag.id) &&
                !renderedCommunityIds.has(Number(c.id))
            );

            communitiesInTag.forEach((c) =>
              renderedCommunityIds.add(Number(c.id))
            );

            if (communitiesInTag.length > 0) {
              return (
                <div key={ctag.id} className="mb-8">
                  <h3 className="text-[18px] text5 Dosis-Bold mb-4 tracking-tight">
                    {ctag.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {communitiesInTag.map((community) => (
                      <CommunityCard key={community.id} community={community} />
                    ))}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </section>
  );
};

export default UExplore;
