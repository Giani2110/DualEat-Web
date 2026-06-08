import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";

import { Ellipsis } from "lucide-react";
import PostActions from "./PostActions";
import type { Post } from "@/interface/global";
import { ROUTES } from "@/api/constants/constants";
import { getShortTimeAgo } from "@/utils/date";

import DOMPurify from "dompurify";

interface PostCardProps {
  post: Post;
  type: "POST" | "HOME" | "COMMUNITY";
  padding?: string;
}
const stripHTMLTags = (str: string) => {
  if (!str) return "";

  return str
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
};

const PostCard = ({ post, type = "HOME", padding }: PostCardProps) => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const handleNavigate = (type: "POST" | "RECIPE" | "COMMUNITY") => {
    switch (type) {
      case "POST":
        navigate(
          ROUTES.USER.POST(
            post.community?.slug || "",
            post.id || "",
            post.slug || "",
          ),
        );
        break;

      case "RECIPE":
        navigate(
          ROUTES.USER.RECIPE(post.recipe?.id || "", post.recipe?.slug || ""),
        );
        break;

      case "COMMUNITY":
        navigate(ROUTES.USER.COMMUNITY(post.community?.slug || ""));
        break;

      default:
        break;
    }
  };

  return (
    <article
      key={post.id}
      onClick={(e) => {
        if (type === "POST") return;
        e.stopPropagation();
        handleNavigate("POST");
      }}
      className={`flex flex-row gap-x-3 ${padding} ${type !== "POST" && "cursor-pointer hover:bg-gray-100/80"} transition-colors duration-200`}
    >
      <img
        src={
          type === "COMMUNITY"
            ? post.user?.avatar_url
            : post.community?.image_url ||
              "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
        }
        className="max-w-9 max-h-9 w-full h-full rounded-full object-cover"
        alt="Imagen de perfil"
      />

      <div className="flex flex-col w-full gap-y-4">
        <div className="flex flex-col gap-y-1">
          <header className="flex items-center justify-between w-full">
            <div className="flex flex-row items-center gap-x-3">
              {type !== "COMMUNITY" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate("COMMUNITY");
                  }}
                  className="text-[14px] font-semibold text-text-3"
                >
                  {post.community?.name}
                </button>
              )}

              <div className="flex flex-row items-center gap-x-1">
                <p className="text-[14px] text4">@{post.user?.name}</p>
                <span className="text-[12px] text4">•</span>
                <p className="text-[14px] text4">
                  {getShortTimeAgo(post.created_at, false)}
                </p>
              </div>
            </div>

            {post.user?.id === user?.id && (
              <button
                title="Editar"
                type="button"
                className="cursor-pointer hover:bg-[#dbdbdb] rounded-full p-1"
              >
                <Ellipsis size={18} color="#4A4947" />
              </button>
            )}
          </header>

          <h1 className="text-lg text-text-3 font-bold">{post.title}</h1>

          {post.content && post.image_urls?.length === 0 && type !== "POST" ? (
            <p
              style={{ lineClamp: 6 }}
              className="text-[15px] font-light text-text-5 text-ellipsis max-w-full"
            >
              {stripHTMLTags(post.content || "")}
            </p>
          ) : (
            type === "POST" && (
              <div
                style={{ lineHeight: "24px" }}
                className="
                  text-[15px] 
                  text-text-5
                  max-w-full
                  
                  /* Mapeo de tus estilos de Mobile a Web */
                  [&_strong]:font-bold
                  [&_u]:underline
                  
                  [&_ul]:pl-3
                  [&_ul]:mb-3
                  
                  [&_li]:pl-3
                  
                  [&_p]:font-light
                  [&_p]:mb-3"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content),
                }}
              />
            )
          )}

          {post.recipe && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate("RECIPE");
              }}
              className="flex-wrap cursor-pointer flex flex-row flex-wrap px-3 items-center gap-2 py-1 w-fit rounded-lg border border-[#dbdbdb] text5 text-[15px] tracking-tight hover:scale-101 hover:shadow-sm transition duration-100"
            >
              <img
                src={post.recipe.main_image || ""}
                className="w-[30px] h-[30px] object-cover rounded-full"
                alt="Imagen de la receta"
              />
              <p className="font-bold sm:border-r border-[#8d8d8d] pe-2">
                {post.recipe.name}
              </p>
              <p className="sm:border-r border-[#8d8d8d] pe-2">
                {post.recipe.total_time} min
              </p>
              <p className="sm:border-r border-[#8d8d8d] pe-2">
                {post.recipe && post.recipe.ingredients
                  ? post.recipe.ingredients.length
                  : 0}{" "}
                ingredientes
              </p>
              <p>
                {post.recipe && post.recipe.steps
                  ? post.recipe.steps.length
                  : 0}{" "}
                pasos
              </p>
            </div>
          )}
        </div>

        {/** Acciones del post */}
        <PostActions content={post as Post} type="POST" />
      </div>
    </article>
  );
};

export default PostCard;

/** 
 * {post.image_urls.length > 0 ? (
            <a
              href={post.image_urls[0]}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              rel="noopener noreferrer"
              className="block aspect-[6/3] mt-3 overflow-hidden rounded-[15px] relative"
            >
              {post.image_urls.length > 0 && (
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
 */
