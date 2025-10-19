import React, { useState } from "react";
import { MessageCircle, MoreHorizontal } from "lucide-react";

import type { Comment } from "../../../interface/global";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { createVote } from "../../../services/vote.api";
import { createComment } from "../../../services/post.api";

import { CircleMinus, CirclePlus } from "lucide-react";

interface CommentsCardProps {
  comment: Comment;
  depth?: number;
  onAddReply: (parentId: string, newReply: Comment) => void;
  setSortBy: (sortBy: number) => void;
  parentCommentId?: string;
}

const CommentsCard: React.FC<CommentsCardProps> = ({
  comment,
  depth = 0,
  onAddReply,
  setSortBy,
  parentCommentId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [totalLikes, setTotalLikes] = useState(
    comment.votes_up - comment.votes_down || 0
  );
  const hasVoted = comment?.userVote !== null && comment?.userVote === "up";
  const hasVotedDown =
    comment?.userVote !== null && comment?.userVote === "down";

  const [voteUP, setVoteUP] = useState(hasVoted);
  const [voteDown, setVoteDown] = useState(hasVotedDown);

  const [openInput, setOpenInput] = useState(false);
  const [value, setValue] = useState("");

  // Determinar si este comentario responde directamente al comentario raíz
  const isDirectReplyToRoot =
    parentCommentId && comment.parent_comment_id === parentCommentId;

  // Aplicar margen solo si NO es respuesta directa al raíz
  const shouldIndent = depth > 0 && !isDirectReplyToRoot;

  const handleVote = async (e: React.MouseEvent, type: boolean) => {
    e.stopPropagation();
    const voteType = type ? "up" : "down";

    const response = await createVote(
      voteType,
      comment?.id as string,
      "comment"
    );

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

  const handleComment = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!value) return;
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const response = await createComment(
      comment?.post_id,
      trimmedValue,
      comment?.id
    );

    if (response?.data && response?.success) {
      const newReply = response.data as Comment;

      // Llamar a la función del padre para actualizar el estado
      onAddReply(comment.id, newReply);

      setValue("");
      setOpenInput(false);
    }
  };

  {console.log("Depth:", depth, "Parent ID:", parentCommentId, "Comment ID:", comment.id, "isCollapsed:", isCollapsed);}



  return (
    <div className={`${shouldIndent || depth === 1 ? "ml-4 pl-4" : ""}`}>
      <div className="pt-2 flex gap-3">
        {/* Header */}
        <div className={`flex flex-col  items-center gap-2 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {comment?.user?.avatar_url ? (
            <img
              src={comment.user?.avatar_url}
              alt={comment.user?.name}
              className={`w-8 h-8 rounded-full ${isCollapsed ? "hidden" : ""}`}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {comment?.user?.name.charAt(0).toUpperCase()}
            </div>
          )}

         <div className="w-[1px] flex-1 bg-gray-300" />
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="cursor-pointer"
          >
            {isCollapsed && depth != 0 || isCollapsed && comment?.replies?.length !== 0 ? (
              <CirclePlus
                size={18}
                className="text-[#878787] hover:text-gray-900!"
              />
            ) : !isCollapsed && depth != 0 || !isCollapsed && comment?.replies?.length !== 0 ? (
              <CircleMinus
                size={18}
                className="text-[#878787] hover:text-gray-900!"
              />
            ) : null}
          </button>
        </div>

        
        <div className={`flex flex-col ${isCollapsed ? "justify-end" : "items-start"} `}>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px] text-gray-900">
              {comment?.user?.name}
            </span>

            <span className="w-1 h-1 bg-gray-500 rounded-full" />

            <span className="text-[13px] text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), {
                locale: es,
                addSuffix: true,
              })}
            </span>

            {comment.edited && (
              <span className="text-xs text-gray-400 italic">(editado)</span>
            )}
          </div>

          {!isCollapsed && (
            <>
              {/* Content */}
              <div className="mt-1">
                <p className="text-[15px] text5 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 mt-2">
                <div className="flex items-center gap-1">
                  <button
                    title="Me gusta"
                    type="button"
                    onClick={(e) => handleVote(e, true)}
                    className={`rounded-full hover:bg-gray-200 cursor-pointer`}
                  >
                    {voteUP ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="22"
                        width="22"
                        viewBox="0 0 640 640"
                      >
                        <path
                          className={`${voteUP && "fill-[#e5a657]"}`}
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
                          className={`group-hover:fill-[#e5a657] fill-[#707070]`}
                          d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM331.3 188.7C325.1 182.5 314.9 182.5 308.7 188.7L204.7 292.7C200.1 297.3 198.8 304.2 201.2 310.1C203.6 316 209.5 320 216 320L288 320L288 424C288 437.3 298.7 448 312 448L328 448C341.3 448 352 437.3 352 424L352 320L424 320C430.5 320 436.3 316.1 438.8 310.1C441.3 304.1 439.9 297.2 435.3 292.7L331.3 188.7z"
                        />
                      </svg>
                    )}
                  </button>

                  <span className={`text-[14px] Dosis-Bold text5 px-1`}>
                    {totalLikes}
                  </span>

                  <button
                    title="No me gusta"
                    type="button"
                    onClick={(e) => handleVote(e, false)}
                    className={`rounded-full hover:bg-gray-200 cursor-pointer`}
                  >
                    {voteDown ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="22"
                        width="22"
                        viewBox="0 0 640 640"
                      >
                        <path
                          className={`${voteDown && "fill-[#b53325]"}`}
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
                          className={`group-hover:fill-[#b53325] fill-[#707070]`}
                          d="M320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528zM320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64zM308.7 451.3C314.9 457.5 325.1 457.5 331.3 451.3L435.3 347.3C439.9 342.7 441.2 335.8 438.8 329.9C436.4 324 430.5 320 424 320L352 320L352 216C352 202.7 341.3 192 328 192L312 192C298.7 192 288 202.7 288 216L288 320L216 320C209.5 320 203.7 323.9 201.2 329.9C198.7 335.9 200.1 342.8 204.7 347.3L308.7 451.3z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  title="Responder"
                  type="button"
                  onClick={() => setOpenInput(true)}
                  className="flex cursor-pointer items-center gap-1 px-4 py-1 rounded-[20px] hover:bg-gray-200 text4 text-[13px] Dosis-Bold"
                >
                  <MessageCircle size={18} />
                  Responder
                </button>

                <button
                  type="button"
                  title="Opciones"
                  className="p-1 rounded-[20px] hover:bg-gray-200 text5"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Input */}
              {openInput && (
                <div className="mt-3 ml-8">
                  <div className="border border-gray-300 bg-white rounded-[20px] overflow-hidden px-2 focus-within:border-gray-500 transition-colors">
                    <textarea
                      placeholder="Escribe tu comentario"
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full p-3 border-none outline-none text4 resize-y!"
                      rows={1}
                    />

                    <div className="flex items-center justify-end py-2 bg-white">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOpenInput(false)}
                          className="px-4 cursor-pointer py-1.5 text-[14px] Dosis-Bold text-gray-700 bg-gray hover:bg-gray-300! rounded-full transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleComment(e)}
                          className="px-4 cursor-pointer py-1.5 text-[14px] Dosis-Bold text-white bg-blue hover:bg-blue-900! rounded-full transition-colors"
                        >
                          Comentar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3">
                  {comment.replies.map((reply) => (
                    <CommentsCard
                      key={reply.id}
                      setSortBy={setSortBy}
                      comment={reply}
                      depth={depth + 1}
                      onAddReply={onAddReply}
                      parentCommentId={parentCommentId || comment.id} // Pasar el ID raíz
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsCard;
