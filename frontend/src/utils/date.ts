import { formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";

export const getShortTimeAgo = (
  date: Date | string,
  addSuffix = false,
): string => {
  const distance = formatDistanceStrict(new Date(date), new Date(), {
    locale: es,
    addSuffix,
  });

  return distance
    .replace(/ segundos?/, "s")
    .replace(/ minutos?/, "m")
    .replace(/ horas?/, "hs")
    .replace(/ días?/, "d")
    .replace(/ meses?/, "meses")
    .replace(/ años?/, "a");
};
