import React from 'react';

import Logo from '../../assets/images/icon/Logo_DualEat.png';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[#b53325] flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="pulse-circle"></div>
          {/* Añade la clase 'logo-pulse' para la animación */}
          <img src={Logo} alt="Logo DualEat" className="w-full h-full object-contain z-10 logo-pulse" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;