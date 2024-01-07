import { format } from "date-fns";
import { useCallback, useEffect, useState, type FC } from "react";

import type { GetServerSidePropsContext } from "next";
import type { OrderColumn } from "~/components/admin/orders/columns";

import { api } from "~/utils/api";
import { authenticateSession } from "~/utils/auth";
import { formatter } from "~/utils/styles";

import { OrderClient } from "~/components/admin/orders/client";
import PageLoader from "~/components/ui/page-loader";
import AdminLayout from "~/layouts/AdminLayout";
import type { DetailedOrder } from "~/types";

interface IProps {
  storeId: string;
}

const OrdersPage: FC<IProps> = ({ storeId }) => {
  const [formattedOrders, setFormattedOrders] = useState<OrderColumn[]>([]);
  const { data: orders } = api.orders.getAllOrders.useQuery({
    storeId,
  });

  const formatOrders = useCallback((orders: DetailedOrder[]) => {
    return orders.map((item: DetailedOrder) => ({
      id: item.id,
      phone: item.phone,
      name: item.name,
      address: item.address,
      products: item.orderItems
        .map((orderItem) => orderItem.product.name)
        .join(", "),
      totalPrice: formatter.format(
        item.orderItems.reduce((total, item) => {
          return total + Number(item.product.price);
        }, 0)
      ),
      isPaid: item.isPaid,
      labelCreated: item.shippingLabel?.labelUrl ? true : false,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));
  }, []);

  useEffect(() => {
    if (orders) setFormattedOrders(formatOrders(orders) as OrderColumn[]);
  }, [orders, formatOrders]);

  return (
    <AdminLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          {!orders && <PageLoader />}
          {orders && <OrderClient data={formattedOrders} />}
        </div>
      </div>
    </AdminLayout>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const store = await authenticateSession(ctx);

  if (!store) {
    return {
      redirect: {
        destination: `/admin`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      storeId: ctx.query.storeId,
    },
  };
}

export default OrdersPage;
