import { useEffect, useState } from "react";


import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import type { Community, TagCategory } from "@/interface/global";
import { getTagCategories } from "@/services/category.api";
import { ROUTES } from "@/constants/constants";
import { getByCategorySkeleton } from "@/services/community.api";
import { useJoinLeave, useMyCommunities } from "@/hooks/api/useMyCommunities";


import { useAuth } from "@hooks/useAuth";
import { getCommunityByTag } from "@services/community.api";



import { useNavigate, useParams } from "react-router-dom";

import CommunityCard from "@/components/private/users/cards/CommunityCard";

export default function ExploreScreen() {
  const [tags, setTags] = useState<TagCategory[]>([]);

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
    [],
  );

  //const [hasMorePopular, setHasMorePopular] = useState(false);
  //const [hasMoreTrending, setHasMoreTrending] = useState(true);
  const [hasMoreRecommended, setHasMoreRecommended] = useState(false);

  const [visibleCount, setVisibleCount] = useState(4);
  const [visibleTrendingCount, setVisibleTrendingCount] = useState(4);

  const renderedCommunityIds = new Set<number>();

  const navigate = useNavigate();

  
  

  const handleCommunityByTag = (tag: TagCategory) => {
    const slug = tag.name.replace(/\s+/g, "_").toLowerCase();
    //navigate(`/explore/${slug}`);
  };

  const handleAllCommunities = () => {
    // navigate("/explore");
  };

  return (
    <section className="mt-10 ps-[50px] w-[80%] flex flex-col mx-auto">
      <h2 className="text-[30px] font-bold text-black mb-4">
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
    </section>
  );
};
