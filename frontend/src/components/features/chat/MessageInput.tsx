import Loader from "@/components/ui/feedback/Loader";
import { useRef, useState } from "react";

interface Props {
  message: string;
  setMessage: (message: string) => void;
  isPending: boolean;
  handleSubmit: () => void;
  setOpenIngredients?: () => void;
}

export default function MessageInput({
  message,
  setMessage,
  isPending,
  handleSubmit,
  setOpenIngredients,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="flex flex-col gap-y-2">
      {isPending && (
        <div className="items-center justify-start flex-row gap-x-4">
          <Loader size={18} color="#e5a657" />
          <span className="text-text-5 font-normal text-[14px]">
            Pensando...
          </span>
        </div>
      )}
      <div
        onClick={() => {
          inputRef.current?.focus();
        }}
        className={`flex flex-row items-center gap-x-2 px-4 py-1 shadow-sm border rounded-full ${isFocused ? "border-gray-400" : "border-gray-200"}`}
      >
        <button
          title="Agregar ingrediente"
          onClick={setOpenIngredients}
          className="rounded-full p-1.5 hover:bg-gray-100 cursor-pointer duration-200 transition-all"
        >
          <svg viewBox="0 0 640 640" width={20} height={20}>
            <path
              fill="#2F2F2F"
              d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"
            />
          </svg>
        </button>
        <input
          ref={inputRef}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          className="flex-1 placeholder:text-[#2F2F2F] outline-none py-2.5"
          required
          spellCheck
          maxLength={500}
          value={message}
          placeholder="¿Qué quieres cocinar hoy?"
          onChange={(e) => setMessage(e.target.value)}
          type="text"
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="rounded-full cursor-pointer p-2 flex items-center justify-center disabled:cursor-not-allowed bg-bg-semi-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            width={18}
            height={18}
            fill="#fff"
          >
            <path d="M322.5 351.7L523.4 150.9L391 520.3L322.5 351.7zM489.4 117L288.6 317.8L120 249.3L489.4 117zM70.1 280.8L275.9 364.4L359.5 570.2C364.8 583.3 377.6 591.9 391.8 591.9C406.5 591.9 419.6 582.7 424.6 568.8L602.6 72C606.1 62.2 603.6 51.4 596.3 44C589 36.6 578.1 34.2 568.3 37.7L71.4 215.7C57.5 220.7 48.3 233.8 48.3 248.5C48.3 262.7 56.9 275.5 70 280.8z" />
          </svg>
        </button>
      </div>
    </section>
  );
}
