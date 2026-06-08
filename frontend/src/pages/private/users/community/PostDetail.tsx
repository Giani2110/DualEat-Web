import { CommentItem } from "@/components/features/post/CommentItem";
import PostCard from "@/components/features/post/PostCard";
import Loader from "@/components/ui/feedback/Loader";
import { useComment, usePostById } from "@/hooks/api/post/usePost";
import { useAuth } from "@/hooks/useAuth";
import type { PostComment } from "@/interface/global";
import { ArrowLeft, ChartBarIcon, Clock, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate, useParams } from "react-router-dom";

type Comment = Pick<
  PostComment,
  | "post_id"
  | "parent_comment_id"
  | "reply_to_user_id"
  | "reply_to_user"
  | "content"
>;

export default function PostDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { post_id } = useParams<{ post_id: string }>();

  const { ref, inView } = useInView({
    rootMargin: "200px",
  });

  const { data: post, isError, isLoading } = usePostById(post_id as string);

  const [comment, setComment] = useState<Comment>({
    post_id: post?.id as string,
    parent_comment_id: null,
    reply_to_user_id: null,
    reply_to_user: null,
    content: "",
  });

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useComment(post_id as string);

  const comments = useMemo(() => {
    return (
      commentsData?.pages
        .flatMap((page) => page?.data || [])
        .filter((comment): comment is PostComment => Boolean(comment)) || []
    );
  }, [commentsData]);

  console.log("COMENTATIOS", commentsData);

  useEffect(() => {
    if (post) {
      navigate(`/c/${post.community.slug}/p/${post.id}/${post.slug}`, {
        replace: true,
      });
    }
  }, [post]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const recipeStats = [
    {
      id: "time",
      icon: <Clock size={16} color="#707070" />,
      text: `${post?.recipe?.total_time ?? 0}min`,
    },
    {
      id: "ingredients",
      icon: <ShoppingCart size={16} color="#707070" />,
      text: `${post?.recipe?.ingredients?.length ?? 0} ingredientes`,
    },
    {
      id: "steps",
      icon: <ChartBarIcon size={16} color="#707070" />,
      text: `${post?.recipe?.steps?.length ?? 0} pasos`,
    },
  ];

  return (
    <main className="h-full px-8 mx-auto flex flex-wrap flex-row gap-8 my-5">
      <section
        style={{ flex: 2 }}
        className="flex flex-row flex-wrap lg:flex-nowrap gap-4"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          title="Volver atrás"
          style={{ flexShrink: 0 }}
          className="bg-bg-gray rounded-full w-8 h-8 flex items-center justify-center border border-[#f5f5f5] cursor-pointer transition-all duration-300 ease-in-out group hover:bg-bg-red"
        >
          <ArrowLeft
            size={20}
            className="text-[#707070] transition-colors duration-300 group-hover:text-white"
          />
        </button>

        {post && (
          <div className="flex flex-col gap-y-8">
            <div>
              <PostCard post={post} type="POST" />
            </div>

            {/** INPUT MESSAGE */}
            <div className="flex flex-row items-center border border-gray-200 rounded-full px-3 py-1 gap-x-1">
              <img
                src={
                  user?.avatar_url ||
                  "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
                }
                className="rounded-full w-8 h-8"
                alt="Avatar"
              />

              <input
                placeholder={
                  comment.reply_to_user
                    ? `@${comment.reply_to_user?.name}`
                    : "Añade un comentario..."
                }
                value={comment?.content}
                onChange={(e) => {
                  setComment({ ...comment, content: e.target.value });
                }}
                className="text-text-5 rounded-full outline-none p-2"
                style={{
                  fontSize: 14,
                  flex: 1,
                }}
              />

              <button
                // onClick={handleAddComment}
                disabled={!comment?.content?.trim()}
                className="rounded-full px-3 py-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-bg-semi-black"
              >
                <span className="text-[14px] text-center text-text-1 font-bold">
                  Responder
                </span>
              </button>
            </div>

            {/* COMMENTS */}
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                item={comment}
                setComment={setComment}
              />
            ))}
          </div>
        )}
      </section>

      <section className="hidden lg:flex" style={{ flex: 1 }}>
        {post?.recipe && (
          <aside className="flex flex-col gap-y-2">
            <h1 className="text-[20px] font-bold text-text-3 tracking-tight">
              {post.recipe.name}
            </h1>
            {post.recipe.main_image && (
              <a
                href={post.recipe.main_image}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-auto h-auto aspect-[6/3] lg:aspect-[6/2] overflow-hidden rounded-[10px] relative"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-30"
                  style={{
                    backgroundImage: `url(${post.recipe.main_image})`,
                  }}
                />

                <img
                  className="w-full h-full object-contain cursor-pointer relative z-10"
                  alt="Imagen del post"
                  src={post.recipe.main_image}
                />
              </a>
            )}
            <p className="text-text-5 text-[15px] line-clamp-2 tracking-tight">
              {post.recipe.description}
            </p>

            <div className="flex flex-row items-center justify-center gap-x-6 py-1 border-y border-[#dbdbdb]">
              {recipeStats.map((stat, index) => (
                <div key={stat.id} className="flex items-center gap-x-4">
                  {stat.icon}
                  <span className="font-normal text-[14px] text-text-4">
                    {stat.text}
                  </span>
                  {index !== recipeStats.length - 1 && (
                    <span className="text-[18px]">•</span>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
      </section>
      {/* Sentinel */}
      <div
        ref={ref}
        className="w-full flex items-center py-4 gap-3 justify-center"
        aria-hidden="true"
      >
        {isFetchingNextPage && <Loader color="#e5a657" size={18} />}
      </div>
    </main>
  );
}

{
  /*
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
            */
}
