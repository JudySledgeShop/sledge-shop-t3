import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import type { NextApiRequest, NextApiResponse } from "next";
// import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

import axios from "axios";
import type { Stripe } from "stripe";
import { stripe } from "~/server/stripe/client";
import { type CartItem } from "~/types";

const checkoutHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = await createTRPCContext({ req, res });

  const { productIds, quantity, cartItems, shipping } = req.body;
  const { storeId } = req.query;

  try {
    switch (req.method) {
      case "OPTIONS":
        return res.json({});
      case "POST":
        try {
          if (!productIds || productIds.length === 0) {
            return res.status(400).json({ error: "Product ids are required" });
          }
          const verifiedDBDataResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/cartItems`,
            {
              cartItems,
            }
          );

          if (verifiedDBDataResponse.status !== 200) {
            throw new Error();
          }

          const verifiedDBData = (await verifiedDBDataResponse.data
            .detailedCartItems) as CartItem[];
          // const products = await ctx.prisma.product.findMany({
          //   where: {
          //     id: {
          //       in: productIds,
          //     },
          //   },
          //   include: {
          //     variants: true,
          //     images: true,
          //   },
          // });

          // const variants = await ctx.prisma.variation.findMany({
          //   where: {
          //     id: {
          //       in: variantIds,
          //     },
          //   },
          // });

          const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

          // const completionDates = cartItems.map((item: CartItem) => {
          //   console.log(item.product.estimatedCompletion);
          //   return (item.product?.estimatedCompletion ?? 1) * item.quantity;
          // });
          // console.log(completionDates);
          // const longestDate = Math.max(
          //   ...(cartItems.map(
          //     (item: CartItem) =>
          //       item.product?.estimatedCompletion ?? 1 * item.quantity
          //   ) as number[])
          // );
          // console.log(longestDate);
          // const estDelivery = new Date(
          //   Date.now() + longestDate * 24 * 60 * 60 * 1000
          // ).toLocaleDateString();

          // console.log(estDelivery);
          const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption =
            shipping === "FREE"
              ? {
                  shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: {
                      amount: 0,
                      currency: "usd",
                    },
                    display_name: "Free Shipping",
                    delivery_estimate: {
                      minimum: {
                        unit: "business_day",
                        value: 5,
                      },
                      maximum: {
                        unit: "business_day",
                        value: 7,
                      },
                    },
                  },
                }
              : {
                  shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: {
                      amount: shipping * 100,
                      currency: "usd",
                    },
                    display_name: `[Fixed] Standard 5-7 days after product processing.`,

                    delivery_estimate: {
                      minimum: {
                        unit: "business_day",
                        value: 5,
                      },
                      maximum: {
                        unit: "business_day",
                        value: 7,
                      },
                    },
                  },
                };

          // // Map the values key from the fetched variants to the variant IDs
          // const mapValuesToIds = () => {
          //   const variantIdToValueMap: Record<string, string> = {};
          //   for (const variant of variants) {
          //     variantIdToValueMap[variant.id] = variant.values;
          //   }

          //   return variantIds.map((id: string) =>
          //     id === "0" ? "Default" : variantIdToValueMap[id]
          //   );
          // };

          // const variantValues = mapValuesToIds();

          verifiedDBData.forEach((product, idx) => {
            line_items.push({
              quantity: Number(quantity[idx]) ?? 1,
              price_data: {
                currency: "USD",
                product_data: {
                  name: product.product.name,
                  description: product.variant?.values,

                  images: product.product.images.map((image) => image.url),
                },
                unit_amount: Math.floor(product.product.price * 100),
              },
            });
          });

          const order = await ctx.prisma.order.create({
            data: {
              storeId: storeId as string,
              isPaid: false,
              orderItems: {
                create: verifiedDBData.map((product: CartItem) => {
                  if (product.variant === null)
                    return {
                      product: {
                        connect: {
                          id: product.product.id,
                        },
                      },
                      quantity: Number(product.quantity) ?? 1,
                    };

                  return {
                    product: {
                      connect: {
                        id: product.product.id,
                      },
                    },
                    variant: {
                      connect: {
                        id: product.variant.id,
                      },
                    },
                    quantity: Number(product.quantity) ?? 1,
                  };
                }),
              },
            },
          });

          const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            payment_method_types: ["card"],
            billing_address_collection: "required",

            shipping_address_collection: {
              allowed_countries: ["US", "CA"],
            },
            shipping_options: [shippingOptions],
            phone_number_collection: {
              enabled: true,
            },

            custom_text: {
              shipping_address: {
                message: `Please note that things made to order takes additional processing time before shipping. Check estimated delivery dates of products to see when to expect your item(s).`,
              },
            },

            success_url: `http://localhost:3000/cart?success=1`,
            cancel_url: `http://localhost:3000/cart?canceled=1`,
            metadata: {
              orderId: order.id,
            },
          });

          return res.json({ url: session.url });
        } catch (err) {
          return res
            .status(500)
            .json({ error: "Error creating checkout session" });
        }
      default:
        res.setHeader("Allow", "POST");
        return res.status(405).end("Method Not Allowed");
    }
  } catch (cause) {
    if (cause instanceof TRPCError) {
      // An error from tRPC occurred
      const httpCode = getHTTPStatusCodeFromError(cause);
      return res.status(httpCode).json(cause);
    }
    // Another error occurred
    console.error(cause);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default checkoutHandler;
