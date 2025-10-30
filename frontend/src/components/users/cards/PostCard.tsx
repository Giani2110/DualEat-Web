import React, { useState } from "react";
import type { Posts } from "@interface/global";
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { createVote } from "@services/vote.api";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
} from "lucide-react";
import toast from "react-hot-toast";

interface PostCardProps {
  Post: Posts;
  isDashboard?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ Post, isDashboard }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [totalLikes, setTotalLikes] = useState(
    Post.votes_up - Post.votes_down || 0
  );

  const hasVoted = Post.hasVoted === true && Post.userVote === "up";
  const hasVotedDown = Post.hasVoted === true && Post.userVote === "down";

  const [imgIndex, setImgIndex] = useState(0);

  const handleNextImage = () => {
    if (imgIndex < Post.image_urls.length - 1) {
      setImgIndex((prevIndex) => (prevIndex + 1) % Post.image_urls.length);
    }
  };

  const handlePrevImage = () => {
    if (imgIndex > 0) {
      setImgIndex(
        (prevIndex) =>
          (prevIndex - 1 + Post.image_urls.length) % Post.image_urls.length
      );
    }
  };

  const handleSelectCommunity = (e: React.MouseEvent, communitySlug: string) => {
    e.stopPropagation();
    navigate(`/c/${communitySlug}/`, {
      state: { communitySlug },
    });
  };

  const [voteUP, setVoteUP] = useState(hasVoted);
  const [voteDown, setVoteDown] = useState(hasVotedDown);

  const handleNavigate = (e: React.MouseEvent, Post: Posts, post: boolean) => {
    e.stopPropagation();
    if (post) {
      navigate(`/c/${Post.community.slug}/post/${Post.user.slug}/${Post.slug}`);
    } else {
      navigate(
        `/c/${Post.community.slug}/recipe/${Post.user.slug}/${Post.recipe.slug}`
      );
    }
  };

  const handleVote = async (e: React.MouseEvent, type: boolean) => {
    e.stopPropagation();
    const voteType = type ? "up" : "down";

    const response = await createVote(voteType, Post.id, "post");

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

  return (
    <>
      <div
        onClick={(e) => handleNavigate(e, Post, true)}
        className={`flex gap-3 w-full min-h-[110px] cursor-pointer rounded-[8px] border border-[#dddddd]/50 p-3 hover:bg-[#dddddd28] transition-colors duration-200 ${
          isDashboard ? "bg-white/40" : "bg-white/40"
        }`}
      >
        <div>
          {isDashboard ? (
            <img
              src={
                Post.community?.image_url ||
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
              }
              alt="Imagen de perfil"
              className="w-6 h-6 max-w-6 max-h-6 rounded-full object-cover"
            />
          ) : (
            <img
              src={
                Post.user?.avatar_url ||
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
              }
              alt="Imagen de perfil"
              className="w-8 h-8 max-w-8 max-h-8 rounded-full"
            />
          )}
        </div>
        <div className="flex flex-col w-full min-w-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {isDashboard ? (
                <h1 
                onClick={(e) => handleSelectCommunity(e, Post.community.slug)}
                className="text5 text-[13.5px] Dosis-Bold hover:text-[#1d51a3]!">
                  {Post.community?.name}
                </h1>
              ) : (
                <h1 className="text5 text-[14px] Dosis-Bold">
                  {Post.user?.name}
                </h1>
              )}

              <span className="h-1 w-1 bg-gray-500 rounded-full" />
              <small className="text-[12px] text4">
                {formatDistanceToNow(new Date(Post.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </small>
            </div>
            {Post.user?.id === user?.id && (
              <button
                title="Editar"
                type="button"
                className="cursor-pointer hover:bg-[#dbdbdb] rounded-full p-1"
              >
                <Ellipsis size={18} color="#4A4947" />
              </button>
            )}
          </div>

          <div className="mt-1">
            <h2 className="text-[18px] Dosis-Bold">{Post.title}</h2>

            {Post.image_urls.length > 0 ? (
              <a
                href={Post.image_urls[imgIndex]}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                rel="noopener noreferrer"
                className="block aspect-[6/3] mt-3 overflow-hidden rounded-[15px] relative"
              >
                {Post.image_urls.length > 0 && (
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
              <p className="text5 text-[15px] mt-1 tracking-tight line-clamp-[8]">
                {Post.content}
              </p>
            )}
            {Post.recipe && (
              <div
                onClick={(e) => handleNavigate(e, Post, false)}
                className="bg-[#ffffff69] flex-wrap flex flex-col sm:flex-row mt-5 px-3 sm:items-center gap-2 py-1 w-fit rounded-lg border border-[#dbdbdb] text5 text-[15px] tracking-tight hover:scale-101 hover:shadow-sm transition duration-100"
              >
                <img
                  src={Post.recipe.main_image || ""}
                  className="w-[30px] h-[30px] object-cover rounded-full border border-gray-300"
                  alt="Imagen de la receta"
                />
                <p className="Dosis-Bold border-b sm:border-b-0 sm:border-r border-[#8d8d8d] pe-2">
                  {Post.recipe.name}
                </p>
                <p className="border-b sm:border-b-0 sm:border-r border-[#8d8d8d] pe-2">
                  {Post.recipe.total_time} min
                </p>
                <p className="border-b sm:border-b-0 sm:border-r border-[#8d8d8d] pe-2">
                  {Post.recipe._count.ingredients} ingredientes
                </p>
                <p>{Post.recipe._count.steps} pasos</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-start mt-5 gap-3 w-full">
            <div
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center w-fit border border-[#bebebe]/50 gap-1 p-[2px] rounded-full ${
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
                className={`cursor-pointer group p-0.5  rounded-full ${
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
                      } group-hover:fill-[#e5a657] fill-[#707070]`}
                      d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM331.3 188.7C325.1 182.5 314.9 182.5 308.7 188.7L204.7 292.7C200.1 297.3 198.8 304.2 201.2 310.1C203.6 316 209.5 320 216 320L288 320L288 424C288 437.3 298.7 448 312 448L328 448C341.3 448 352 437.3 352 424L352 320L424 320C430.5 320 436.3 316.1 438.8 310.1C441.3 304.1 439.9 297.2 435.3 292.7L331.3 188.7z"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`Dosis-Bold text-[15px] ${
                  voteUP || voteDown ? "text-white" : "text4"
                }`}
              >
                {totalLikes}
              </span>
              <button
                type="button"
                title="No me gusta"
                onClick={(e) => handleVote(e, false)}
                className={`cursor-pointer group p-0.5 rounded-full ${
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
                      } group-hover:fill-[#b53325] fill-[#707070]`}
                      d="M320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528zM320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64zM308.7 451.3C314.9 457.5 325.1 457.5 331.3 451.3L435.3 347.3C439.9 342.7 441.2 335.8 438.8 329.9C436.4 324 430.5 320 424 320L352 320L352 216C352 202.7 341.3 192 328 192L312 192C298.7 192 288 202.7 288 216L288 320L216 320C209.5 320 203.7 323.9 201.2 329.9C198.7 335.9 200.1 342.8 204.7 347.3L308.7 451.3z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 border border-[#bebebe]/50 bg-[#f5f5f5] py-1 px-2.5 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                width="20"
                viewBox="0 0 640 640"
              >
                <path
                  fill="#707070"
                  d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z"
                />
              </svg>
              <span className="text-[14px] text4 tracking-tight Dosis-Bold">
                {Post.total_comments || 0}
              </span>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                const link = `${window.location.origin}/c/${Post.community.slug}/post/${Post.user.slug}/${Post.slug}`;
                navigator.clipboard
                  .writeText(link)
                  .then(() => {
                    toast.success("Enlace copiado al portapapeles");
                  })
                  .catch((err) => {
                    console.error("Error al copiar el enlace:", err);
                  });
              }}
              className="flex items-center gap-2 border text4 border-[#bebebe]/50 bg-[#f5f5f5] py-1 px-2.5 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-share2-icon lucide-share-2"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
              </svg>
              <span className="text-[14px] text4 tracking-tight Dosis-Bold">
                Compartir
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostCard;
