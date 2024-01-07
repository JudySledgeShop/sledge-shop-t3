import { useRouter as useNavigationRouter } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "react-hot-toast";

import { AlertModal } from "~/components/admin/modals/alert-modal";
import { Button } from "~/components/ui/button";
import * as Dropdown from "~/components/ui/dropdown-menu";

import { api } from "~/utils/api";

import type { BillboardColumn } from "./columns";

interface CellActionProps {
  data: BillboardColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const params = useRouter();
  const router = useNavigationRouter();

  const { storeId } = params.query as { storeId: string };
  const billboardId = data.id;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { mutate: deleteBillboard } =
    api.billboards.deleteBillboard.useMutation({
      onSuccess: () => {
        router.refresh();
        toast.success("Billboard deleted.");
      },
      onError: (error) => {
        toast.error(
          "Make sure you removed all categories using this billboard first."
        );
        console.error(error);
      },
      onMutate: () => setLoading(true),
      onSettled: () => {
        setLoading(false);
        setOpen(false);
      },
    });

  const onConfirm = () => deleteBillboard({ storeId, billboardId });
  const onDeleteSelection = () => setOpen(true);
  const onUpdateSelection = () =>
    router.push(`/admin/${storeId}/billboards/${billboardId}`);

  const onCopySelection = () => {
    navigator.clipboard
      .writeText(billboardId)
      .then(() => toast.success("Billboard ID copied to clipboard."))
      .catch(() => toast.error("Failed to copy billboard ID to clipboard."));
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <Dropdown.DropdownMenu>
        <Dropdown.DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </Dropdown.DropdownMenuTrigger>
        <Dropdown.DropdownMenuContent align="end">
          <Dropdown.DropdownMenuLabel>Actions</Dropdown.DropdownMenuLabel>
          <Dropdown.DropdownMenuItem onClick={onCopySelection}>
            <Copy className="mr-2 h-4 w-4" /> Copy Id
          </Dropdown.DropdownMenuItem>
          <Dropdown.DropdownMenuItem onClick={onUpdateSelection}>
            <Edit className="mr-2 h-4 w-4" /> Update
          </Dropdown.DropdownMenuItem>
          <Dropdown.DropdownMenuItem onClick={onDeleteSelection}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Dropdown.DropdownMenuItem>
        </Dropdown.DropdownMenuContent>
      </Dropdown.DropdownMenu>
    </>
  );
};
