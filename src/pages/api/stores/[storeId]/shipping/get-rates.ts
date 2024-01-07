import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { type NextApiRequest, type NextApiResponse } from "next";

import { createTRPCContext } from "~/server/api/trpc";

import { shippoClient } from "~/server/shippo/client";
import { type CartItem } from "~/types";

const rateHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create context and caller
  const ctx = await createTRPCContext({ req, res });

  const userId = ctx.session?.user.id;
  const { storeId } = req.query;

  const storeByUserId = await ctx.prisma.store.findFirst({
    where: {
      id: storeId as string,
      userId,
    },
  });

  try {
    switch (req.method) {
      case "POST":
        if (!userId)
          return res.status(403).json({ message: "Unauthenticated" });

        if (!storeByUserId)
          return res.status(405).json({ message: "Unauthorized" });

        try {
          const { customer, business, products } = req.body;

          const addressFrom = business;
          const addressTo = customer;

          const parcels = products.flatMap((product: CartItem) => {
            const current = [];
            console.log(product);
            for (let i = 0; i < product.quantity; i++) {
              current.push({
                length: product?.product?.length,
                width: product?.product?.width,
                height: product?.product?.height,
                distance_unit: "in",
                weight: 50,
                mass_unit: "oz",
              });
            }

            return current;
          });

          console.log(parcels);

          const results = await shippoClient.shipment.create({
            address_from: addressFrom,
            address_to: addressTo,
            parcels: parcels,
            async: false,
          });

          //   const label = await shippoClient.transaction.create({
          //     rate: rate,
          //     label_file_type: "PDF",
          //     async: false,
          //   });

          return res.status(200).json(results);
        } catch (error) {
          console.log(error);
        }
      default:
        res.setHeader("Allow", "GET, POST");
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

export default rateHandler;
