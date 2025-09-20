import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import type { Community } from "../../interface/global";
import UIDashboard from "../../components/users/UIDashboard";

import { getCommunityByName } from "../../services/community.api";

import { Plus } from "lucide-react";

const UCommunity = () => {
  const location = useLocation();
  const communityName = (location.state as { communityName?: string })
    ?.communityName;

  const [community, setCommunity] = useState<Community | null>(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (communityName) {
        const response = await getCommunityByName(communityName);
        if (response && response.data) {
          setCommunity(response.data as Community);
          console.log(response.data);
        }
      }
    };
    fetchCommunity();
  }, [communityName]);

  return (
    <UIDashboard>
      <section className="w-[95%] md:w-[90%] flex flex-col gap-3 px-2 py-1 mt-5">
        <div className="w-full rounded-lg relative">
          {/* Banner */}
          <div className="w-full h-40 sm:h-50 md:h-54 lg:h-48">
            {community?.theme_color && (
              <img
                alt="Banner de la comunidad"
                className="w-full h-full object-cover rounded-[10px]"
                src={community.theme_color}
              />
            )}
          </div>

          {/* Contenedor flexible */}
          <div className="flex justify-between items-center gap-3 px-8 py-2 w-full  absolute -bottom-17 z-20">
            {/* Logo + Nombre */}
            <div className="flex items-baseline gap-3 flex-shrink">
              {community?.image_url && (
                <img
                  alt="Logo de la comunidad"
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-25 md:h-25 object-cover border-4 border-white rounded-full"
                  src={community.image_url}
                />
              )}
              {community?.name && (
                <h2 className="text-lg sm:text-xl md:text-[28px] Arvo-Bold tracking-tight text3">
                  {community.name}
                </h2>
              )}
            </div>

            <div>
              <button
                type="button"
                className="mt-20 rounded-full border flex items-center gap-2 px-4 py-2 cursor-pointer"
              >
                <Plus size={24} />
                <span className="text5 text-[14px] Arvo-Bold tracking-tight">
                  Crear post/receta
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </UIDashboard>
  );
};

export default UCommunity;
