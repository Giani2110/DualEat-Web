import { useContext } from "react";
import { NotificationsContext } from "@context/other/NotificationsProvider";

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de un NotificationsProvider");
  return ctx;
};