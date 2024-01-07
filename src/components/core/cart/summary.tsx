"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { toast } from "react-hot-toast";

import Button from "~/components/core/ui/button";
import Currency from "~/components/core/ui/currency";
import { env } from "~/env.mjs";

import useCart from "~/hooks/core/use-cart";
import { api } from "~/utils/api";

const Summary = () => {
  const searchParams = useSearchParams();

  const cartItems = useCart((state) => state.cartItems);
  const removeAll = useCart((state) => state.removeAll);

  const { data: store } = api.store.getStore.useQuery({
    storeId: env.NEXT_PUBLIC_STORE_ID,
  });

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Payment completed.");
      removeAll();
    }

    if (searchParams.get("canceled")) {
      toast.error("Something went wrong.");
    }
  }, [searchParams, removeAll]);

  const totalPrice = cartItems.reduce((total, item) => {
    return total + Number(item.product.price) * Number(item.quantity);
  }, 0);

  const onCheckout = async () => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/checkout`,
      {
        productIds: cartItems?.map((item) => item.product.id),
        variantIds: cartItems?.map((item) => item?.variant?.id ?? "0"),
        quantity: cartItems?.map((item) => item.quantity),
        shipping: calculateShippingCost,
        cartItems,
      }
    );

    window.location = response.data.url;
  };

  const calculateShippingCost = useMemo(() => {
    if (!store) return "";

    if (cartItems.length === 0) return "";

    const { hasFreeShipping, hasFlatRate, minFreeShipping, flatRateAmount } =
      store;

    if (hasFreeShipping && totalPrice >= (minFreeShipping ?? 0)) {
      return "FREE";
    } else if (hasFlatRate) {
      console.log(flatRateAmount);
      return flatRateAmount;
    } else {
      console.error("Flat rate not set up");
      return "FREE";
      // const response = await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_URL}/shipping/get-rates`,
      //   {
      //     customer: {
      //       name: "Todd Howard",
      //       street1: "2000 Bonisteel Blvd",
      //       street2: "",
      //       city: "Ann Arbor",
      //       state: "MI",
      //       zip: "40109",
      //       country: "US",
      //     },
      //     business: {
      //       name: store.name,
      //       street1: "",
      //       street2: "",
      //       city: "",
      //       state: "MI",
      //       zip: "",
      //       country: "US",
      //     },
      //     products: cartItems ?? [],
      //   }
      // );

      // if (response.status !== 200) return "Calculated at Checkout";

      // const data = await response.data;

      // const cheapestRate = data.rates?.find((rate: Shippo.Rate) =>
      //   rate.attributes.includes("CHEAPEST")
      // );

      // const rate = cheapestRate
      //   ? cheapestRate.amount
      //   : data.rates.length > 0
      //   ? data.rates[0].amount
      //   : "ERROR";

      // return rate;
    }
  }, [store, totalPrice, cartItems]);

  return (
    <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between   ">
          <div className="text-base font-medium text-gray-500">Subtotal</div>
          <Currency value={totalPrice} />
        </div>
        <div className="flex items-center justify-between   ">
          <div className="text-base font-medium text-gray-500">Shipping</div>
          {typeof calculateShippingCost === "string" ? (
            calculateShippingCost
          ) : (
            <Currency value={calculateShippingCost ?? 0} />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-base font-medium text-gray-900">Order total</div>
          <Currency
            value={
              totalPrice +
              ((calculateShippingCost as string) === "FREE"
                ? 0
                : (calculateShippingCost as number))
            }
          />
        </div>
      </div>
      <Button
        onClick={() => void onCheckout()}
        disabled={cartItems.length === 0}
        className="mt-6 w-full"
      >
        Checkout
      </Button>
      <p className="mt-3 w-full text-center text-muted-foreground">
        Shipping and taxes calculated at checkout
      </p>
    </div>
  );
};

export default Summary;
