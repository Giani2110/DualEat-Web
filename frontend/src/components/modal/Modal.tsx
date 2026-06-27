import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  children,
  isOpen,
  onClose,
  className,
  overlayClassName = "z-50",
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  overlayClassName?: string;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      const activeModals = document.querySelectorAll(".modal-overlay-backdrop");
      if (activeModals.length <= 1) {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 modal-overlay-backdrop ${overlayClassName}`}
    >
      <div onClick={(e) => e.stopPropagation()} className={className}>
        {children}
      </div>
    </div>,
    document.body
  );
}
