import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import { getBySlug } from "../../services/post.api";
import type { Recipe } from "../../interface/global";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import { createVote } from "../../services/vote.api";
import { createComment } from "../../services/post.api";

import type { Comment } from "../../interface/global";

import CommentsCard from "../../components/users/cards/CommentsCard";
import { Loader } from "lucide-react";
import { formatCompactNumber } from "../../utils/compactNumber";
import { ROUTES } from "../../constants/constants";

export interface PostFull {
  id: string;
  slug: string;
  title: string;
  content: string;
  image_urls: string[];
  type: "post" | "recipe";
  votes_up: number;
  votes_down: number;
  total_comments: number;
  created_at: string;
  updated_at: string;
  edited: boolean;
  active: boolean;
  user_id: string;
  community_id: string;
  recipe_id: string | null;
  userVote: "up" | "down" | null;

  user: {
    id: string;
    slug: string;
    name: string;
    email: string;
    avatar_url: string;
    role: "user" | "admin";
    active: boolean;
    provider: string;
    is_business: boolean;
    subscription_status: "active" | "inactive";
    trial_ends_at: string | null;
    created_at: string;
    updated_at: string;
  };

  community: {
    id: string;
    slug: string;
    name: string;
    description: string;
    image_url: string;
    theme_color: string;
    visibility: "public" | "private";
    total_members: number;
    creator_id: string;
    created_at: string;
    updated_at: string;
    active: boolean;
  };

  recipe: Recipe | null;

  comments: Comment[];
}

const UComment = () => {
  const { communitySlug } = useParams<{ communitySlug: string }>();
  const { postSlug } = useParams<{ postSlug: string }>();
  const { userSlug } = useParams<{ userSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const sortByParam = parseInt(searchParams.get("sortBy") || "1", 10);
  const [sortBy, setSortBy] = useState(sortByParam);

  const [valueComment, setValueComment] = useState("");

  const [post, setPost] = useState<PostFull | null>(null);
  const [postComments, setPostComments] = useState<PostFull["comments"]>([]);

  const [totalLikes, setTotalLikes] = useState(0);
  const hasVoted = post?.userVote !== null && post?.userVote === "up";
  const hasVotedDown = post?.userVote !== null && post?.userVote === "down";

  const [voteUP, setVoteUP] = useState(hasVoted);
  const [voteDown, setVoteDown] = useState(hasVotedDown);

  const [openInput, setOpenInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

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

  useEffect(() => {
    if (post) {
      // Sincronizar totalLikes
      if (post.votes_up !== undefined && post.votes_down !== undefined) {
        setTotalLikes(post.votes_up - post.votes_down);
      }

      // Sincronizar voteUP y voteDown
      const newHasVoted = post.userVote === "up";
      const newHasVotedDown = post.userVote === "down";

      setVoteUP(newHasVoted); // Actualiza el estado voteUP
      setVoteDown(newHasVotedDown); // Actualiza el estado voteDown
    } else {
      // Opcional: Resetear si el post vuelve a ser null (ej. al cambiar de URL)
      setVoteUP(false);
      setVoteDown(false);
    }
  }, [post]);

  useEffect(() => {
    if (post?.comments) {
      setPostComments(post.comments);
    }
  }, [post?.comments]);

  const handleVote = async (e: React.MouseEvent, type: boolean) => {
    e.stopPropagation();
    const voteType = type ? "up" : "down";

    const response = await createVote(voteType, post?.id as string, "post");

    if (response?.status === 200) {
      console.log("Voto actualizado");
      if (type) {
        setVoteUP(true);
        setVoteDown(false);
        setTotalLikes(totalLikes + 2);
      } else {
        setVoteDown(true);
        setVoteUP(false);
        setTotalLikes(totalLikes - 2);
      }
    }

    if (response?.status === 201) {
      console.log("Voto creado");
      if (type) {
        setVoteUP(true);
        setVoteDown(false);
        setTotalLikes(totalLikes + 1);
      } else {
        setVoteDown(true);
        setVoteUP(false);
        setTotalLikes(totalLikes - 1);
      }
    }

    if (response?.status === 204) {
      console.log("Voto eliminado");
      setVoteUP(false);
      setVoteDown(false);

      if (voteUP) {
        setTotalLikes(totalLikes - 1);
      } else if (voteDown) {
        setTotalLikes(totalLikes + 1);
      }
    }
  };

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
    <section className="w-[95%] md:w-[80%] mx-auto flex px-2 gap-15 py-1 mt-5">
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

        <div className="flex gap-3 items-start">
          <img
            src={post?.community.image_url}
            alt="Imagen de la comunidad"
            className="w-8 h-8  rounded-full object-cover"
          />
          <div className="flex flex-col leading-5">
            <span className="text-[15px] text5 Dosis-Bold">
              {post?.community.name}
            </span>
            <span className="text-[14px] text4">{post?.user.name}</span>
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

        <div className="mt-5">
          <h1 className="text-[25px] text5 Dosis-Bold">{post?.title}</h1>

          {post?.image_urls && post.image_urls.length > 0 ? (
            <div className="max-w-[500px] aspect-[6/3] mt-3 overflow-hidden rounded-lg relative">
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

          <div className="flex items-center justify-start mt-8 gap-4 w-full">
            <div
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center border border-[#bebebe] w-fit gap-1 p-[2px] rounded-full ${
                voteUP
                  ? "bg-[#e5a657]"
                  : voteDown
                  ? "bg-[#b53325]"
                  : "bg-[#f5f5f5]"
              }`}
            >
              <button
                type="button"
                title="Me gusta"
                onClick={(e) => handleVote(e, true)}
                className={`cursor-pointer group p-1  rounded-full ${
                  voteUP ? "hover:bg-[#333333]" : "hover:bg-[#e4e4e4]"
                }`}
              >
                {voteUP ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="22"
                    width="22"
                    viewBox="0 0 640 640"
                  >
                    <path
                      className={`${voteUP && "fill-white"}`}
                      d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM331.3 188.7L435.3 292.7C439.9 297.3 441.2 304.2 438.8 310.1C436.4 316 430.5 320 424 320L368 320L368 416C368 433.7 353.7 448 336 448L304 448C286.3 448 272 433.7 272 416L272 320L216 320C209.5 320 203.7 316.1 201.2 310.1C198.7 304.1 200.1 297.2 204.7 292.7L308.7 188.7C314.9 182.5 325.1 182.5 331.3 188.7z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="22"
                    width="22"
                    viewBox="0 0 640 640"
                  >
                    <path
                      className={`${
                        voteDown && "fill-white"
                      } group-hover:fill-[#e5a657]`}
                      d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM331.3 188.7C325.1 182.5 314.9 182.5 308.7 188.7L204.7 292.7C200.1 297.3 198.8 304.2 201.2 310.1C203.6 316 209.5 320 216 320L288 320L288 424C288 437.3 298.7 448 312 448L328 448C341.3 448 352 437.3 352 424L352 320L424 320C430.5 320 436.3 316.1 438.8 310.1C441.3 304.1 439.9 297.2 435.3 292.7L331.3 188.7z"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`Dosis-Bold text-[15px] ${
                  voteUP || voteDown ? "text-white" : "text3"
                }`}
              >
                {totalLikes}
              </span>
              <button
                type="button"
                title="No me gusta"
                onClick={(e) => handleVote(e, false)}
                className={`cursor-pointer group p-1 rounded-full ${
                  voteDown ? "hover:bg-[#333333]" : "hover:bg-[#e4e4e4]"
                }`}
              >
                {voteDown ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="22"
                    width="22"
                    viewBox="0 0 640 640"
                  >
                    <path
                      className={`${voteDown && "fill-white"}`}
                      d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64zM308.7 451.3L204.7 347.3C200.1 342.7 198.8 335.8 201.2 329.9C203.6 324 209.5 320 216 320L272 320L272 224C272 206.3 286.3 192 304 192L336 192C353.7 192 368 206.3 368 224L368 320L424 320C430.5 320 436.3 323.9 438.8 329.9C441.3 335.9 439.9 342.8 435.3 347.3L331.3 451.3C325.1 457.5 314.9 457.5 308.7 451.3z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="22"
                    width="22"
                    viewBox="0 0 640 640"
                  >
                    <path
                      className={`${
                        voteUP && "fill-white"
                      } group-hover:fill-[#b53325]`}
                      d="M320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528zM320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64zM308.7 451.3C314.9 457.5 325.1 457.5 331.3 451.3L435.3 347.3C439.9 342.7 441.2 335.8 438.8 329.9C436.4 324 430.5 320 424 320L352 320L352 216C352 202.7 341.3 192 328 192L312 192C298.7 192 288 202.7 288 216L288 320L216 320C209.5 320 203.7 323.9 201.2 329.9C198.7 335.9 200.1 342.8 204.7 347.3L308.7 451.3z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 border border-[#bebebe] bg-[#f5f5f5] px-4 py-[7px] rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                width="20"
                viewBox="0 0 640 640"
              >
                <path
                  fill="#b53325"
                  d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z"
                />
              </svg>
              <span className="text-[14px] text-red tracking-tight Dosis-Bold">
                {post?.total_comments || 0}
              </span>
            </div>
          </div>
          <div className="w-full h-[1px] mt-10 bg-[#dbdbdb]" />
        </div>

        {/* Sección de comentarios */}
        <div className="flex flex-wrap w-full mt-5 gap-2">
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleComment();
              }
            }}
            onChange={(e) => setValueComment(e.target.value)}
            className="flex-[1] px-4 py-2 rounded-[10px] border border-[#dbdbdb] text-[16px] tracking-tight outline-[#93acd1] "
            placeholder="Escribe un comentario..."
            type="text"
          />
          <button
            type="button"
            onClick={() => handleComment()}
            className="flex-[0.2] flex items-center justify-center gap-2 rounded-[10px] bg-blue cursor-pointer text1 Dosis-Bold text-[15px] tracking-tight"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height={"20"}
              width={"20"}
              viewBox="0 0 640 640"
            >
              <path
                fill="#fff"
                d="M568.4 37.7C578.2 34.2 589 36.7 596.4 44C603.8 51.3 606.2 62.2 602.7 72L424.7 568.9C419.7 582.8 406.6 592 391.9 592C377.7 592 364.9 583.4 359.6 570.3L295.4 412.3C290.9 401.3 292.9 388.7 300.6 379.7L395.1 267.3C400.2 261.2 399.8 252.3 394.2 246.7C388.6 241.1 379.6 240.7 373.6 245.8L261.2 340.1C252.1 347.7 239.6 349.7 228.6 345.3L70.1 280.8C57 275.5 48.4 262.7 48.4 248.5C48.4 233.8 57.6 220.7 71.5 215.7L568.4 37.7z"
              />
            </svg>
            Enviar
          </button>
        </div>

        <section className="mt-5">
          <div className="flex items-center justify-start gap-4 mb-6">
            <p className="text-[14px] text4">Ordenar por:</p>
            <div
              onClick={() => {
                setOpenInput(!openInput);
              }}
              className={`relative flex items-center cursor-pointer  px-3 py-[6px] rounded-full gap-1 ${
                openInput ? "bg-gray-300" : "hover:bg-gray-200"
              }`}
            >
              <span className="text-[14px] text5 Dosis-Bold">
                {sortBy === 1
                  ? "Más votados"
                  : sortBy === 2
                  ? "Más recientes"
                  : sortBy === 3
                  ? "Más antiguos"
                  : "Más polemicos"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height={"12"}
                width={"12"}
                viewBox="0 0 640 640"
              >
                <path d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z" />
              </svg>

              {openInput && (
                <div className="absolute top-10 -left-10 min-w-[200px] flex flex-col bg-white rounded-[10px] overflow-hidden shadow-lg z-50">
                  <button
                    type="button"
                    onClick={() => {
                      handleSortChange(1);
                    }}
                    className={`text-[15px] py-3 flex items-start gap-3 px-3 text5 hover:bg-gray-200 cursor-pointer ${
                      sortBy === 1 && "bg-gray-300"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height={"20"}
                      width={"20"}
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="#4A4947"
                        d="M416 224C398.3 224 384 209.7 384 192C384 174.3 398.3 160 416 160L576 160C593.7 160 608 174.3 608 192L608 352C608 369.7 593.7 384 576 384C558.3 384 544 369.7 544 352L544 269.3L374.6 438.7C362.1 451.2 341.8 451.2 329.3 438.7L224 333.3L86.6 470.6C74.1 483.1 53.8 483.1 41.3 470.6C28.8 458.1 28.8 437.8 41.3 425.3L201.3 265.3C213.8 252.8 234.1 252.8 246.6 265.3L352 370.7L498.7 224L416 224z"
                      />
                    </svg>
                    Más votados
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSortChange(2);
                    }}
                    className={`text-[15px] py-3 flex items-start gap-3 px-3 text5 hover:bg-gray-200 cursor-pointer ${
                      sortBy === 2 && "bg-gray-300"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height={"20"}
                      width={"20"}
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="#4A4947"
                        d="M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"
                      />
                    </svg>
                    Más recientes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSortChange(3);
                    }}
                    className={`text-[15px] py-3 flex items-start gap-3 px-3 text5 hover:bg-gray-200 cursor-pointer ${
                      sortBy === 3 && "bg-gray-300"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height={"20"}
                      width={"20"}
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="#4A4947"
                        d="M302.7 69.1C313.2 62.3 326.8 62.3 337.3 69.1L561.3 213.1C573.2 220.8 578.7 235.4 574.7 249C570.7 262.6 558.2 272 544 272L512 272L512 480L563.2 518.4C571.3 524.4 576 533.9 576 544C576 561.7 561.7 576 544 576L96 576C78.3 576 64 561.7 64 544C64 533.9 68.7 524.4 76.8 518.4L128 480L128 480L128 272L96 272C81.8 272 69.3 262.6 65.3 249C61.3 235.4 66.8 220.7 78.7 213.1L302.7 69.1zM400 272L400 480L464 480L464 272L400 272zM288 480L352 480L352 272L288 272L288 480zM176 272L176 480L240 480L240 272L176 272z"
                      />
                    </svg>
                    Más antiguos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSortChange(4);
                    }}
                    className={`text-[15px] py-3 flex items-start gap-3 px-3 text5 hover:bg-gray-200 cursor-pointer ${
                      sortBy === 4 && "bg-gray-300"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height={"20"}
                      width={"20"}
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="#4A4947"
                        d="M320 64C324.6 64 329.2 65 333.4 66.9L521.8 146.8C543.8 156.1 560.2 177.8 560.1 204C559.6 303.2 518.8 484.7 346.5 567.2C329.8 575.2 310.4 575.2 293.7 567.2C121.3 484.7 80.6 303.2 80.1 204C80 177.8 96.4 156.1 118.4 146.8L306.7 66.9C310.9 65 315.4 64 320 64z"
                      />
                    </svg>
                    Más polémicos
                  </button>
                </div>
              )}
            </div>
          </div>
          {postComments?.length > 0 && loading === false ? (
            <div className="flex flex-col gap-5">
              {postComments?.map((comment) => (
                <CommentsCard
                  key={comment.id}
                  comment={comment}
                  onAddReply={handleAddReply}
                  setSortBy={setSortBy}
                />
              ))}
            </div>
          ) : (
            loading === true && <Loader />
          )}
        </section>
      </div>

      <div
        className="md:flex-[1] hidden md:block bannerBG w-full max-w-[300px] h-fit"
        style={
          {
            "--bg-image": `url('${post?.community?.theme_color}')`,
          } as React.CSSProperties
        }
      >
        <div className="px-5 py-4">
          <h1 className="Dosis-Bold text-[16px] text5">
            {post?.community?.name}
          </h1>
          <p
            onClick={() => setIsOpen(!isOpen)}
            className={`text-[15px] tracking-tight text4 leading-6 cursor-pointer ${
              isOpen ? "line-clamp-4" : "line-clamp-0"
            }`}
          >
            {post?.community?.description}
          </p>
          <div className="flex items-center gap-1 mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height={"20"}
              width={"20"}
              viewBox="0 0 640 640"
            >
              <path
                fill="#707070"
                d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z"
              />
            </svg>
            <span
              title={
                post?.community && post?.community?.created_at
                  ? formatDistanceToNow(post.community.created_at, {
                      locale: es,
                      addSuffix: true,
                    })
                  : "N/A"
              }
              className="text-[13px] text4"
            >
              {post?.community && post?.community?.created_at
                ? `Creado el ${format(
                    new Date(post.community.created_at),
                    "d MMM yyyy",
                    {
                      locale: es,
                    }
                  )}`
                : "Fecha desconocida"}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#707070"
              className="lucide lucide-globe-icon lucide-globe"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span className="capitalize text-[13px] text4">
              {post?.community?.visibility}
            </span>
          </div>

          <div className="flex flex-col items-center mt-3">
            <span className="Dosis-Bold text-[15px]">
              {post?.community?.total_members
                ? formatCompactNumber(post.community.total_members)
                : "0"}
            </span>
            <span className="text-[14px] text4">Miembros</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UComment;
