import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

import { axiosInterceptor } from "../../interceptor/axios-interceptor";
import {
  joinCommunity,
  getUserCommunities,
} from "../../services/community.api";

import type { Community } from "../../interface/global";

import UIDashboard from "../../components/users/UIDashboard";

import "../../assets/scss/users/users.scss";

type UserCommunityEntry = {
  community: Community;
  is_moderator: boolean;
  joined_at: string;
};

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  const [communities, setCommunities] = useState<Community[]>([]);

  const [joinedCommunities, setJoinedCommunities] = useState<
    UserCommunityEntry[]
  >([]);

  /*const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [image, setImage] = useState<File | null>(null);*/

  /*const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handlePost = () => {
    // 🚀 Aquí mandas el post al backend
    console.log({
      title,
      description,
      ingredients,
      steps,
      difficulty,
      image,
    });
  };
*/

  const handleJoinCommunity = async (communityId: number) => {
    // ver si el usuario es el dueño de la comunidad
    try {
      const response = await joinCommunity(user.id, communityId);

      if (response && response.success) {
        console.log("Community joined successfully");

        const updated = await getUserCommunities(user.id);
        if (updated && updated.success) {
          setJoinedCommunities(updated.data as UserCommunityEntry[]);
          console.log("Joined communities:", updated.data);
        }
      }
    } catch (error) {
      console.error("Error al unirse a la comunidad:", error);
    }
  };

  useEffect(() => {
    const fetchAllCommunities = async () => {
      try {
        const response = await axiosInterceptor.get("/community/all");
        setCommunities(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllCommunities();

    getUserCommunities(user.id).then((response) => {
      if (response && response.success) {
        setJoinedCommunities(response.data as UserCommunityEntry[]);
      }
    });
  }, [user.id]);

  return (
    <UIDashboard>
      <div className="w-full">
        <div className="w-[90%] px-2 py-1 mt-10">
          {communities.map((community: Community) => {
            const joinedEntry = joinedCommunities.find(
              (entry) => entry.community.id === community.id
            );

            const isJoined = !!joinedEntry;
            const isModerator = joinedEntry?.is_moderator === true;

            return (
              <div
                key={community.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <img
                    className="w-[25px] h-[25px] rounded-full"
                    src={community.image_url || undefined}
                    alt=""
                  />
                  <h1 className="text-[12px] text5 Arvo-Bold tracking-wide ml-2">
                    {community.name}
                  </h1>
                  <span className="text-[11px] text4 Arvo-Bold mx-2">•</span>
                  <span className="text-[11px] text4">hace 14 hs</span>
                  <span className="text-[11px] text4 Arvo-Bold mx-2">•</span>
                  <span className="text-[11px] text4">123k seguidores</span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      !isModerator && handleJoinCommunity(community.id)
                    }
                    disabled={isModerator}
                    className={`text-[13px] tracking-tight px-4 py-1 rounded-full transition-colors duration-200 ${
                      isModerator
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : isJoined
                        ? "bg-[#4A4947] text-white hover:bg-transparent hover:ring-2 hover:ring-[#e5a657] hover:text-[#4A4947]"
                        : "bg-[#e5a657] text-white hover:bg-transparent hover:ring-2 hover:ring-[#e5a657] hover:text-[#4A4947]"
                    }`}
                  >
                    {isModerator
                      ? "Moderador"
                      : isJoined
                      ? "Se unió"
                      : "Unirse"}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Post 
          <div className="flex items-center justify-between">
            <div className="flex items-center">
            <img
              className="w-[25px] h-[25px] rounded-full"
              src={user?.avatar_url || undefined}
              alt=""
            />
            <h1 className="text-[12px] text5 Arvo-Bold tracking-wide ml-2">
              {user?.name}
            </h1>
            <span className="text-[11px] text4 Arvo-Bold  mx-2">•</span>
            <span className="text-[11px] text4">hace 14 hs</span>
            <span className="text-[11px] text4 Arvo-Bold  mx-2">•</span>
            <span className="text-[11px] text4">123k seguidores</span>
          </div>
          <div>
            <button
              type="button"
              className="bg-[#e5a657] hover:text-[#4A4947] text-[13px] cursor-pointer hover:bg-transparent hover:ring-2 hover:ring-[#e5a657] text-white tracking-tight px-4 py-1 rounded-full"
            >
              Unirse
            </button>
          </div>
          </div>

          <div className="flex flex-col mt-3">
            <h1 className="Arvo-Bold text5 text-[16px]">
              ¿Por qué el bife de chorizo lo venden caro?
            </h1>
            <div className="w-full aspect-[6/3] mt-3 overflow-hidden rounded-lg relative">
              
              <div
                className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-50"
                style={{
                  backgroundImage: `url(https://media.hellofresh.com/w_3840,q_auto,f_auto,c_fill,fl_lossy/hellofresh_website/es/cms/SEO/recipes/albondigas-caseras-de-cerdo-con-salsa-barbacoa.jpeg)`,
                }}
              />
              
              <img
                className="w-full h-full object-contain cursor-pointer relative z-10"
                alt=""
                src="https://media.hellofresh.com/w_3840,q_auto,f_auto,c_fill,fl_lossy/hellofresh_website/es/cms/SEO/recipes/albondigas-caseras-de-cerdo-con-salsa-barbacoa.jpeg"
              />
            </div>
          </div>
*/}
        </div>
      </div>
    </UIDashboard>
  );
};

export default UserDashboard;
