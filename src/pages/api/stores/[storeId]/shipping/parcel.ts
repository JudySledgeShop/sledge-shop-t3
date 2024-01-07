import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { type NextApiRequest, type NextApiResponse } from "next";

import { createTRPCContext } from "~/server/api/trpc";

import { shippoClient } from "~/server/shippo/client";

const addressHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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
      //   case "GET":
      //     if (!storeId)
      //       return res.status(400).json({ message: "Store id is required" });

      //     const fromAddress = await shippoClient.address.create({
      //       name: "Shawn Ippotle",
      //       company: "Shippo",
      //       street1: "215 Clayton St.",
      //       city: "San Francisco",
      //       state: "CA",
      //       zip: "94117",
      //       country: "US", // iso2 country code
      //       phone: "+1 555 341 9393",
      //       email: "shippotle@shippo.com",
      //     });

      //     const addressFrom = {
      //       name: "Shawn Ippotle",
      //       street1: "11638 Marshall Rd.",
      //       city: "Birch Run",
      //       state: "MI",
      //       zip: "48415",
      //       country: "US",
      //     };

      //     const addressTo = {
      //       name: "Mr Hippo",
      //       street1: "673 Lakewood Dr.",
      //       city: "South Lyon",
      //       state: "MI",
      //       zip: "48178",
      //       country: "US",
      //     };

      //     const parcel = {
      //       length: "5",
      //       width: "5",
      //       height: "5",
      //       distance_unit: "in",
      //       weight: "2",
      //       mass_unit: "lb",
      //     };

      //     const results = await shippoClient.shipment.create({
      //       address_from: addressFrom,
      //       address_to: addressTo,
      //       parcels: [parcel],
      //       async: false,
      //     });

      //     console.log(results.rates.map((rate) => rate.provider === "USPS"));

      //     const rate = results.rates[0];

      //     const label = await shippoClient.transaction.create({
      //       rate: rate.object_id,
      //       label_file_type: "PDF",
      //       async: false,
      //     });

      //     // const fromAddressData = await fromAddress
      //     //   .save()
      //     //   .then((res) => res.json());
      //     return res.status(200).json(label);

      case "POST":
        if (!userId)
          return res.status(403).json({ message: "Unauthenticated" });

        if (!storeByUserId)
          return res.status(405).json({ message: "Unauthorized" });

        try {
          const addressFrom = {
            name: "Shawn Ippotle",
            street1: "",
            city: "Birch Run",
            state: "MI",
            zip: "48415",
            country: "US",
          };

          const addressTo = {
            name: "Mr Hippo",
            street1: "",
            city: "South Lyon",
            state: "MI",
            zip: "48178",
            country: "US",
          };

          const results = await shippoClient.shipment.create({
            address_from: addressFrom,
            address_to: addressTo,
            parcels: [],
            async: false,
          });
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

export default addressHandler;
