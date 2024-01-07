import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import type { NextApiRequest, NextApiResponse } from "next";
// import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

import type { CartItem } from "~/types";

const cartItemsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = await createTRPCContext({ req, res });

  const { cartItems } = req.body;

  try {
    switch (req.method) {
      case "OPTIONS":
        return res.json({});
      case "POST":
        try {
          if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: "Product ids are required" });
          }
          const productIds = [
            ...new Set(
              (cartItems as CartItem[]).map((item: CartItem) => item.product.id)
            ),
          ];
          const variantIds = [
            ...new Set(
              (cartItems as CartItem[])
                .filter((item) => item.variant !== null)
                .map((item) => item.variant!.id)
            ),
          ];

          // Fetch all products and variants in one go
          const [products, variants] = await Promise.all([
            ctx.prisma.product.findMany({
              where: { id: { in: productIds } },
              include: {
                images: true,
                variants: true,
                category: {
                  include: {
                    attributes: true,
                  },
                },
              },
            }),
            ctx.prisma.variation.findMany({
              where: { id: { in: variantIds } },
            }),
          ]);

          const detailedCartItems = (cartItems as CartItem[]).map(
            (cartItem: CartItem) => ({
              product: products.find((p) => p.id === cartItem.product.id),
              variant: cartItem.variant
                ? variants.find((v) => v.id === cartItem.variant?.id)
                : null,
              quantity: cartItem.quantity,
            })
          ) as CartItem[];

          return res.json({ detailedCartItems });
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

export default cartItemsHandler;
