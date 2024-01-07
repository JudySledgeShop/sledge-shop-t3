import { useRouter as useNavigationRouter } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Billboard } from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { AlertModal } from "~/components/admin/modals/alert-modal";
import { Button } from "~/components/ui/button";
import * as Form from "~/components/ui/form";
import { Heading } from "~/components/ui/heading";
import ImageUpload from "~/components/ui/image-upload";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

import { api } from "~/utils/api";

const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1),
  description: z.string().optional(),
});

type BillboardFormValues = z.infer<typeof formSchema>;

interface BillboardFormProps {
  initialData: Billboard | null;
}

export const BillboardForm: React.FC<BillboardFormProps> = ({
  initialData,
}) => {
  const params = useRouter();
  const router = useNavigationRouter();
  const apiContext = api.useContext();

  const { storeId, billboardId } = params.query as {
    storeId: string;
    billboardId: string;
  };

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit billboard" : "Create billboard";
  const description = initialData ? "Edit a billboard." : "Add a new billboard";
  const toastMessage = initialData
    ? "Billboard updated."
    : "Billboard created.";

  const action = initialData ? "Save changes" : "Create";

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: initialData?.label ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      description: initialData?.description ?? undefined,
    },
  });

  const onMutateSuccess = () => {
    router.push(`/admin/${storeId}/billboards`);
    toast.success(toastMessage);
  };

  const onMutateError = (error: unknown) => {
    toast.error("Something went wrong");
    console.error(error);
  };

  const { mutate: updateBillboard } =
    api.billboards.updateBillboard.useMutation({
      onSuccess: onMutateSuccess,
      onError: onMutateError,
      onMutate: () => setLoading(true),
      onSettled: () => {
        setLoading(false);
        void apiContext.billboards.getBillboard.invalidate();
      },
    });

  const { mutate: createBillboard } =
    api.billboards.createBillboard.useMutation({
      onSuccess: onMutateSuccess,
      onError: onMutateError,
      onMutate: () => setLoading(true),
      onSettled: () => setLoading(false),
    });

  const { mutate: deleteBillboard } =
    api.billboards.deleteBillboard.useMutation({
      onSuccess: () => {
        router.push(`/admin/${storeId}/billboards`);
        toast.success("Billboards deleted.");
      },
      onError: (error) => {
        toast.error(
          "Make sure you removed all products using this billboards first."
        );
        console.error(error);
      },
      onMutate: () => setLoading(true),
      onSettled: () => {
        setLoading(false);
        setOpen(false);
      },
    });

  const onSubmit = (data: BillboardFormValues) => {
    if (initialData) {
      updateBillboard({
        storeId,
        billboardId,
        label: data.label,
        imageUrl: data.imageUrl,
        description: data?.description ?? undefined,
      });
    } else {
      createBillboard({
        storeId,
        label: data.label,
        imageUrl: data.imageUrl,
        description: data?.description,
      });
    }
  };
  const onDelete = () => deleteBillboard({ storeId, billboardId });

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
      <Form.Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          className="w-full space-y-8"
        >
          <Form.FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <Form.FormItem>
                <Form.FormLabel>Background image</Form.FormLabel>
                <Form.FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </Form.FormControl>
                <Form.FormMessage />
              </Form.FormItem>
            )}
          />
          <div className="gap-8 md:grid md:grid-cols-3">
            <Form.FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <Form.FormItem>
                  <Form.FormLabel>Label</Form.FormLabel>
                  <Form.FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Billboard label"
                      {...field}
                    />
                  </Form.FormControl>
                  <Form.FormMessage />
                </Form.FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-3">
            <Form.FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.FormItem>
                  <Form.FormLabel>Description</Form.FormLabel>
                  <Form.FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Billboard description"
                      {...field}
                    />
                  </Form.FormControl>
                  <Form.FormMessage />
                </Form.FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form.Form>
    </>
  );
};
