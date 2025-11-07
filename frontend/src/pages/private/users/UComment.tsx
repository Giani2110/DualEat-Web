import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import { getBySlug } from "@services/post.api";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import { createComment } from "@services/post.api";

import type { Comment, Community, PostFull } from "@interface/global";

import CommentsCard from "@/components/private/users/cards/CommentsCard";
import { Loader } from "lucide-react";
import { ROUTES } from "@constants/constants";
import PostActions from "@/components/private/users/ui/PostActions";
import CommunityInfo from "@/components/private/users/ui/CommunityInfo";
import { getCommunityBySlug } from "@/services/community.api";

const UComment = () => {
  const { communitySlug } = useParams<{ communitySlug: string }>();
  const { postSlug } = useParams<{ postSlug: string }>();
  const { userSlug } = useParams<{ userSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const sortByParam = parseInt(searchParams.get("sortBy") || "1", 10);
  const [sortBy, setSortBy] = useState(sortByParam);

  const [valueComment, setValueComment] = useState("");

  const [community, setCommunity] = useState<Community | null>(null);

  const [post, setPost] = useState<PostFull | null>(null);
  const [postComments, setPostComments] = useState<PostFull["comments"]>([]);

  const [openInput, setOpenInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSortChange = (value: number) => {
    setSearchParams({ sortBy: value.toString() });
    setSortBy(value);
    setOpenInput(false);
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (communitySlug && postSlug && userSlug) {
        setLoading(true);
        try {
          const response = await getBySlug(
            communitySlug,
            postSlug,
            userSlug,
            sortBy
          );

          if (response && response.data) {
            setPost(response.data as PostFull);
          } else {
            navigate(ROUTES.ERROR, { replace: true });
          }
        } catch (error) {
          console.error("Error al obtener el post:", error);
          navigate(ROUTES.ERROR, { replace: true });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPost();
  }, [postSlug, communitySlug, userSlug, sortBy, navigate]);

  // Obtener comunidad
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        if (communitySlug) {
          const response = await getCommunityBySlug(communitySlug);
          if (response && response.data) {
            setCommunity(response.data as Community);
          } else {
            navigate(ROUTES.ERROR, { replace: true });
          }
        }
      } catch (error) {
        console.error("Error al obtener la comunidad:", error);
        navigate(ROUTES.ERROR, { replace: true });
      }
    };
    fetchCommunity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communitySlug]);

  useEffect(() => {
    if (post?.comments) {
      setPostComments(post.comments);
    }
  }, [post?.comments]);

  const handleAddReply = (parentId: string, newReply: Comment) => {
    const addReplyToComment = (comments: Comment[]): Comment[] => {
      return comments.map((comment) => {
        if (comment.id === parentId) {
          // Encontramos el comentario padre, agregamos la reply
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          };
        } else if (comment.replies && comment.replies.length > 0) {
          // Buscar recursivamente en las replies
          return {
            ...comment,
            replies: addReplyToComment(comment.replies),
          };
        }
        return comment;
      });
    };

    setPostComments((prevComments) => addReplyToComment(prevComments));
  };

  // Modificar handleComment para comentarios de nivel superior
  const handleComment = async () => {
    try {
      const response = await createComment(post?.id as string, valueComment);
      setValueComment("");

      if (response?.success && response?.data) {
        const raw = response.data as PostFull["comments"][number];

        const newComment: PostFull["comments"][number] = {
          id: raw.id,
          user_id: raw.user_id,
          post_id: raw.post_id,
          parent_comment_id: raw.parent_comment_id,
          content: raw.content,
          votes_up: raw.votes_up,
          votes_down: raw.votes_down,
          created_at: raw.created_at,
          updated_at: raw.updated_at,
          edited: raw.edited,
          active: raw.active,
          user: {
            id: raw.user.id,
            slug: raw.user.slug,
            name: raw.user.name,
            avatar_url: raw.user.avatar_url,
          },
          userVote: null,
          replies: [],
        };

        setPostComments([...postComments, newComment]);
      }
    } catch (error) {
      console.error("Error al crear el comentario:", error);
    }
  };

  return (
    <section className="w-[95%] md:w-[80%] mx-auto flex px-2 gap-15 py-1 mt-5 mb-10">
      <div className="w-full md:flex-[1] lg:flex-[3] max-w-3xl relative">
        <div className="h-fit hidden md:block absolute -left-11 top-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Volver atrás"
            className="bg-gray rounded-full p-1.5 border border-[#dbdbdb] cursor-pointer hover:border-[#888888] hover:bg-[#dbdbdb]!"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height={20}
              width={20}
              viewBox="0 0 640 640"
            >
              <path
                fill="#4A4947"
                d="M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z"
              />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 items-start">
          <img
            src={post?.community.image_url}
            alt="Imagen de la comunidad"
            className="w-8 h-8  rounded-full object-cover"
          />
          <div className="flex flex-col leading-4.5">
            <span className="text-[14.5px] text5 Dosis-Bold">
              {post?.community.name}
            </span>
            <span className="text-[13.5px] text4">{post?.user.name}</span>
          </div>
          <span className="w-[4px] h-[4px] rounded-full bg-[#707070] mt-2" />
          {post?.created_at && !isNaN(new Date(post.created_at).getTime()) ? (
            <span
              title={format(
                new Date(post.created_at),
                "d 'de' MMMM 'de' yyyy",
                {
                  locale: es,
                }
              )}
              className="text-[13px] text4 flex"
            >
              {formatDistanceToNow(new Date(post.created_at), {
                locale: es,
                addSuffix: true,
              })}
            </span>
          ) : (
            <span className="text-[13px] text4">Fecha inválida</span>
          )}
        </div>

        <div className="mt-3">
          <h1 className="text-[25px] text5 Dosis-Bold">{post?.title}</h1>

          {post?.image_urls && post.image_urls.length > 0 ? (
            <div className=" aspect-[6/4] mt-3 overflow-hidden rounded-[15px] relative">
              <div
                className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-50"
                style={{
                  backgroundImage: `url(${post?.image_urls[0]})`,
                }}
              />

              <img
                className="w-full h-full object-contain cursor-pointer relative z-10"
                alt="Imagen del post"
                src={post?.image_urls[0]}
              />

              {post?.image_urls.length > 1 && (
                <>
                  <button
                    type="button"
                    //onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 bg-black/70 hover:bg-black/80 text-white rounded-full flex items-center cursor-pointer justify-center transition-colors duration-200"
                    title="Imagen anterior"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    //onClick={nextImage}
                    className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 bg-black/70 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                    title="Siguiente imagen"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ) : (
            <p className="text5 text-[16px] mt-1 tracking-tight line-clamp-[10]">
              {post?.content}
            </p>
          )}

          <PostActions post={post as PostFull} />
          <div className="w-full h-[1px] mt-10 bg-[#dbdbdb]" />
        </div>

        {/* Sección de comentarios */}

        <div className="mt-5">
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleComment();
              }
            }}
            onChange={(e) => setValueComment(e.target.value)}
            className="flex-[1] w-full px-4 py-2 rounded-[20px] border border-[#dbdbdb] text-[16px] tracking-tight outline-[#3578e4]"
            placeholder="Escribe un comentario..."
            type="text"
          />
        </div>

        <section className="mt-5">
          {loading ? (
            <Loader />
          ) : postComments?.length > 0 ? (
            <>
              <div className="flex items-center justify-start gap-4 mb-6">
                <p className="text-[14px] text4">Ordenar por:</p>
                <div
                  onClick={() => setOpenInput(!openInput)}
                  className={`relative flex items-center cursor-pointer px-3 py-[6px] rounded-full gap-1 ${
                    openInput ? "bg-gray-300" : "hover:bg-gray-200"
                  }`}
                >
                  <span className="text-[14px] text5 Dosis-Bold">
                    {{
                      1: "Más votados",
                      2: "Más recientes",
                      3: "Más antiguos",
                      4: "Más polémicos",
                    }[sortBy] || "Más votados"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="12"
                    width="12"
                    viewBox="0 0 640 640"
                  >
                    <path d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z" />
                  </svg>

                  {openInput && (
                    <div className="absolute top-10 -left-10 min-w-[200px] flex flex-col bg-white rounded-[10px] overflow-hidden shadow-lg z-50">
                      {[
                        { id: 1, label: "Más votados", icon: "🔥" },
                        { id: 2, label: "Más recientes", icon: "🕒" },
                        { id: 3, label: "Más antiguos", icon: "📜" },
                        { id: 4, label: "Más polémicos", icon: "⚡" },
                      ].map(({ id, label, icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleSortChange(id)}
                          className={`text-[15px] py-3 flex items-start gap-3 px-3 text5 hover:bg-gray-200 cursor-pointer ${
                            sortBy === id ? "bg-gray-300" : ""
                          }`}
                        >
                          <span>{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {postComments.map((comment) => (
                  <CommentsCard
                    key={comment.id}
                    comment={comment}
                    onAddReply={handleAddReply}
                    setSortBy={setSortBy}
                  />
                ))}
              </div>
            </>
          ) : null}
        </section>
      </div>

      {community && <CommunityInfo community={community} isCommunity={false} />}
    </section>
  );
};

export default UComment;
