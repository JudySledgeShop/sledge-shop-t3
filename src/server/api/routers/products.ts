import { type ShippingType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import type { CartItem } from "~/types";

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

  getAllSuggestedProducts: publicProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where: {
          storeId: env.NEXT_PUBLIC_STORE_ID,
          categoryId: input.categoryId,
        },
        include: {
          category: true,
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  // Queries for the admin
  getAllProducts: publicProcedure
    .input(
      z.object({
        storeId: z.string().optional(),
        isFeatured: z.boolean().optional(),
        collectionId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where: {
          storeId: input.storeId ?? env.NEXT_PUBLIC_STORE_ID,
          isFeatured: input.isFeatured ?? undefined,
          collections: input.collectionId
            ? {
                some: {
                  id: input.collectionId ?? undefined,
                },
              }
            : {},
        },
        include: {
          images: true,
          variants: true,
          category: {
            include: {
              attributes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(({ ctx, input }) => {
      if (!input.productId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product id is required",
        });
      }

      return ctx.prisma.product.findUnique({
        where: {
          id: input.productId,
        },
        include: {
          images: true,
          variants: true,
          category: {
            include: {
              attributes: true,
            },
          },
        },
      });
    }),

  getCartProducts: publicProcedure
    .input(
      z.object({
        products: z.array(
          z.object({
            productId: z.string(),
            variantId: z.string().nullish(),
            quantity: z.number(),
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      // const productIds = input.products.map((product) => product.productId);

      // Fetch all unique product IDs and variant IDs from the cart items
      const productIds = [
        ...new Set(input.products.map((item) => item.productId)),
      ];
      const variantIds = [
        ...new Set(
          input.products
            .filter((item) => item.variantId !== null)
            .map((item) => item.variantId!)
        ),
      ];

      // Fetch all products and variants in one go
      const [products, variants] = await Promise.all([
        ctx.prisma.product.findMany({
          where: { id: { in: productIds } },
          include: {
            images: true,
            variants: true,
            category: {
              include: {
                attributes: true,
              },
            },
          },
        }),
        ctx.prisma.variation.findMany({
          where: { id: { in: variantIds } },
        }),
      ]);

      const detailedCartItems = input.products.map((cartItem) => ({
        product: products.find((p) => p.id === cartItem.productId),
        variant: cartItem.variantId
          ? variants.find((v) => v.id === cartItem.variantId)
          : null,
        quantity: cartItem.quantity,
      })) as CartItem[];

      return detailedCartItems;
    }),

  getDetailedProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(({ ctx, input }) => {
      if (!input.productId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product id is required",
        });
      }

      return ctx.prisma.product.findUnique({
        where: {
          id: input.productId,
        },
        include: {
          images: true,
          variants: true,
          category: true,
        },
      });
    }),

  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        categoryId: z.string(),

        description: z.string().optional(),
        quantity: z.number(),
        storeId: z.string(),
        isFeatured: z.boolean().optional(),
        isArchived: z.boolean().optional(),
        shippingCost: z.coerce.number().min(0).optional(),
        shippingType: z.enum([
          "FLAT_RATE" as ShippingType,
          "FREE" as ShippingType,
          "VARIABLE" as ShippingType,
        ]),
        weight: z.coerce.number().min(0).optional(),
        length: z.coerce.number().min(0).optional(),
        width: z.coerce.number().min(0).optional(),
        height: z.coerce.number().min(0).optional(),
        estimatedCompletion: z.coerce.number().min(0).optional(),
        images: z.array(
          z.object({
            url: z.string(),
          })
        ),
        variants: z.array(
          z.object({
            names: z.string(),
            values: z.string(),
            price: z.number(),
            quantity: z.number(),
          })
        ),
      })
    )
    .mutation(({ ctx, input }) => {
      if (!input.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required",
        });
      }

      if (!input.price) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Price is required",
        });
      }

      if (!input.categoryId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category id is required",
        });
      }

      if (!input.storeId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Store id is required",
        });
      }

      if (!input.images ?? !input.images.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Images is required",
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
              message: "Product id does not belong to current user",
            });
          }
        })
        .then(() => {
          return ctx.prisma.product.create({
            data: {
              name: input.name,
              price: input.price,
              isFeatured: input.isFeatured,
              isArchived: input.isArchived,
              categoryId: input.categoryId,

              estimatedCompletion: input.estimatedCompletion ?? 0,
              storeId: input.storeId,
              images: {
                createMany: {
                  data: [
                    ...input.images.map((image: { url: string }) => image),
                  ],
                },
              },
              variants: {
                createMany: {
                  data: [
                    ...input.variants.map(
                      (variant: {
                        names: string;
                        values: string;
                        price: number;
                        quantity: number;
                      }) => variant
                    ),
                  ],
                },
              },
              shippingCost: input.shippingCost,
              shippingType: input.shippingType,
              weight: input.weight,
              length: input.length,
              width: input.width,
              height: input.height,
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

  updateProduct: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        categoryId: z.string(),
        estimatedCompletion: z.coerce.number().min(0).optional(),
        storeId: z.string(),
        isFeatured: z.boolean().optional(),
        isArchived: z.boolean().optional(),
        description: z.string().optional(),
        quantity: z.number(),
        images: z.array(
          z.object({
            url: z.string(),
          })
        ),
        variants: z.array(
          z.object({
            names: z.string(),
            values: z.string(),
            price: z.number(),
            quantity: z.number(),
          })
        ),
        shippingCost: z.coerce.number().min(0).optional(),
        shippingType: z.enum([
          "FLAT_RATE" as ShippingType,
          "FREE" as ShippingType,
          "VARIABLE" as ShippingType,
        ]),
        weight: z.coerce.number().min(0).optional(),
        length: z.coerce.number().min(0).optional(),
        width: z.coerce.number().min(0).optional(),
        height: z.coerce.number().min(0).optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (!input.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required",
        });
      }

      if (!input.price) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Price is required",
        });
      }

      if (!input.categoryId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category id is required",
        });
      }

      if (!input.storeId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Store id is required",
        });
      }

      if (!input.images?.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Images is required",
        });
      }

      // if (!input.variants || !input.variants.length) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Variants is required",
      //   });
      // }

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
              message: "Product id does not belong to current user",
            });
          }
        })
        .then(() => {
          return ctx.prisma.product
            .update({
              where: {
                id: input.productId,
              },
              data: {
                name: input.name,
                price: input.price,
                isFeatured: input.isFeatured,
                isArchived: input.isArchived,
                categoryId: input.categoryId,
                estimatedCompletion: input.estimatedCompletion ?? 0,
                description: input.description,
                quantity: input.quantity,
                images: {
                  deleteMany: {},
                },
                variants: {
                  deleteMany: {},
                },
                shippingCost: input.shippingCost,
                shippingType: input.shippingType,
                weight: input.weight,
                length: input.length,
                width: input.width,
                height: input.height,
              },
            })
            .then(() => {
              return ctx.prisma.product.update({
                where: {
                  id: input.productId,
                },
                data: {
                  images: {
                    createMany: {
                      data: [
                        ...input.images.map((image: { url: string }) => image),
                      ],
                    },
                  },
                  variants: {
                    createMany: {
                      data: [
                        ...input.variants.map(
                          (variant: {
                            names: string;
                            values: string;
                            price: number;
                            quantity: number;
                          }) => variant
                        ),
                      ],
                    },
                  },
                },
              });
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
  deleteProduct: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        storeId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (!input.productId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product id is required",
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
              message: "Product id does not belong to current user",
            });
        })
        .then(() => {
          return ctx.prisma.product.delete({
            where: {
              id: input.productId,
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
