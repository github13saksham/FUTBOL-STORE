import { Product } from "@/data/mockData";

export interface ResolvedProductPrice {
  effectivePrice: number;
  effectiveComparePrice?: number;
  priceStr: string;
  isDiwaliOffer: boolean;
  badgeText: string;
  percentOff: number;
}

/**
 * Returns effective pricing for a product taking into account Diwali Festival mode
 * and product-specific Diwali offer settings.
 */
export function getProductDisplayPrice(product: Product, festivalEnabled: boolean): ResolvedProductPrice {
  const diwali = product.diwaliOffer;
  const isDiwaliActive = Boolean(festivalEnabled && diwali?.enabled);

  if (isDiwaliActive) {
    const regularPrice = product.price || 999;
    const discPrice = diwali?.discountPrice !== undefined && diwali.discountPrice > 0 
      ? diwali.discountPrice 
      : regularPrice;

    // Actual MRP (compare price)
    const compPrice = diwali?.comparePrice !== undefined && diwali.comparePrice > discPrice
      ? diwali.comparePrice
      : (product.comparePrice && product.comparePrice > discPrice ? product.comparePrice : Math.round(discPrice * 1.35));

    const percent = compPrice > discPrice ? Math.round(((compPrice - discPrice) / compPrice) * 100) : 0;
    const badge = diwali?.badgeText && diwali.badgeText.trim() !== "" ? diwali.badgeText.trim() : "DIWALI SPECIAL";

    return {
      effectivePrice: discPrice,
      effectiveComparePrice: compPrice,
      priceStr: `₹${discPrice.toFixed(2)}`,
      isDiwaliOffer: true,
      badgeText: badge,
      percentOff: percent
    };
  }

  // Normal original pricing
  const currentPrice = product.price || 0;
  const compPrice = product.comparePrice && product.comparePrice > currentPrice ? product.comparePrice : undefined;
  const percent = compPrice ? Math.round(((compPrice - currentPrice) / compPrice) * 100) : 0;

  return {
    effectivePrice: currentPrice,
    effectiveComparePrice: compPrice,
    priceStr: product.priceStr || `₹${currentPrice.toFixed(2)}`,
    isDiwaliOffer: false,
    badgeText: "",
    percentOff: percent
  };
}
