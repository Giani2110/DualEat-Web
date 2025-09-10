import { createContext } from "react";
import type { Community } from "../../interface/global";

type UserCommunityEntry = {
  community: Community;
  is_moderator: boolean;
  joined_at: string;
};

type CommunityContextType = {
  userCommunities: UserCommunityEntry[];
  refreshCommunities: () => Promise<void>;
};

export const CommunityContext = createContext<CommunityContextType>({
  userCommunities: [],
  refreshCommunities: async () => {},
});
