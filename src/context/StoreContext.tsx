"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Club } from "@/data/mockData";
import { dbService } from "@/backend";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  customName?: string;
  customNumber?: string;
}

interface StoreContextType {
  products: Product[];
  clubs: Club[];
  isLoadingData: boolean;
  cart: CartItem[];
  wishlist: string[];
  searchOpen: boolean;
  wishlistOpen: boolean;
  cartOpen: boolean;
  sizeGuideOpen: boolean;
  activePolicy: string | null;
  quickAddProduct: Product | null;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  setQuickAddProduct: (product: Product | null) => void;
  setSearchOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  setSizeGuideOpen: (open: boolean) => void;
  setActivePolicy: (policy: string | null) => void;
  addToCart: (product: any, size: string, customName?: string, customNumber?: string, quantity?: number) => void;
  removeFromCart: (id: string, size: string, customName?: string, customNumber?: string) => void;
  updateQuantity: (id: string, size: string, change: number, customName?: string, customNumber?: string) => void;
  toggleWishlist: (id: string) => void;
  getCartTotal: () => number;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export default function StoreProvider({ children, initialProducts = [], initialClubs = [] }: { children: React.ReactNode, initialProducts?: Product[], initialClubs?: Club[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // If not passed initially (e.g. somehow rendered without layout data), fetch them.
    if (products.length === 0 && clubs.length === 0) {
      async function fetchData() {
        setIsLoadingData(true);
        try {
          const [productsRes, clubsRes] = await Promise.all([
            fetch('/api/data/products'),
            fetch('/api/data/clubs')
          ]);
          const fetchedProducts = await productsRes.json();
          const fetchedClubs = await clubsRes.json();
          setProducts(fetchedProducts);
          setClubs(fetchedClubs);
        } catch (e) {
          console.error("Failed to load global data", e);
        } finally {
          setIsLoadingData(false);
        }
      }
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    async function loadUserData() {
      try {
        if (user) {
          // 1. Initial load from local storage for fast response
          const storedCart = localStorage.getItem(`futbol_cart_${user.uid}`);
          if (storedCart) setCart(JSON.parse(storedCart));
          else setCart([]);

          const storedWishlist = localStorage.getItem(`futbol_wishlist_${user.uid}`);
          if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
          else setWishlist([]);

          // 2. Fetch from DB to sync across devices
          const profile = await dbService.getUserProfile(user.uid);
          if (profile) {
             if (profile.cart) {
               setCart(profile.cart);
               localStorage.setItem(`futbol_cart_${user.uid}`, JSON.stringify(profile.cart));
             }
             if (profile.wishlist) {
               setWishlist(profile.wishlist);
               localStorage.setItem(`futbol_wishlist_${user.uid}`, JSON.stringify(profile.wishlist));
             }
          }
        } else {
          setCart([]);
          setWishlist([]);
        }
      } catch (e) {
        console.error("Failed to load store data", e);
      }
      setIsInitialized(true);
    }
    
    loadUserData();
  }, [user, authLoading]);

  useEffect(() => {
    if (isInitialized && user) {
      localStorage.setItem(`futbol_cart_${user.uid}`, JSON.stringify(cart));
      
      // Firestore does not support undefined values, so we strip them out
      const sanitizedCart = cart.map(item => {
        const cleanItem = { ...item };
        if (cleanItem.customName === undefined) delete cleanItem.customName;
        if (cleanItem.customNumber === undefined) delete cleanItem.customNumber;
        return cleanItem;
      });

      dbService.updateUserProfile(user.uid, { cart: sanitizedCart }).catch(e => console.error("Sync cart error", e));
    }
  }, [cart, isInitialized, user]);

  useEffect(() => {
    if (isInitialized && user) {
      localStorage.setItem(`futbol_wishlist_${user.uid}`, JSON.stringify(wishlist));
      dbService.updateUserProfile(user.uid, { wishlist }).catch(e => console.error("Sync wishlist error", e));
    }
  }, [wishlist, isInitialized, user]);

  // Sync cart and wishlist with live products to handle updates and deletions
  useEffect(() => {
    if (!isLoadingData && isInitialized) {
      // Sync Cart
      setCart((prevCart) => {
        let changed = false;
        const newCart = prevCart.map((item) => {
          const liveProduct = products.find((p) => p.id === item.id);
          if (!liveProduct) {
            changed = true;
            return null; // Product deleted
          }
          if (item.name !== liveProduct.name || item.price !== liveProduct.price || item.image !== liveProduct.image) {
            changed = true;
            return { ...item, name: liveProduct.name, price: liveProduct.price, image: liveProduct.image };
          }
          return item;
        }).filter(Boolean) as CartItem[];
        
        return changed ? newCart : prevCart;
      });

      // Sync Wishlist
      setWishlist((prevWishlist) => {
        const newWishlist = prevWishlist.filter((id) => products.some((p) => p.id === id));
        return newWishlist.length !== prevWishlist.length ? newWishlist : prevWishlist;
      });
    }
  }, [products, isLoadingData, isInitialized]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("M");

  // Cart operations
  const addToCart = (product: any, size: string, customName?: string, customNumber?: string, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.size === size &&
          item.customName === customName &&
          item.customNumber === customNumber
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id &&
          item.size === size &&
          item.customName === customName &&
          item.customNumber === customNumber
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          size,
          customName,
          customNumber,
        },
      ];
    });
    setCartOpen(true);
    setQuickAddProduct(null);
  };

  const removeFromCart = (id: string, size: string, customName?: string, customNumber?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.size === size &&
            item.customName === customName &&
            item.customNumber === customNumber
          )
      )
    );
  };

  const updateQuantity = (
    id: string,
    size: string,
    change: number,
    customName?: string,
    customNumber?: string
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.id === id &&
            item.size === size &&
            item.customName === customName &&
            item.customNumber === customNumber
          ) {
            const newQty = item.quantity + change;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const personalizationFee = (item.customName || item.customNumber) ? 199 : 0;
      return sum + ((item.price + personalizationFee) * item.quantity);
    }, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        clubs,
        isLoadingData,
        cart,
        wishlist,
        searchOpen,
        wishlistOpen,
        cartOpen,
        sizeGuideOpen,
        activePolicy,
        quickAddProduct,
        selectedSize,
        setSelectedSize,
        setQuickAddProduct,
        setSearchOpen,
        setWishlistOpen,
        setCartOpen,
        setSizeGuideOpen,
        setActivePolicy,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        getCartTotal,
        clearCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
