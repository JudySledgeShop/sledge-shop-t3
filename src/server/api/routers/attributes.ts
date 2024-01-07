import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const attributesRouter = createTRPCRouter({
  getAllAttributes: publicProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.attribute.findMany({
        where: {
          storeId: input.storeId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});
