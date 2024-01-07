import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { type NextApiRequest, type NextApiResponse } from "next";

import { createTRPCContext } from "~/server/api/trpc";

const productsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create context and caller
  const ctx = await createTRPCContext({ req, res });

  const { storeId } = req.query;

  try {
    switch (req.method) {
      case "GET":
        if (!storeId)
          return res.status(400).json({ message: "Store id is required" });

        const categoryId = req.query.categoryId;
        const isFeatured = req.query.isFeatured;
        const collectionId = req.query.collectionId;

        const allProducts = await ctx.prisma.product.findMany({
          where: {
            storeId: storeId as string,
            categoryId: categoryId ? (categoryId as string) : undefined,
            collections: {
              some: {
                id: collectionId ? (collectionId as string) : undefined,
              },
            },
            isFeatured: isFeatured ? isFeatured === "true" : undefined,
            isArchived: false,
          },
          include: {
            images: true,
            category: {
              include: {
                attributes: true,
              },
            },
            variants: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return res.status(200).json(allProducts);

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

export default productsHandler;
