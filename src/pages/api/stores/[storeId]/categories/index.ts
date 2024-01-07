import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const colorsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create context and caller
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);

  const { storeId } = req.query;

  try {
    switch (req.method) {
      case "GET":
        if (!storeId)
          return res.status(400).json({ message: "Store id is required" });

        const getAllCategories = await caller.categories.getAllCategories({
          storeId: storeId as string,
        });
        return res.status(200).json(getAllCategories);

      // case "POST":
      //   if (!userId)
      //     return res.status(403).json({ message: "Unauthenticated" });
      //   if (!name) return res.status(400).json({ message: "Name is required" });
      //   if (!billboardId)
      //     return res.status(400).json({ message: "Billboard id is required" });
      //   if (!storeByUserId)
      //     return res.status(405).json({ message: "Unauthorized" });

      //   const createCategory = await caller.categories.createCategory({
      //     storeId: storeId as string,
      //     name,
      //     billboardId,
      //   });
      //   return res.status(200).json(createCategory);

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

export default colorsHandler;
