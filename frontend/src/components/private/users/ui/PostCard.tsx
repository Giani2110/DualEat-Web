import React, { useState } from "react";
import type { Posts } from "@interface/global";
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
} from "lucide-react";
import PostActions from "./PostActions";

interface PostCardProps {
  Post: Posts;
  isDashboard?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ Post, isDashboard }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [imgIndex, setImgIndex] = useState(0);

  const handleNextImage = () => {
    if (imgIndex < Post.image_urls.length - 1) {
      setImgIndex((prevIndex) => (prevIndex + 1) % Post.image_urls.length);
    }
  };

  const handlePrevImage = () => {
    if (imgIndex > 0) {
      setImgIndex(
        (prevIndex) =>
          (prevIndex - 1 + Post.image_urls.length) % Post.image_urls.length
      );
    }
  };

  const handleSelectCommunity = (
    e: React.MouseEvent,
    communitySlug: string
  ) => {
    e.stopPropagation();
    navigate(`/c/${communitySlug}/`, {
      state: { communitySlug },
    });
  };

  const handleNavigate = (e: React.MouseEvent, Post: Posts, post: boolean) => {
    e.stopPropagation();
    if (post) {
      navigate(`/c/${Post.community.slug}/post/${Post.user.slug}/${Post.slug}`);
    } else {
      navigate(
        `/c/${Post.community.slug}/recipe/${Post.user.slug}/${Post.recipe.slug}`
      );
    }
  };

  return (
    <>
      <div
        onClick={(e) => handleNavigate(e, Post, true)}
        className={`flex gap-3 w-full min-h-[110px] cursor-pointer rounded-[8px] border border-[#dddddd]/50 p-3 hover:bg-[#dddddd28] transition-colors duration-200 ${
          isDashboard ? "bg-white/40" : "bg-white/40"
        }`}
      >
        <div>
          {isDashboard ? (
            <img
              src={
                Post.community?.image_url ||
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
              }
              alt="Imagen de perfil"
              className="w-6 h-6 max-w-6 max-h-6 rounded-full object-cover"
            />
          ) : (
            <img
              src={
                Post.user?.avatar_url ||
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
              }
              alt="Imagen de perfil"
              className="w-8 h-8 max-w-8 max-h-8 rounded-full"
            />
          )}
        </div>
        <div className="flex flex-col w-full min-w-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {isDashboard ? (
                <h1
                  onClick={(e) => handleSelectCommunity(e, Post.community.slug)}
                  className="text5 text-[13.5px] Dosis-Bold hover:text-[#1d51a3]!"
                >
                  {Post.community?.name}
                </h1>
              ) : (
                <h1 className="text5 text-[14px] Dosis-Bold">
                  {Post.user?.name}
                </h1>
              )}

              <span className="h-1 w-1 bg-gray-500 rounded-full" />
              <small className="text-[12px] text4">
                {formatDistanceToNow(new Date(Post.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </small>
            </div>
            {Post.user?.id === user?.id && (
              <button
                title="Editar"
                type="button"
                className="cursor-pointer hover:bg-[#dbdbdb] rounded-full p-1"
              >
                <Ellipsis size={18} color="#4A4947" />
              </button>
            )}
          </div>

          <div className="mt-1">
            <h2 className="text-[18px] Dosis-Bold">{Post.title}</h2>

            {Post.image_urls.length > 0 ? (
              <a
                href={Post.image_urls[imgIndex]}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                rel="noopener noreferrer"
                className="block aspect-[6/3] mt-3 overflow-hidden rounded-[15px] relative"
              >
                {Post.image_urls.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className={`absolute top-1/2 bg-[#2F2F2F] p-1 rounded-full -translate-y-1/2  z-50 cursor-pointer hover:scale-110 transition duration-200 ${
                        imgIndex === 0 ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      {imgIndex === 0 ? (
                        <ChevronRight size={24} color="#fff" />
                      ) : (
                        <ChevronLeft size={30} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className={`absolute top-1/2 bg-[#2F2F2F] p-1 rounded-full -translate-y-1/2  z-50 cursor-pointer hover:scale-110 transition duration-200 ${
                        imgIndex === 0 ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      {imgIndex === 0 ? (
                        <ChevronRight size={24} color="#fff" />
                      ) : (
                        <ChevronLeft size={30} />
                      )}
                    </button>
                  </>
                )}

                <div
                  className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-50"
                  style={{
                    backgroundImage: `url(${Post.image_urls[imgIndex]})`,
                  }}
                />

                <img
                  className="w-full h-full object-contain cursor-pointer relative z-10"
                  alt="Imagen del post"
                  src={Post.image_urls[0]}
                />
              </a>
            ) : (
              <p className="text5 text-[15px] mt-1 tracking-tight line-clamp-[7]">
                {Post.content}
              </p>
            )}
            {Post.recipe && (
              <div
                onClick={(e) => handleNavigate(e, Post, false)}
                className="bg-[#ffffff69] flex-wrap flex flex-col sm:flex-row mt-5 px-3 sm:items-center gap-2 py-1 w-fit rounded-lg border border-[#dbdbdb] text5 text-[15px] tracking-tight hover:scale-101 hover:shadow-sm transition duration-100"
              >
                <img
                  src={Post.recipe.main_image || ""}
                  className="w-[30px] h-[30px] object-cover rounded-full border border-gray-300"
                  alt="Imagen de la receta"
                />
                <p className="Dosis-Bold border-b sm:border-b-0 sm:border-r border-[#8d8d8d] pe-2">
                  {Post.recipe.name}
                </p>
                <p className="border-b sm:border-b-0 sm:border-r border-[#8d8d8d] pe-2">
                  {Post.recipe.total_time} min
                </p>
                <p className="border-b sm:border-b-0 sm:border-r border-[#8d8d8d] pe-2">
                  {Post.recipe._count.ingredients} ingredientes
                </p>
                <p>{Post.recipe._count.steps} pasos</p>
              </div>
            )}
          </div>

          {/** Acciones del post */}
          <PostActions post={Post} />
        </div>
      </div>
    </>
  );
};

export default PostCard;
