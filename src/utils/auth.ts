import type { GetServerSidePropsContext } from "next";

import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

export const authenticateSession = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const userId = session.user.id;

  const store = await prisma.store.findFirst({
    where: {
      id: ctx.query.storeId as string,
      userId,
    },
  });

  return store;
};

// export const authenticateStaticSession = async (ctx: GetStaticPropsContext) => {
//   const session = await getSession();

//   if (!session || !session.user) {
//     return {
//       redirect: {
//         destination: "/auth/signin",
//         permanent: false,
//       },
//     };
//   }

//   const userId = session.user.id;

//   const store = await prisma.store.findFirst({
//     where: {
//       id: ctx.query.storeId as string,
//       userId,
//     },
//   });

//   return store;
// };
