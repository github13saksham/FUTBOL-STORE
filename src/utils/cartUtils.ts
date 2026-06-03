import deliveryData from '../../delivery_rate.json';

export const calculateShipping = (stateName: string, quantity: number): number | null => {
  if (!stateName) return null;
  
  // Hardcoded Rule: 4 or more jerseys get FREE SHIPPING
  if (quantity >= 4) return 0;
  
  const rates = (deliveryData as any).shippingRates[stateName];
  if (!rates) {
    return null; 
  }
  
  const rate500g = rates["500g"];
  const rate1000g = rates["1000g"];
  const rate1500g = rates["1500g"];
  
  if (quantity <= 0) return 0;
  if (quantity === 1) return rate500g;
  if (quantity === 2) return rate1000g;
  if (quantity === 3) return rate1500g;
  
  // Fallback if no rate rule matched (though quantity >= 4 handles above 3)
  return rate1500g + (quantity - 3) * (rate1000g - rate500g);
};

export const validateCoupon = (coupon: any, subTotal: number, cart: any[]): { valid: boolean; error?: string } => {
  if (!coupon) return { valid: true };
  
  const now = new Date().getTime();
  if (!coupon.isActive) return { valid: false, error: "This coupon is currently disabled." };
  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < now) return { valid: false, error: "This coupon has expired." };

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (coupon.minOrderValue && subTotal < coupon.minOrderValue) {
    return { valid: false, error: `Minimum order value to use this coupon is ₹${coupon.minOrderValue}` };
  }
  
  if (coupon.minQuantity && totalQuantity < coupon.minQuantity) {
    return { valid: false, error: `Minimum ${coupon.minQuantity} items required in cart to use this coupon.` };
  }

  if (coupon.type === 'product_specific' && coupon.productIds && coupon.productIds.length > 0) {
    const hasProduct = cart.some((item: any) => coupon.productIds.includes(item.id));
    if (!hasProduct) return { valid: false, error: "This coupon is not valid for the products in your cart." };
  }

  if (coupon.discountType === 'buy_x_get_y') {
     if (!coupon.minQuantity || totalQuantity <= coupon.minQuantity) {
       return { valid: false, error: `You need at least ${coupon.minQuantity ? coupon.minQuantity + 1 : 2} items in cart for Buy X Get Y.` };
     }
  }

  return { valid: true };
};

export const evaluateCouponBenefit = (coupon: any, subTotal: number, cart: any[], baseShipping: number | null): number => {
  if (!coupon) return 0;

  switch (coupon.discountType) {
    case 'flat':
    case 'cart_value':
    case 'product_specific':
    case 'quantity':
      return coupon.discountValue || 0;
    
    case 'percentage':
      return (subTotal * (coupon.discountValue || 0)) / 100;

    case 'free_shipping':
    case 'qty_free_shipping':
      return baseShipping || 0;

    case 'buy_x_get_y':
      if (cart.length === 0) return 0;
      if (coupon.discountValue && coupon.discountValue > 0) return coupon.discountValue;
      const sortedItems = [...cart].sort((a, b) => a.price - b.price);
      return sortedItems[0].price;

    default:
      return 0;
  }
};

export const calculateFinalTotal = (
  subTotal: number, 
  shippingCharge: number | null, 
  discountAmount: number
): number => {
  let total = subTotal - discountAmount + (shippingCharge || 0);
  return total > 0 ? total : 0;
};
