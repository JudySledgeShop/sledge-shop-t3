import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { env } from "~/env.mjs";

import { prisma } from "~/server/db";
import { stripe } from "~/server/stripe/client";

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

const handleStripeWebhookEvent = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig as string,
        webhookSecret
      );

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;

          const address = session?.customer_details?.address;
          const name = session?.customer_details?.name;

          const addressComponents = [
            address?.line1,
            address?.line2,
            address?.city,
            address?.state,
            address?.postal_code,
            address?.country,
          ];
          const addressString = addressComponents
            .filter((c) => c !== null)
            .join(", ");

          console.log(addressString);

          const order = await prisma.order.update({
            where: {
              id: session?.metadata?.orderId,
            },
            data: {
              isPaid: true,
              address: addressString,
              phone: session?.customer_details?.phone ?? "",
              name: name ?? "",
            },
            include: {
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

          order.orderItems.map(async (orderItem) => {
            if (!orderItem.variantId) {
              await prisma.product
                .update({
                  where: {
                    id: orderItem.productId,
                  },
                  data: {
                    quantity:
                      orderItem.product.quantity - orderItem.quantity < 0
                        ? 0
                        : orderItem.product.quantity - orderItem.quantity,
                  },
                })
                .then((res) => {
                  if (res.quantity <= 0) {
                    return prisma.product.update({
                      where: {
                        id: orderItem.productId,
                      },
                      data: {
                        isArchived: true,
                      },
                    });
                  }
                });
            } else if (orderItem.variantId && orderItem.variant) {
              await prisma.variation.update({
                where: {
                  id: orderItem.variantId,
                },
                data: {
                  quantity:
                    orderItem.variant.quantity - orderItem.quantity < 0
                      ? 0
                      : orderItem.variant.quantity - orderItem.quantity,
                },
              });
              const variants = await prisma.variation.findMany({
                where: {
                  id: {
                    in: [...orderItem.product.variants.map((v) => v.id)],
                  },
                },
              });

              const hasValidItems = variants.some(
                (variant) => variant.quantity > 0
              );

              if (!hasValidItems) {
                return prisma.product.update({
                  where: {
                    id: orderItem.productId,
                  },
                  data: {
                    isArchived: true,
                  },
                });
              }
            }
          });
          console.log(`Payment successful for session ID: ${session.id}`);
          break;

        default:
          console.warn(`Unhandled event type: ${event.type}`);
        // Unexpected event type
      }

      res.json({ received: true });
    } catch (err) {
      res.status(400).send(err);
      return;
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
export default handleStripeWebhookEvent;
