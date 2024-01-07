import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const emailRouter = createTRPCRouter({
  // Queries for the frontend
  sendEmailInquiry: publicProcedure
    .input(
      z.object({
        body: z.string(),
        name: z.string(),
        email: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const req = await fetch(`${env.NEXT_PUBLIC_API_URL}/email/inquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const res = await req.json();

      if (res?.statusCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: res.message,
        });
      }

      return res;
    }),
});
