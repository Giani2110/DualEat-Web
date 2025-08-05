import React from "react";
interface LoaderProps {
  color?: "white" | "black" | "gray-500" | "primary"; 
  size?:  "4" | "6"; 
}

const Loader: React.FC<LoaderProps> = ({ color = "white", size = "4" }) => {
  return (
    <div
      className={`
        animate-spin
        inline-block
        w-${size}
        h-${size}
        border-4
        border-current
        border-t-transparent
        text-${color}
        rounded-full
      `}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;
