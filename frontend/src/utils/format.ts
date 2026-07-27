export const formatPrice = (price: number | undefined | null): string => {
  if (price == null) return "$ 0";

  const formattedNumber = Math.round(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `$ ${formattedNumber}`;
};
