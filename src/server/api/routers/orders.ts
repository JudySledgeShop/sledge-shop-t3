import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const ordersRouter = createTRPCRouter({
  getAllOrders: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.order.findMany({
        where: {
          storeId: input.storeId,
        },
        include: {
          orderItems: {
            include: {
              product: true,
              variant: true,
            },
          },
          shippingLabel: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  getOrder: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(({ ctx, input }) => {
      if (!input.orderId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "orderId is required",
        });
      }

      return ctx.prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
        include: {
          shippingLabel: true,
          orderItems: {
            include: {
              variant: true,
              product: {
                include: {
                  variants: true,
                },
              },
            },
          },
        },
      });
    }),
  createOrder: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        isPaid: z.boolean().optional(),
        phone: z.string(),
        address: z.string(),
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (!input.phone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required",
        });
      }

      if (!input.address) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Value is required",
        });
      }

      return ctx.prisma.store
        .findFirst({
          where: {
            id: input.storeId,
            userId: ctx.session.user.id,
          },
        })
        .then((storeByUserId) => {
          if (!storeByUserId) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Size id does not belong to current user",
            });
          }
        })
        .then(() => {
          return ctx.prisma.order.create({
            data: {
              storeId: input.storeId,
              isPaid: input.isPaid,
              address: input.address,
              phone: input.phone,
              name: input.name,
            },
          });
        })
        .catch((err) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong. Please try again later.",
            cause: err,
          });
        });
    }),

  updateOrder: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        orderId: z.string(),
        isPaid: z.boolean().optional(),
        phone: z.string(),
        address: z.string(),
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (!input.orderId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "order Id is required",
        });

      if (!input.phone)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "phone is required",
        });

      if (!input.address)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Address is required",
        });

      return ctx.prisma.store
        .findFirst({
          where: {
            id: input.storeId,
            userId: ctx.session.user.id,
          },
        })
        .then((storeByUserId) => {
          if (!storeByUserId)
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Order id does not belong to current user",
            });
        })
        .then(() => {
          return ctx.prisma.order.update({
            where: {
              id: input.orderId,
            },
            data: {
              isPaid: input.isPaid,
              address: input.address,
              phone: input.phone,
              name: input.name,
            },
          });
        })
        .catch((err) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong. Please try again later.",
            cause: err,
          });
        });
    }),

  deleteOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        storeId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (!input.orderId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "orderId is required",
        });

      return ctx.prisma.store
        .findFirst({
          where: {
            id: input.storeId,
            userId: ctx.session.user.id,
          },
        })
        .then((storeByUserId) => {
          if (!storeByUserId)
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Order id does not belong to current user",
            });
        })
        .then(() => {
          return ctx.prisma.order.delete({
            where: {
              id: input.orderId,
            },
          });
        })
        .catch((err) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong. Please try again later.",
            cause: err,
          });
        });
    }),
});
