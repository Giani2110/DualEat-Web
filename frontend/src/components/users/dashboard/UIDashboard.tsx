import React from "react";
import { Link } from "react-router-dom";

//import { useLocation } from "react-router-dom";

import { useCommunity } from "../../../hooks/useUCommunity";

import "../../../assets/scss/users/users.scss";

interface Props {
  children: React.ReactNode;
}

const UIDashboard: React.FC<Props> = ({ children }) => {
  const { userCommunities } = useCommunity();
  //const location = useLocation();

  const sidebarContent = (
    <>
      <div className="flex flex-col">
        {/** Comunidades */}
        <div
          className={` transition-all duration-300 cursor-pointer w-full py-[10px] overflow-hidden
          `}
        >
          <div className={`flex justify-between px-3 items-center py-[10px]`}>
            <span className={`text-[15px] Dosis-Bold text5`}>Comunidades</span>
          </div>

          {userCommunities.map((community) => (
            <Link
              key={community.community.id}
              title={community.community.name}
              to={`/c/${community.community.slug}/`}
              className={`navlis flex-[1] rounded-[8px] cursor-pointer w-full py-[5px] px-2 hover:bg-[#e9e9e9]`}
            >
              <img
                src={
                  (community.community.image_url !== null &&
                    community.community.image_url) ||
                  "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                }
                className={`rounded-full h-4 w-4 flex-shrink-0`}
                alt="Imagen de la comunidad"
              />

              <span className={`ml-[10px] text-[14px] text4 whitespace-nowrap`}>
                {community.community.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="border-t border-gray-300 mt-2"></div>
      </div>
    </>
  );

  return (
    <div className={` min-h-screen BGUser`}>
      <section className={`lg:grid grid-cols-[300px_1fr] pt-15 min-h-screen`}>
        {/* Sidebar */}
        <div
          className={`border-r hidden lg:block sidebar bg-[#ffffff] border-[#e5a657] fixed h-[100vh] w-[300px]`}
        >
          <div className="mt-4 flex flex-col justify-between h-[90vh] ms-4 me-9 text-[13px] pb-3 relative">
            {sidebarContent}
          </div>
        </div>

        {/* Contenido ${isSideBarOpen ? "ps-[3%] md:ps-[10%]" : "ps-[3%] md:ps-[4%]"}*/}
        <div className={`main-content`}>{children}</div>
      </section>
    </div>
  );
};

export default UIDashboard;
