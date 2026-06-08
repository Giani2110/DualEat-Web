import { useReplies } from "@/hooks/api/post/usePost";
import type { PostComment } from "@/interface/global";
import { getShortTimeAgo } from "@/utils/date";
import { useMemo, useState } from "react";

type Comment = Pick<
  PostComment,
  | "post_id"
  | "parent_comment_id"
  | "reply_to_user_id"
  | "reply_to_user"
  | "content"
>;

interface CommentItemProps {
  item: PostComment;
  setComment: React.Dispatch<React.SetStateAction<Comment>>;
}

export function CommentItem({ item, setComment }: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFather = item.parent_comment_id === null;

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
      <div className="flex flex-row gap-x-3">
        <img
          src={
            item.user?.avatar_url ||
            "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
          }
          className={`rounded-full object-cover z-10 ${isFather ? "w-8 h-8" : "w-7 h-7"}`}
          alt="Imagen de perfil"
        />

        <div className="flex flex-col gap-y-0.5 flex-1">
          <div className="flex flex-row items-center gap-x-2">
            <p className="font-bold text-text-3 text-sm">{item.user?.name}</p>
            <p className="text-sm text-text-6">
              {getShortTimeAgo(item.created_at)}
            </p>
          </div>

          <p className="text-sm text-text-5">
            {item.reply_to_user_id ? (
              <p>
                <p className="text-sm text-text-3 font-bold leading-5">
                  {item.reply_to_user?.name}{" "}
                </p>
                {item.content}
              </p>
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
      </div>

      {isExpanded && replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentItem key={reply.id} item={reply} setComment={setComment} />
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
