import Logo from '@assets/images/icon/Logo_DualEatBlack.png';

export default function LoadingScreen() {
  return (
    <main className="fixed BGUser w-[100%] h-[100vh] bg-[#fcfcfc] z-[1000]">
      <div className="flex flex-col items-center">
        <div className="relative h-14 flex items-center justify-center">
          <img src={Logo} alt="Logo DualEat" className="w-15 h-15 absolute top-[200px] z-10" />
          <div className='w-[170px] h-[3px] relative  overflow-hidden rounded-full bg-[#dddddd] top-[280px]'>
            <span className="absolute top-0 left-0 z-10 w-[60px] rounded-full h-full bg-black translate"></span>
          </div>
        </div>
      </div>
    </main>
  );
};
