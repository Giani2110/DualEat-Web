import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";

import { BadgeCheck, Ellipsis } from "lucide-react";
import PostActions from "./PostActions";
import type { Post } from "@/interface/global";
import { ROUTES } from "@/api/constants/constants";
import { getShortTimeAgo } from "@/utils/date";

import DOMPurify from "dompurify";
import ImagesCarousel from "@/components/shared/ImagesCarousel";
import type { UploadableFile } from "@/interface/global.dto";
import { useMyCommunities } from "@/hooks/api/community/useCommunity";
import { useState } from "react";
import { useDeletePost } from "@/hooks/api/post/usePost";
import toast from "react-hot-toast";
import { usePostCreateStore } from "@/context/store/usePostCreate";

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

  const { data: myCommunities } = useMyCommunities();
  const { mutate: deletePost } = useDeletePost();

  const { setPost } = usePostCreateStore();

  const navigate = useNavigate();

  const handleNavigate = (type: "POST" | "RECIPE" | "COMMUNITY") => {
    switch (type) {
      case "POST":
        navigate(ROUTES.USER.POST(post.id || "", post.slug || ""));
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

  const [open, setOpen] = useState(false);

  const isPostCreator = post.user_id === user?.id || post.user?.id === user?.id;

  const isCreator = post.community?.creator_id === user?.id;

  const isModerator =
    myCommunities?.some(
      (member) =>
        member.community_id === post.community_id && member.is_moderator,
    ) || false;

  const canEdit = isPostCreator;
  const canDelete = isPostCreator || isCreator || isModerator;

  const copyToClipboard = () => {
    toast.success("Enlace copiado al portapapeles");
    navigator.clipboard.writeText(
      `${window.location.host}/p/${post.id}/${post.slug}`,
    );
  };

  const handleDelete = () => {
    deletePost(
      {
        post_id: post.id,
        community_id: post.community_id,
      },
      {
        onSuccess: () => {
          toast.success("Post eliminado exitosamente");
        },
        onError: () => {
          toast.error("Error al eliminar el post");
        },
      },
    );
  };

  return (
    <article
      key={post.id}
      onClick={() => {
        if (type === "POST") return;
        handleNavigate("POST");
      }}
      className={`flex flex-wrap flex-col gap-y-3 ${padding} ${type !== "POST" && "cursor-pointer hover:bg-gray-100/80"} transition-colors duration-200`}
    >
      <header className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center gap-x-2.5">
          <img
            src={
              type === "COMMUNITY"
                ? post.user?.avatar_url
                : post.community?.image_url ||
                  "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
            }
            className="w-8 h-8 rounded-full object-cover"
            alt="Imagen de perfil"
          />
          <div className="flex flex-col gap-y-0.5">
            {type !== "COMMUNITY" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate("COMMUNITY");
                }}
                className="text-sm cursor-pointer hover:scale-104 transition-all duration-200 font-semibold text-text-3 text-left"
              >
                {post.community?.name}
              </button>
            )}

            <div className="flex flex-row items-center gap-2">
              {(post.user?.subscription_status === "ACTIVE" ||
                post.user?.subscription_status === "TRIAL") && (
                <BadgeCheck size={16} fill="#3578e4" color="#fff" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(ROUTES.USER.PROFILE(post.user.id, post.user.slug));
                }}
                className="cursor-pointer hover:scale-104 transition-all duration-200"
              >
                <p className="text-sm text-text-4">{post.user?.name}</p>
              </button>
              <p className="text-sm text-text-4">
                • {getShortTimeAgo(post.created_at, true)}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            title="Editar"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            className="cursor-pointer hover:bg-[#dbdbdb] rounded-full p-1"
          >
            <Ellipsis style={{ rotate: "90deg" }} size={16} color="#000" />
          </button>

          {open && (
            <>
              {/* Overlay invisible para cerrar el menú al hacer click afuera */}
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
              />
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md py-1 z-20 w-28">
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                      setPost({
                        id: post.id,
                        title: post.title,
                        content: post.content,
                        image_urls: (post.image_urls || []).map((url) => ({
                          file: null as any,
                          uri: url,
                        })),
                        community: post.community,
                      });
                      navigate(ROUTES.USER.CREATE_POST);
                    }}
                    className="w-full text-left cursor-pointer px-4 py-2 text-sm text-text-5 hover:bg-gray-100"
                  >
                    Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                      handleDelete();
                    }}
                    className="w-full text-left cursor-pointer px-4 py-2 text-sm text-bg-red hover:bg-gray-100"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-col w-full gap-y-2">
        <div className="flex flex-col gap-y-4">
          <h1 className="text-lg text-text-3 font-bold">{post.title}</h1>

          {post.image_urls?.length > 0 &&
            (type === "HOME" || type === "COMMUNITY" || type === "POST") && (
              <ImagesCarousel
                media={
                  post.image_urls.map((url) => ({
                    uri: url,
                    file: null as any,
                  })) as UploadableFile[]
                }
              />
            )}

          {type === "POST" ? (
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
          ) : (
            post.content &&
            !(
              post.image_urls?.length > 0 &&
              (type === "HOME" || type === "COMMUNITY")
            ) && (
              <p
                style={{ lineClamp: 6 }}
                className="text-[15px] font-light text-text-5 text-ellipsis max-w-full"
              >
                {stripHTMLTags(post.content || "")}
              </p>
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

          {/** Acciones del post */}
          <div>
            <PostActions
              content={post as Post}
              copyToClipboard={copyToClipboard}
              type="POST"
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
