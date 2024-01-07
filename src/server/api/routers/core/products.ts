import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import {
  extractQueryString,
  filterProductsByVariants,
} from "~/utils/filtering";

export const productsRouter = createTRPCRouter({
  // Queries for the frontend
  getAllStoreProducts: publicProcedure
    .input(
      z.object({
        isFeatured: z.boolean().optional(),
        queryString: z.string().optional(),
        categoryId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = extractQueryString(input.queryString ?? "");

      const products = await ctx.prisma.product.findMany({
        where: {
          storeId: env.NEXT_PUBLIC_STORE_ID,
          isFeatured: input.isFeatured,
          categoryId: input.categoryId,
        },
        include: {
          category: {
            include: {
              attributes: true,
            },
          },
          variants: true,
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const filteredProducts = filterProductsByVariants(
        products,
        results.names,
        results.values
      );

      return input.queryString ? filteredProducts : products;
    }),
});
