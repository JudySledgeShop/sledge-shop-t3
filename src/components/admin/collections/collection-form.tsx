import { zodResolver } from "@hookform/resolvers/zod";
import type { Billboard, Product } from "@prisma/client";
import { Command as CommandPrimitive } from "cmdk";
import { Trash, X } from "lucide-react";
import { useRouter as useNavigationRouter } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
import { AlertModal } from "~/components/admin/modals/alert-modal";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Command, CommandGroup, CommandItem } from "~/components/ui/command";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import type { DetailedCollection } from "~/types";
import { api } from "~/utils/api";

const formSchema = z.object({
  name: z.string().min(2),
  billboardId: z.string().min(1),
  isFeatured: z.boolean().default(false),
  products: z.array(
    z.object({
      id: z.string(),
    })
  ),
});

type CollectionFormValues = z.infer<typeof formSchema>;

interface CollectionFormProps {
  initialData: DetailedCollection | null;
  products: Product[];
  billboards: Billboard[];
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  initialData,
  products,
  billboards,
}) => {
  const params = useRouter();
  const router = useNavigationRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit collection" : "Create collection";
  const description = initialData
    ? "Edit a collection."
    : "Add a new collection";
  const toastMessage = initialData
    ? "Collection updated."
    : "Collection created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      billboardId: initialData?.billboardId ?? undefined,
      products: initialData?.products ?? [],
    },
  });

  const apiContext = api.useContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const [productsOpen, setProductsOpen] = useState(false);

  const [inputValue, setInputValue] = useState("");

  const handleUnselect = useCallback((product: Product) => {
    const current = form
      .getValues("products")
      .filter((s) => s.id !== product.id);
    form.setValue("products", current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            const newSelected = [...form.getValues("products")];
            newSelected.pop();

            form.setValue("products", newSelected);
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const selectables = products.filter(
    (product) => !form.getValues("products").includes(product)
  );

  const { mutate: updateCollection } =
    api.collections.updateCollection.useMutation({
      onSuccess: () => {
        router.push(`/admin/${params.query.storeId as string}/collections`);
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
        void apiContext.collections.getCollection.invalidate();
      },
    });

  const { mutate: createCollection } =
    api.collections.createCollection.useMutation({
      onSuccess: () => {
        router.push(`/admin/${params.query.storeId as string}/collections/`);
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
      },
    });

  const { mutate: deleteCollection } =
    api.collections.deleteCollection.useMutation({
      onSuccess: () => {
        router.push(`/admin/${params.query.storeId as string}/collections`);
        toast.success("Collection deleted.");
      },
      onError: (error) => {
        toast.error(
          "Make sure you removed all products using this color first."
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

  const onSubmit = (data: CollectionFormValues) => {
    if (initialData) {
      updateCollection({
        storeId: params?.query?.storeId as string,
        billboardId: data.billboardId,
        isFeatured: data.isFeatured,
        name: data.name,
        collectionId: params?.query?.collectionId as string,
        products: data.products,
      });
    } else {
      createCollection({
        storeId: params?.query?.storeId as string,
        isFeatured: data.isFeatured,
        name: data.name,
        billboardId: data.billboardId,
        products: data.products,
      });
    }
  };

  const onDelete = () => {
    deleteCollection({
      storeId: params?.query?.storeId as string,
      collectionId: params?.query?.collectionId as string,
    });
  };

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
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
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
                      placeholder="Collection name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a billboard"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((billboard) => (
                        <SelectItem key={billboard.id} value={billboard.id}>
                          {billboard.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      This collection will be featured on the homepage (first
                      three) as well as in the navbar.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products</FormLabel>
                  <FormControl>
                    <Command
                      onKeyDown={handleKeyDown}
                      className="overflow-visible bg-transparent"
                    >
                      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <div className="flex flex-wrap gap-1">
                          {field.value.map((product) => {
                            return (
                              <Badge
                                key={(product as Product).name}
                                variant="secondary"
                              >
                                {(product as Product).name}
                                <button
                                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  aria-label={(product as Product).name}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleUnselect(product as Product);
                                    }
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={() =>
                                    handleUnselect(product as Product)
                                  }
                                >
                                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                              </Badge>
                            );
                          })}
                          {/* Avoid having the "Search" Icon */}
                          <CommandPrimitive.Input
                            ref={inputRef}
                            value={inputValue}
                            onValueChange={setInputValue}
                            onBlur={() => setProductsOpen(false)}
                            onFocus={() => setProductsOpen(true)}
                            placeholder={
                              products.length === 0
                                ? "Add some products first."
                                : "Select products..."
                            }
                            disabled={products.length === 0}
                            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                      </div>
                      <div className="relative mt-2">
                        {productsOpen && selectables.length > 0 ? (
                          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                            <CommandGroup className="h-full overflow-auto">
                              {selectables.map((product) => {
                                return (
                                  <CommandItem
                                    key={product.name}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    onSelect={() => {
                                      setInputValue("");
                                      form.setValue("products", [
                                        ...field.value,
                                        product,
                                      ]);
                                    }}
                                    className={"cursor-pointer"}
                                  >
                                    {product.name}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </div>
                        ) : null}
                      </div>
                    </Command>
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
