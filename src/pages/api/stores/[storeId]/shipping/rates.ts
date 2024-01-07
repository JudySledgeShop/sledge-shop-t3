import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { type NextApiRequest, type NextApiResponse } from "next";

import { createTRPCContext } from "~/server/api/trpc";

import { shippoClient } from "~/server/shippo/client";

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
          const {
            customer_name,
            customer_street,
            customer_additional,
            customer_city,
            customer_state,
            customer_zip,
            business_name,
            business_street,
            business_additional,
            business_city,
            business_state,
            business_zip,
            weight_lb,
            weight_oz,
            length,
            width,
            height,
          } = req.body;

          const addressFrom = {
            name: business_name,
            street1: business_street,
            street2: business_additional,
            city: business_city,
            state: business_state,
            zip: `${business_zip}`,
            country: "US",
          };

          const addressTo = {
            name: customer_name,
            street1: customer_street,
            street2: customer_additional,
            city: customer_city,
            state: customer_state,
            zip: `${customer_zip}`,
            country: "US",
          };

          const parcel = {
            length: length,
            width: width,
            height: height,
            distance_unit: "in",
            weight: weight_lb + weight_oz / 16,
            mass_unit: "lb",
          };

          console.log({
            address_from: addressFrom,
            address_to: addressTo,
            parcels: [parcel],
            async: false,
          });

          const results = await shippoClient.shipment.create({
            address_from: addressFrom,
            address_to: addressTo,
            parcels: [parcel],
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
