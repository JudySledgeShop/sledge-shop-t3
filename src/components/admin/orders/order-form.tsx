import { zodResolver } from "@hookform/resolvers/zod";
import {
  type Order,
  type OrderItem,
  type Product,
  type Variation,
} from "@prisma/client";
import { Trash } from "lucide-react";
import { useRouter as useNavigationRouter } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { api } from "~/utils/api";

import { AlertModal } from "~/components/admin/modals/alert-modal";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

import { Label } from "~/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const formSchema = z.object({
  isPaid: z.boolean(),
  phone: z.string().min(9).max(12),
  address: z.string().min(2),
  name: z.string().min(2),
  orderItems: z.array(
    z.object({
      // productId: z.string(),
      variantId: z.union([z.string(), z.null()]),
      // variant: z.any(),
      quantity: z.number().min(0),
      // product: z.object({
      //   name: z.string(),
      //   variants: z.array(
      //     z.object({
      //       id: z.string(),
      //       names: z.string().min(1),
      //       values: z.string().min(1),
      //       price: z.instanceof(Prisma.Decimal),
      //       quantity: z.number().min(1),
      //     })
      //   ),
      // }),
    })
  ),
});

type ColorFormValues = z.infer<typeof formSchema>;

interface ExtendedProduct extends Product {
  variants: Variation[];
}

interface ExtendedOrderItem extends OrderItem {
  product: ExtendedProduct;
  variant: Variation | null;
}

interface FetchedOrder extends Order {
  orderItems: ExtendedOrderItem[];
}
interface OrderFormProps {
  initialData: FetchedOrder | null;
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialData }) => {
  const params = useRouter();
  const router = useNavigationRouter();
  const utils = api.useContext();

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const title = initialData
    ? params.query.mode === "view"
      ? "View order"
      : "Edit order"
    : "Create order";
  const description = initialData
    ? params.query.mode === "view"
      ? "View a order."
      : "Edit a order."
    : "Add a new order";
  const toastMessage = initialData ? "Order updated." : "Order created.";

  const action = initialData
    ? params.query.mode === "view"
      ? "Close"
      : "Save changes"
    : "Create";
  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? {
      isPaid: false,
      phone: "",
      address: "",
      name: "",
      orderItems: [],
    },
  });

  const { mutate: updateOrder } = api.orders.updateOrder.useMutation({
    onSuccess: () => {
      router.push(`/admin/${params.query.storeId as string}/orders`);
      toast.success(toastMessage);
    },
    onError: (error) => {
      toast.error("Something went wrong");
      console.error(error);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
      void utils.orders.getOrder.invalidate();
    },
  });

  const { mutate: createOrder } = api.orders.createOrder.useMutation({
    onSuccess: () => {
      router.push(`/admin/${params.query.storeId as string}/orders`);
      toast.success(toastMessage);
    },
    onError: (error) => {
      toast.error("Something went wrong");
      console.error(error);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
      void utils.orders.getOrder.invalidate();
    },
  });

  const { mutate: deleteOrder } = api.orders.deleteOrder.useMutation({
    onSuccess: () => {
      router.push(`/admin/${params.query.storeId as string}/orders`);
      toast.success("Color deleted.");
    },
    onError: (error) => {
      toast.error(
        "Make sure you removed all order items using this order first."
      );
      console.error(error);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
      setOpen(false);
      void utils.orders.getOrder.invalidate();
    },
  });

  const onSubmit = (data: ColorFormValues) => {
    console.log(data);
    if (params.query.mode === "view") {
      router.push(`/admin/${params.query.storeId as string}/orders`);
      return;
    }
    if (initialData) {
      updateOrder({
        storeId: params?.query?.storeId as string,
        orderId: params?.query?.orderId as string,
        isPaid: data.isPaid,
        phone: data.phone,
        address: data.address,
        name: data.name,
      });
    } else {
      createOrder({
        storeId: params?.query?.storeId as string,
        isPaid: data.isPaid,
        phone: data.phone,
        address: data.address,
        name: data.name,
      });
    }
  };

  const onDelete = () => {
    deleteOrder({
      storeId: params?.query?.storeId as string,
      orderId: params?.query?.orderId as string,
    });
  };

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "orderItems",
  });

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      {params?.query?.mode === "view" ? (
        <>
          <h2>Customer Info</h2>

          {/* {initialData?.} */}
        </>
      ) : (
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="w-full space-y-8"
          >
            <div className="w-full">
              <FormLabel>Customer Info</FormLabel>{" "}
              <FormDescription>
                Edit the customer&apos;s shipping information.
              </FormDescription>
              <div className="my-5 gap-8 md:grid md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Customer Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />{" "}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Phone Number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />{" "}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />{" "}
                <FormField
                  control={form.control}
                  name="isPaid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          disabled={loading}
                          placeholder="Is Order Paid"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Order Paid?</FormLabel>
                        <FormDescription>
                          This marks that the customer successfully paid for the
                          order and awaiting shipment.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />{" "}
              </div>
            </div>
            <div className="w-full">
              <FormField
                control={form.control}
                name="orderItems"
                render={({ field }) => (
                  <>
                    <FormLabel>Order Items</FormLabel>{" "}
                    <FormDescription>
                      Edit the order items of this order. Please note that you
                      may need to collect additional funds from the customer or
                      refund them.
                    </FormDescription>
                    {field.value.length > 0 && (
                      <div className="my-5 max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="">Name</TableHead>
                              <TableHead className="">Variant</TableHead>
                              <TableHead className="">Quantity</TableHead>

                              <TableHead className="text-right">
                                Delete Item
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fields.map((item, index) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Label>
                                    {(item as ExtendedOrderItem).product.name}{" "}
                                  </Label>
                                </TableCell>
                                <TableCell>
                                  <Controller
                                    render={({ field }) => (
                                      <Select
                                        onValueChange={(e) => field.onChange(e)}
                                        defaultValue={
                                          (item as ExtendedOrderItem)
                                            ?.variantId ?? undefined
                                        }
                                      >
                                        <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="No variant selected" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {(
                                            item as ExtendedOrderItem
                                          ).product.variants.map(
                                            (variant, idx) => (
                                              <SelectItem
                                                key={idx}
                                                value={variant.id}
                                                className="flex"
                                              >
                                                {variant.values}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    name={`orderItems.${index}.variantId`}
                                    control={form.control}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Controller
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="number"
                                        defaultValue={
                                          Number(item.quantity) ?? 1
                                        }
                                        onChange={(e) =>
                                          field.onChange(Number(e.target.value))
                                        }
                                      />
                                    )}
                                    name={`orderItems.${index}.quantity`}
                                    control={form.control}
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    onClick={() => remove(index)}
                                    variant="destructive"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              />
            </div>
            <Button disabled={loading} className="ml-auto" type="submit">
              {action}
            </Button>{" "}
          </form>
        </Form>
      )}
    </>
  );
};
