import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const shippingLabelRouter = createTRPCRouter({
  createLabel: protectedProcedure
    .input(
      z.object({
        labelUrl: z.string(),
        trackingNumber: z.string(),
        cost: z.string(),
        carrier: z.string(),
        timeEstimate: z.string(),
        expireAt: z.date().optional(),
        orderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.labelUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "labelUrl is required",
        });
      }

      const label = await ctx.prisma.shippingLabel.create({
        data: {
          labelUrl: input.labelUrl,
          trackingNumber: input.trackingNumber,
          cost: input.cost,
          carrier: input.carrier,
          timeEstimate: input.timeEstimate,
          expireAt: input.expireAt,
          order: {
            connect: {
              id: input.orderId,
            },
          },
        },
      });

      return label;
    }),

  // getLabel: protectedProcedure
  //     .input(z.object({ labelId: z.string() }))
  //     .query(async ({ ctx, input }) => {
  //       if (!input.labelId)
  //         throw new TRPCError({
  //           code: "BAD_REQUEST",
  //           message: "Label id is required",
  //         });

  //       return ctx.prisma.shippingLabel.findUnique({
  //         where: { id: input.labelId },
  //       });
  //     }),

  //   getSecretMessage: protectedProcedure.query(() => {
  //     return "you can now see this secret message!";
  //   }),
});
