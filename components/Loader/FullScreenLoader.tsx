// components/FullScreenLoader.tsx
import React from "react";

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-black/20 bg-opacity-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border- border-4 border-t-2 border-white" />
    </div>
  );
};

export default FullScreenLoader;
