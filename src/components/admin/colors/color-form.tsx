import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useRouter as useNavigationRouter } from "next/navigation";
import { useRouter } from "next/router";
import {
  useEffect,
  useState,
  type MouseEvent,
  type MouseEventHandler,
} from "react";
import { TwitterPicker } from "react-color";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import type { Color } from "@prisma/client";

import { api } from "~/utils/api";

import { AlertModal } from "~/components/admin/modals/alert-modal";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(2),
  value: z.string().min(4).max(9).regex(/^#/, {
    message: "String must be a valid hex code",
  }),
});

type ColorFormValues = z.infer<typeof formSchema>;

interface ColorFormProps {
  initialData: Color | null;
}

export const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {
  const params = useRouter();
  const router = useNavigationRouter();
  const utils = api.useContext();

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);

  const title = initialData ? "Edit color" : "Create color";
  const description = initialData ? "Edit a color." : "Add a new color";
  const toastMessage = initialData ? "Color updated." : "Color created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? {
      name: "",
      value: "",
    },
  });

  const { mutate: patchColor } = api.colors.updateColor.useMutation({
    onSuccess: () => {
      router.push(`/admin/${params.query.storeId as string}/colors`);
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
      void utils.colors.getColor.invalidate();
    },
  });

  const { mutate: createColor } = api.colors.createColor.useMutation({
    onSuccess: () => {
      router.push(`/admin/${params.query.storeId as string}/colors/`);
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
      void utils.colors.getColor.invalidate();
    },
  });

  const { mutate: deleteColor } = api.colors.deleteColor.useMutation({
    onSuccess: () => {
      router.push(`/admin/${params.query.storeId as string}/colors`);
      toast.success("Color deleted.");
    },
    onError: (error) => {
      toast.error("Make sure you removed all products using this color first.");
      console.error(error);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
      setOpen(false);
      void utils.colors.getColor.invalidate();
    },
  });

  const onSubmit = (data: ColorFormValues) => {
    if (initialData) {
      patchColor({
        storeId: params?.query?.storeId as string,
        colorId: params?.query?.colorId as string,
        name: data.name,
        value: data.value,
      });
    } else {
      createColor({
        storeId: params?.query?.storeId as string,
        name: data.name,
        value: data.value,
      });
    }
  };

  const onDelete = () => {
    deleteColor({
      storeId: params?.query?.storeId as string,
      colorId: params?.query?.sizeId as string,
    });
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDisplayColorPicker(false);
  };

  useEffect(() => {
    if (initialData) setSelectedColor(initialData.value);
  }, [open, initialData]);
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
      <Form {...form}>
        <form
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          className="w-full space-y-8"
        >
          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Color name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-x-4">
                      <Input
                        disabled={loading}
                        placeholder="Color value"
                        {...field}
                      />
                      <button
                        className="aspect-square rounded-full border  p-4 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        style={{ backgroundColor: field.value }}
                        onClick={handleClick}
                        aria-label="Pick Color"
                      ></button>
                      {displayColorPicker && (
                        <div className="absolute z-10 mt-2">
                          <div
                            className="fixed inset-0"
                            onClick={handleClose as MouseEventHandler}
                          />
                          <TwitterPicker
                            color={selectedColor}
                            onChangeComplete={(color) => {
                              setSelectedColor(color.hex);
                              form.setValue("value", color.hex);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
