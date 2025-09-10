import { useEffect, useRef, useState } from "react";
import { getUserCommunities } from "../../services/community.api";
import { useAuth } from "../../hooks/useAuth";

import { CommunityContext } from "./CommunityContext";

import type { Community } from "../../interface/global";

type UserCommunityEntry = {
  community: Community;
  is_moderator: boolean;
  joined_at: string;
};

export const CommunityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [userCommunities, setUserCommunities] = useState<UserCommunityEntry[]>(
    []
  );
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (user && !hasFetchedRef.current) {
        try {
          const response = await getUserCommunities(user.id);
          if (response?.success) {
            setUserCommunities(response.data as UserCommunityEntry[]);
            hasFetchedRef.current = true;
          }
        } catch (error) {
          console.error("Error fetching communities:", error);
        }
      }
    };
    fetchCommunities();
  }, [user]);

  return (
    <CommunityContext.Provider
      value={{
        userCommunities,
        refreshCommunities: async () => {
          if (user) {
            try {
              const response = await getUserCommunities(user.id);
              if (response?.success) {
                setUserCommunities(response.data as UserCommunityEntry[]);
              }
            } catch (error) {
              console.error("Error refreshing communities:", error);
            }
          }
        },
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};
