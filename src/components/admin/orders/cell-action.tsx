"use client";

import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter as useNavigationRouter } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AlertModal } from "~/components/admin/modals/alert-modal";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { useShippingModal } from "~/hooks/admin/use-shipping-modal";
import { api } from "~/utils/api";
import type { OrderColumn } from "./columns";

interface CellActionProps {
  data: OrderColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useNavigationRouter();
  const shippingModal = useShippingModal();
  const params = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { mutate: deleteOrder } = api.orders.deleteOrder.useMutation({
    onSuccess: () => {
      router.refresh();
      toast.success("Order deleted.");
    },
    onError: (error) => {
      toast.error(
        "Make sure you removed all orderItems using this order first."
      );
      console.error(error);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
      setOpen(false);
    },
  });

  const onConfirm = () => {
    deleteOrder({
      storeId: params?.query?.storeId as string,
      orderId: data.id,
    });
  };

  const onCopy = (id: string) => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        toast.success("Order ID copied to clipboard.");
      })
      .catch(() => {
        toast.error("Failed to copy order ID to clipboard.");
      });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" /> Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/admin/${params.query.storeId as string}/orders/${data.id}`
              )
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          {data?.isPaid && (
            <DropdownMenuItem onClick={() => shippingModal.onOpen(data)}>
              <Edit className="mr-2 h-4 w-4" />{" "}
              {data?.labelCreated ? "Download" : "Create"} label
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
