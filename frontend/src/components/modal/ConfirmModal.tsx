import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: "danger" | "warning" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
  isAlert?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isAlert = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <FaExclamationTriangle className="text-red-500 text-3xl" />;
      case "warning":
        return <FaExclamationTriangle className="text-amber-500 text-3xl" />;
      case "success":
        return <FaCheckCircle className="text-emerald-500 text-3xl" />;
      default:
        return <FaInfoCircle className="text-blue-500 text-3xl" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 shadow-red-200";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 shadow-amber-200";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200";
      default:
        return "bg-blue-600 hover:bg-blue-700 shadow-blue-200";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9998]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl pointer-events-auto border border-gray-100"
            >
              <div className="relative p-8 flex flex-col items-center text-center">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors p-1"
                >
                  <FaTimes />
                </button>

                {/* Icon */}
                <div
                  className={`mb-6 w-20 h-20 rounded-3xl flex items-center justify-center ${
                    type === "danger"
                      ? "bg-red-50"
                      : type === "warning"
                        ? "bg-amber-50"
                        : type === "success"
                          ? "bg-emerald-50"
                          : "bg-blue-50"
                  }`}
                >
                  {getIcon()}
                </div>

                {/* Content */}
                <h3 className="text-xl font-black text-gray-800 mb-3 tracking-tight">
                  {title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                  {message}
                </p>

                {/* Actions */}
                <div
                  className={`flex w-full gap-3 ${isAlert ? "justify-center" : ""}`}
                >
                  {!isAlert && (
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-all border border-gray-100"
                    >
                      {cancelText}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (onConfirm) onConfirm();
                      onClose();
                    }}
                    className={`flex-1 px-6 py-4 rounded-2xl text-white font-bold shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 ${getButtonClass()}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
