import { CommentItem } from "@/components/features/post/CommentItem";
import PostCard from "@/components/features/post/PostCard";
import Loader from "@/components/ui/feedback/Loader";
import {
  useComment,
  useCreateComment,
  usePostById,
  useUpdateComment,
} from "@/hooks/api/post/usePost";
import { useAuth } from "@/hooks/useAuth";
import type { PostComment } from "@/interface/global";
import type { PostCommentDTO } from "@/interface/global.dto";
import { ArrowLeft, ChartBarIcon, Clock, ShoppingCart, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { useNavigate, useParams } from "react-router-dom";

type Comment = Partial<PostComment>;

const MemoizedCommentItem = React.memo(CommentItem);

export default function PostDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { post_id } = useParams<{ post_id: string }>();

  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: createComment, isPending: isPendingCreateComment } =
    useCreateComment(user!);

  const { mutate: updateComment, isPending: isPendingUpdateComment } =
    useUpdateComment();

  const { ref, inView } = useInView({
    rootMargin: "200px",
  });

  const { data: post, isLoading } = usePostById(post_id as string);

  const [comment, setComment] = useState<Comment>({
    id: undefined,
    post_id: post?.id,
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

  useEffect(() => {
    if (post) {
      navigate(`/p/${post.id}/${post.slug}`, {
        replace: true,
      });
    } else if (!post && !isLoading) {
      toast.error("El post no existe");
      navigate(-1);
    }
  }, [post]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  console.log("COMENTARIO", comment);

  const handleAddComment = async () => {
    if (comment.content?.trim() === "") return;

    if (!user) {
      toast.error("Usuario no autenticado");
      return;
    }

    if (comment.id !== undefined) {
      updateComment(
        {
          comment_id: comment.id,
          content: comment.content as string,
        },
        {
          onSuccess: (data) => {
            toast.success(
              data.message || "Comentario actualizado exitosamente",
            );
            setComment({
              id: undefined,
              post_id: post?.id,
              parent_comment_id: null,
              reply_to_user_id: null,
              reply_to_user: null,
              content: "",
            });
          },
          onError: (err: any) => {
            toast.error(err?.message || "Error al actualizar el comentario");
          },
        },
      );
    } else {
      const dto: PostCommentDTO = {
        post_id: post?.id as string,
        parent_comment_id: comment.parent_comment_id || null,
        reply_to_user_id: comment.reply_to_user_id || null,
        content: comment.content as string,
      };

      createComment(
        {
          variables: dto,
          reply_to_user: comment.reply_to_user || null,
        },
        {
          onSuccess: (data) => {
            toast.success(data.message || "Comentario añadido exitosamente");
            setComment({
              id: undefined,
              post_id: post?.id,
              parent_comment_id: null,
              reply_to_user_id: null,
              reply_to_user: null,
              content: "",
            });
          },
          onError: (e: any) => {
            toast.error(e?.message || "Error al agregar el comentario");
          },
        },
      );
    }
  };

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

  const isPending = isPendingCreateComment || isPendingUpdateComment;

  const isOwner = useMemo(() => {
    if (!user || !post) return false;
    return user.id === post.user_id;
  }, [user, post]);

  return (
    <main className="h-full px-2 md:px-8 mx-auto flex flex-wrap flex-row gap-8 my-5">
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
          <div className="flex w-full flex-col gap-y-8">
            <div>
              <PostCard post={post} type="POST" />
            </div>

            {/** INPUT MESSAGE */}
            <div className="flex flex-col gap-y-3">
              {comment.reply_to_user && (
                <div className="flex flex-row items-center gap-2 justify-between">
                  <span className="text-text-5 text-sm">
                    Respondiendo a @
                    {comment.reply_to_user ? comment.reply_to_user?.name : ""}
                  </span>

                  <button
                    type="button"
                    className="p-1 rounded-full cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setComment({
                        post_id: post.id,
                        parent_comment_id: null,
                        reply_to_user_id: null,
                        reply_to_user: null,
                        content: "",
                      });
                    }}
                  >
                    <X size={16} color="#2F2F2F" />
                  </button>
                </div>
              )}
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center border border-gray-200 rounded-[5px] md:rounded-full px-3 py-1 gap-2.5">
                <div className="flex flex-row items-center justify-start w-full gap-x-2">
                  <img
                    src={
                      user?.avatar_url ||
                      "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
                    }
                    className="rounded-full w-8 h-8"
                    alt="Avatar"
                  />

                  <input
                    ref={inputRef}
                    placeholder={
                      comment.reply_to_user
                        ? `@${comment.reply_to_user?.name}`
                        : "Añade un comentario..."
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment();
                      }
                    }}
                    value={comment?.content}
                    onChange={(e) => {
                      setComment({ ...comment, content: e.target.value });
                    }}
                    className="text-text-5 rounded-full outline-none p-2"
                    style={{
                      fontSize: 14,
                      flex: 1,
                      flexGrow: 1,
                    }}
                  />
                </div>

                <button
                  onClick={() => handleAddComment()}
                  disabled={isPending || !comment?.content?.trim()}
                  className="rounded-full px-3 py-1 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-bg-semi-black"
                >
                  {isPending && <Loader size={16} color="#fff" />}
                  <span className="text-sm text-center text-text-1 font-medium">
                    {isPending ? "Enviando..." : "Responder"}
                  </span>
                </button>
              </div>
            </div>

            {/* COMMENTS */}
            {comments.map((comment) => (
              <MemoizedCommentItem
                key={comment.id}
                item={comment}
                setComment={setComment}
                user={user!}
                isOwner={isOwner}
                inputRef={inputRef}
              />
            ))}

            {/* Sentinel */}
            <div
              ref={ref}
              className="w-full flex items-center py-4 gap-3 justify-center"
              aria-hidden="true"
            >
              {(isFetchingNextPage || isFetching) && (
                <Loader color="#e5a657" size={18} />
              )}
            </div>
          </div>
        )}
      </section>

      {post?.recipe && (
        <section className="hidden lg:block" style={{ flex: 1 }}>
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
        </section>
      )}
    </main>
  );
}
