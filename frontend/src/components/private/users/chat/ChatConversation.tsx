import React, { useEffect, useRef, useState } from "react";
import type { ChatSessionData, User } from "@/interface/global";

import LogoIA from "@assets/images/icon/DualIA.avif";

type ChatConversationProps = {
  conversation: ChatSessionData[] | null;
  user: User;
};

const ChatConversation: React.FC<ChatConversationProps> = ({
  conversation,
  user,
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const parseBoldText = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, i) => {
      const safePart = part ?? ""; // asegura que no sea undefined

      if (safePart.startsWith("**") && safePart.endsWith("**")) {
        return <strong key={i}>{safePart.slice(2, -2)}</strong>;
      }
      return <span key={i}>{safePart}</span>;
    });
  };

  useEffect(() => {
    const container = endRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation]);

  return (
    <div
      ref={endRef}
      className="w-full pe-3 max-h-[80vh] pb-3 scroll2 h-full overflow-y-auto mt-8 flex flex-col gap-4"
    >
      {(Array.isArray(conversation) ? conversation : []).map((msg, index) => {
        const isExpanded = expandedIndex === index;
        return (
          <div
            className={`flex ${
              msg.role === "USER" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex flex-start max-w-[60%] gap-2 ${
                msg.role === "USER" ? "" : "flex-row-reverse"
              }`}
            >
              <div
                key={index}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className={`p-2 rounded-lg shadow text5 cursor-pointer text-[15px] border-1 bg-[#ffffffcc] ${
                  msg.role === "USER"
                    ? "border-[#4A4947] text-right"
                    : "border-[#dbdbdb] text-left"
                }
                      ${isExpanded ? "line-clamp-none" : "line-clamp-3"}
                      `}
              >
                {parseBoldText(msg.text)}
              </div>
              <img
                src={
                  msg.role === "USER"
                    ? user?.avatar_url ||
                      "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
                    : LogoIA
                }
                alt="Imagen del usuario"
                className="max-w-7 max-h-7 rounded-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatConversation;
