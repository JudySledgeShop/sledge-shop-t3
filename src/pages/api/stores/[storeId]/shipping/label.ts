import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { easyPost } from "~/server/easypost/client";
import { shippoClient } from "~/server/shippo/client";

const labelHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create context and caller
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);

  const userId = ctx.session?.user.id;
  const { storeId } = req.query;
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
    weight,
    length,
    width,
    height,
    value,
    description,
    rate,
  } = req.body;

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
          const { rate } = req.body;

          //   const fromAddress = await shippoClient.address.create({
          //     name: "Shawn Ippotle",
          //     company: "Shippo",
          //     street1: "215 Clayton St.",
          //     city: "San Francisco",
          //     state: "CA",
          //     zip: "94117",
          //     country: "US", // iso2 country code
          //     phone: "+1 555 341 9393",
          //     email: "shippotle@shippo.com",
          //   });

          //   const addressFrom = {
          //     name: "Shawn Ippotle",
          //     street1: "11638 Marshall Rd.",
          //     city: "Birch Run",
          //     state: "MI",
          //     zip: "48415",
          //     country: "US",
          //   };

          //   const addressTo = {
          //     name: "Mr Hippo",
          //     street1: "673 Lakewood Dr.",
          //     city: "South Lyon",
          //     state: "MI",
          //     zip: "48178",
          //     country: "US",
          //   };

          //   const parcel = {
          //     length: "5",
          //     width: "5",
          //     height: "5",
          //     distance_unit: "in",
          //     weight: "2",
          //     mass_unit: "lb",
          //   };

          //   const results = await shippoClient.shipment.create({
          //     address_from: addressFrom,
          //     address_to: addressTo,
          //     parcels: [parcel],
          //     async: false,
          //   });

          const label = await shippoClient.transaction.create({
            rate: rate,
            label_file_type: "PDF",
            async: false,
          });

          return res.status(200).json(label);
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

export default labelHandler;
