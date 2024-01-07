import type { OrderItem } from "@prisma/client";
import Image from "next/image";
import { api } from "~/utils/api";

const ItemDetailsCard = ({ item }: { item: OrderItem }) => {
  const { data: product } = api.products.getDetailedProduct.useQuery({
    productId: item?.productId,
  });

  if (!product) return null;
  return (
    <TableRow key={item.productId}>
      <TableCell className="font-medium">
        {" "}
        <div className="h-12 w-12">
          <Image
            src={product?.images[0]?.url ?? ""}
            alt={product.name}
            layout="responsive"
            width={48}
            height={48}
            objectFit="contain"
          />
        </div>
      </TableCell>
      <TableCell>{product.name}</TableCell> <TableCell></TableCell>
      <TableCell>1</TableCell>
      <TableCell>${product.price.toString()}</TableCell>{" "}
      <TableCell className="text-right">
        ${(product.price * 0.06).toString()}
      </TableCell>
    </TableRow>

    // <div className="space-s-4 flex items-center justify-between">
    //   <div className="space-s-2 flex items-center">
    //     <div className="h-12 w-12">
    //       <Image
    //         src={product.images?.[0].url}
    //         alt={product.name}
    //         layout="responsive"
    //         width={48}
    //         height={48}
    //         objectFit="contain"
    //       />
    //     </div>

    //     <div className="flex flex-col">
    //       <span className="text-heading text-sm font-semibold">
    //         {product.name}
    //       </span>
    //       <span className="text-body text-sm">
    //         {1} x {product.price.toString()}
    //       </span>
    //     </div>
    //   </div>

    //   {/* <span className="text-body text-sm">{item.total}</span> */}
    // </div>
  );
};

export { ItemDetailsCard };

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function ItemDetailsCardGrid({ items }: { items: OrderItem[] }) {
  return (
    <Card>
      {" "}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Item Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of items for this order.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Item</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>{" "}
              <TableHead className="text-right">MI Tax</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <ItemDetailsCard item={item} key={item.id} />
            ))}
          </TableBody>
        </Table>{" "}
      </CardContent>
    </Card>
  );
}
