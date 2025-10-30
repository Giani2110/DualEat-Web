import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { MinimalCommunity } from "@/interface/global";

export interface MinimalCommunityPlus extends MinimalCommunity {
  id: string;
  lastAccess: number;
}

const COMMUNITY_KEY = (userId: string) => `community_${userId}`;
const ACTIVITY_KEY = (userId: string) => `user_activity_${userId}`;

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const cleanupOldUserData = (() => {
  let hasRun = false; // se asegura que se ejecute solo una vez
  return () => {
    if (hasRun) return;
    hasRun = true;

    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("user_activity_")) {
        const userId = key.replace("user_activity_", "");
        const lastActive = parseInt(localStorage.getItem(key) || "0", 10);

        if (now - lastActive > THREE_DAYS_MS) {
          localStorage.removeItem(key);
          localStorage.removeItem(`community_${userId}`);
        }
      }
    }
  };
})();

// Hook principal
export function useRecent(userId?: string) {
  const [recents, setRecents] = useState<MinimalCommunityPlus[]>([]);

  const [recentsPosts, setRecentsPosts] = useState<MinimalCommunityPlus[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const cleanupDone = useRef(false);


  useEffect(() => {
    if (!userId) return;
    if (!cleanupDone.current) {
      cleanupOldUserData(); 
      cleanupDone.current = true;
    }

    const key = COMMUNITY_KEY(userId);
    const stored = localStorage.getItem(key);
    setRecents(stored ? JSON.parse(stored) : []);
  }, [userId, location.pathname]);


  const handleCommunityClick = (community: MinimalCommunityPlus) => {
    if (!userId) return;

    const key = COMMUNITY_KEY(userId);
    const stored = localStorage.getItem(key);
    const communities: MinimalCommunityPlus[] = stored
      ? JSON.parse(stored)
      : [];

    const exists = communities.some((c) => c.id === community.id);
    const now = Date.now();

    let updated: MinimalCommunityPlus[];

    if (!exists) {
      updated = [...communities, { ...community, lastAccess: now }];
      if (updated.length > 5) updated.shift();
    } else {
      updated = communities.map((c) =>
        c.id === community.id ? { ...c, lastAccess: now } : c
      );
    }

    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem(ACTIVITY_KEY(userId), String(now));

    setRecents(updated);
    navigate(`/c/${community.slug}/`);
  };

  return {
    recents,
    handleCommunityClick,
  };
}
