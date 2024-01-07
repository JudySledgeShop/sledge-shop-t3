import type { Role } from "@prisma/client";

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  updateRole: protectedProcedure
    .input(z.enum(["USER", "ADMIN", "BUSINESS_OWNER"]))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          role: input as Role,
        },
      });
    }),
});
