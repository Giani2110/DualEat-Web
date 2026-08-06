import { useDeleteComment, useReplies } from "@/hooks/api/post/usePost";
import type { PostComment, User } from "@/interface/global";
import { getShortTimeAgo } from "@/utils/date";
import { Ellipsis, PencilLine, Trash } from "lucide-react";
import { memo, useMemo, useState } from "react";

type Comment = Partial<PostComment>;

interface CommentItemProps {
  item: PostComment;
  setComment: React.Dispatch<React.SetStateAction<Comment>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isOwner: boolean;
  user: User;
}

export function CommentItem({
  item,
  setComment,
  isOwner,
  user,
  inputRef,
}: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFather = item.parent_comment_id === null;

  const { mutate: deleteComment } = useDeleteComment();

  const [open, setOpen] = useState(false);

  const {
    data: repliesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useReplies(item.id, isExpanded);

  const fetchedRepliesCount = useMemo(() => {
    if (!repliesData) return 0;
    return repliesData.pages.reduce(
      (total, page) => total + (page.data?.length || 0),
      0,
    );
  }, [repliesData]);

  const remainingReplies = item._count?.replies
    ? item._count.replies - fetchedRepliesCount
    : 0;

  const replies = useMemo(() => {
    return (
      repliesData?.pages
        .flatMap((page) => page?.data || [])
        .filter((comment): comment is PostComment => Boolean(comment)) || []
    );
  }, [repliesData]);

  return (
    <section
      style={{ paddingLeft: isFather ? 0 : 30, marginTop: isFather ? 0 : 16 }}
      className="w-full"
    >
      <div className="flex flex-row gap-x-4">
        <img
          src={
            item.user?.avatar_url ||
            "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
          }
          className={`rounded-full object-cover ${isFather ? "w-8 h-8" : "w-7 h-7"}`}
          alt="Imagen de perfil"
        />

        <div className="flex flex-col gap-y-0.5 flex-1">
          <div className="flex flex-row items-center gap-x-2">
            <p className="font-bold text-text-3 text-sm">{item.user?.name}</p>
            <p className="text-sm text-text-4">
              {getShortTimeAgo(item.created_at)}
            </p>
            {item.edited && <p className="text-xs text-text-4">• (Editado)</p>}
          </div>

          <p className="text-sm text-text-5">
            {item.reply_to_user_id ? (
              <>
                <span className="text-sm text-text-3 font-bold leading-5">
                  @{item.reply_to_user?.name}{" "}
                </span>
                {item.content}
              </>
            ) : (
              item.content
            )}
          </p>

          <button
            onClick={() => {
              setComment({
                post_id: item.post_id,
                parent_comment_id: item.parent_comment_id || item.id,
                reply_to_user_id: item.user_id,
                reply_to_user: item.user,
                content: "",
              });
            }}
            className="w-full text-start cursor-pointer"
          >
            <span className="text-[13px] font-semibold text-text-5">
              Responder
            </span>
          </button>
        </div>

        {(isOwner || user.id === item.user_id) && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              className="cursor-pointer hover:bg-gray-100 rounded-full h-fit p-1"
            >
              <Ellipsis className="rotate-90" size={16} color="#2F2F2F" />
            </button>

            {open && (
              <div className="absolute z-10 right-0 -bottom-10 px-2 bg-white border min-w-[400px] border-gray-200 rounded-lg shadow-lg">
                <button
                  onClick={() => deleteComment({ comment_id: item.id })}
                  className="flex flex-row items-center gap-x-2 py-2 cursor-pointer"
                >
                  <Trash size={14} color="#2F2F2F" />
                  <p className="font-outfit-light text-text-5 text-sm">
                    Eliminar
                  </p>
                </button>

                {user.subscription_status === "ACTIVE" && (
                  <button
                    onClick={() => {
                      setComment({
                        id: item.id,
                        post_id: item.post_id,
                        parent_comment_id: item.parent_comment_id,
                        reply_to_user_id: null,
                        reply_to_user: null,
                        content: item.content,
                      });

                      inputRef.current?.focus();
                    }}
                    className="flex flex-row items-center gap-x-2 py-2 cursor-pointer"
                  >
                    <PencilLine size={14} color="#2F2F2F" />
                    <p className="font-outfit-light text-text-5 text-sm">
                      Actualizar
                    </p>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isExpanded && replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <MemoizedCommentItem
              key={reply.id}
              item={reply}
              setComment={setComment}
              isOwner={isOwner}
              user={user}
              inputRef={inputRef}
            />
          ))}
        </div>
      )}

      {item._count?.replies && item._count.replies > 0 ? (
        <button
          onClick={() => {
            if (!isExpanded) {
              setIsExpanded(true);
            } else if (hasNextPage) {
              fetchNextPage();
            } else {
              setIsExpanded(false);
            }
          }}
          disabled={isFetchingNextPage}
          style={{ paddingLeft: 40, marginTop: 10 }}
          className="flex flex-row cursor-pointer gap-x-2 items-center"
        >
          <p className="text-sm text-text-5">
            {isFetchingNextPage
              ? "Cargando..."
              : isExpanded
                ? !hasNextPage
                  ? "Ocultar respuestas"
                  : `Ver más respuestas (${remainingReplies})`
                : `Ver respuestas (${item._count.replies})`}
          </p>
        </button>
      ) : null}
    </section>
  );
}

const MemoizedCommentItem = memo(CommentItem);
