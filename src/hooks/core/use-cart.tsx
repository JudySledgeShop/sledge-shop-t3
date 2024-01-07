import axios from "axios";
import { toast } from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem, DetailedProductFull } from "~/types";

interface CartStore {
  items: DetailedProductFull[];
  cartItems: CartItem[];
  paymentType: string;
  shippingType: string;
  shippingAddress: string;
  shippingAdditional?: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  customerName: string;

  addCartItem: (data: CartItem) => void;

  removeCartItem: (data: CartItem) => void;
  // removeCartItem: (id: string, variant: string | null) => void;

  updateQuantity: (data: CartItem, quantity: number) => void;
  removeAll: () => void;
  getQuantity: () => number;
  getTotal: () => number;

  verifyValues: () => Promise<void>;
  setValue: (key: string, value: string) => void;
}

const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      cartItems: [],
      paymentType: "",
      customerName: "",
      shippingType: "",
      shippingAddress: "",
      shippingAdditional: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",

      setValue: (key: string, value: string) => {
        set({ [key]: value });
      },

      getTotal: () => {
        let cost = 0;
        get().cartItems.forEach((item) => {
          cost += Number(item.quantity * item.product?.price);
        });
        return cost;
      },
      addCartItem: (data: CartItem) => {
        const currentItems = get().cartItems;

        // Determine if the item to be added has a variant
        const isItemAVariant = data.variant !== null;

        // Find the index of the item in the cart, considering variant if present
        const existingItemIndex = currentItems.findIndex((item) => {
          if (isItemAVariant && item.variant) {
            // Both item in cart and new item have variants, compare their IDs
            return (
              item.product.id === data.product.id &&
              item.variant.id === data?.variant?.id
            );
          } else if (!isItemAVariant && !item.variant) {
            // Both item in cart and new item do not have variants, compare product IDs only
            return item.product.id === data.product.id;
          }
          // Default to not found
          return false;
        });

        if (existingItemIndex !== -1) {
          // Item (with or without variant) already in the cart
          const existingItem = currentItems[existingItemIndex]!;

          const quantity = isItemAVariant
            ? data?.variant?.quantity
            : data?.product?.quantity;

          // Check quantity constraints
          if (existingItem.quantity + data.quantity > quantity!) {
            console.log(existingItem);
            return toast.error("Cannot add more of this item to the cart.");
          } else {
            const updatedItems = [...currentItems];
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + data.quantity,
            };

            set({ cartItems: updatedItems });
            return toast.success("Quantity updated in cart.");
          }
        } else {
          // Item (with or without variant) is not in the cart
          set({ cartItems: [...currentItems, data] });
          return toast.success("Item added to cart.");
        }
      },

      updateQuantity: (data: CartItem, quantity: number) => {
        const currentItems = get().cartItems;

        const existingItem = currentItems.find(
          (item) =>
            item.product.id === data?.product?.id &&
            (data?.variant ? item.variant?.id === data?.variant?.id : true)
        );
        if (existingItem) {
          existingItem.quantity = quantity;
          set({ cartItems: [...get().cartItems] });
          toast.success("Item quantity updated.");
        }
      },

      removeCartItem: (data: CartItem) => {
        const currentItems = get().cartItems;

        // Filter out the item to be removed. If it's a variant, match both product and variant IDs.
        const updatedItems = currentItems.filter((item) => {
          if (data?.variant?.id && item.variant) {
            // Both item in cart and item to be removed have variants, compare their IDs
            return !(
              item.product.id === data.product.id &&
              item.variant.id === data?.variant?.id
            );
          } else if (!data?.variant?.id && !item.variant) {
            // Both item in cart and item to be removed do not have variants, compare product IDs only
            return item.product.id !== data.product.id;
          }
          // Keep the item in the cart if it doesn't match the criteria for removal
          return true;
        });

        // Update the state with the filtered items
        set({ cartItems: updatedItems });
        toast.success("Item removed from cart.");
      },
      removeAll: () => set({ cartItems: [] }),

      getQuantity: () => {
        let quantity = 0;
        get().cartItems.forEach((item) => {
          quantity += Number(item.quantity);
        });
        return quantity;
      },

      verifyValues: async () => {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/cartItems`,
          {
            cartItems: get().cartItems,
          }
        );

        if (response.status === 200) {
          return response.data.detailedCartItems;
        }
        return null;
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;
