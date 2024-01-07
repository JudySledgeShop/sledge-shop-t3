import { type FC } from "react";

import AdminLayout from "~/layouts/AdminLayout";

interface IProps {
  storeId: string;
}

const ShippingPage: FC<IProps> = ({}) => {
  return (
    <AdminLayout>
      <h1>Shipping Test</h1>
    </AdminLayout>
  );
};

// export async function getServerSideProps(ctx: GetServerSidePropsContext) {
//   const store = await authenticateSession(ctx);

//   if (!store) {
//     return {
//       redirect: {
//         destination: `/admin`,
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {
//       storeId: ctx.query.storeId,
//     },
//   };
// }

export default ShippingPage;
