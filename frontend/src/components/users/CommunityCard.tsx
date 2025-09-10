import type { Community } from "../../interface/global";

const CommunityCard = ( { community }: { community: Community }) => (
  <div
    key={community.id}
    className="bg-white py-2 px-4 border border-[#dbdbdb] rounded-lg"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 tracking-tight">
        <img
          src={community.image_url || ""}
          alt={community.name}
          className="w-10 h-10 object-cover border rounded-full border-[#ebebeb]"
        />
        <div className="flex flex-col">
          <h4 className="Arvo-Bold text5 text-[14px]">
            {community.name}
          </h4>
          <p className="text-[11px] text4">
            {community.total_members} miembros
          </p>
        </div>
      </div>
      <button
        type="button"
        className="bg-red hover:bg-[#923025]! cursor-pointer text1 rounded-full px-3 py-2 text-[12px]"
      >
        Únete
      </button>
    </div>
    <p className="text-[12px] text-gray-600 mt-2">
      {community.description}
    </p>
  </div>
);

export default CommunityCard;
