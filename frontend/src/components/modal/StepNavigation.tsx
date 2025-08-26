export const StepDots = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className={`w-[6px] h-[6px] rounded-full ${
          step === i ? "bg-[#e5a657]" : "bg-[#C4C4C4]"
        }`}
      />
    ))}
  </div>
);

export const StepButtons = ({
  onPrev,
  onNext,
  step,
}: {
  onPrev: () => void;
  onNext: () => void;
  step: number;
}) => (
  <div className="flex gap-3">
    <button
      onClick={onPrev}
      type="button"
      className="text-[13px] text3 tracking-tight bg-gray px-5 py-2 rounded-[40px] cursor-pointer"
    >
      {step === 1 ? "Cerrar" : "Volver"}
    </button>
    <button
      onClick={onNext}
      type="button"
      className="text-[13px] text1 tracking-tight bg-yellow px-5 py-2 rounded-[40px] brightness-90 opacity-50"
    >
      Siguiente
    </button>
  </div>
);
