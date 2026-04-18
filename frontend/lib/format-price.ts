export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `€${price.toFixed(2)}`;
}

export function formatCents(cents: number): string {
  return formatPrice(cents / 100);
}

export function originalPriceCents(priceFinal: number, reductionPercentage: number): number {
  if (reductionPercentage <= 0) return priceFinal;
  return Math.round(priceFinal / (1 - reductionPercentage / 100));
}
