import { zodResolver } from "@hookform/resolvers/zod";

import { CheckIcon, ChevronsUpDown, Loader2 } from "lucide-react";

import { useState, type FC } from "react";
import { useForm } from "react-hook-form";

import * as z from "zod";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import USA_STATES from "~/data/states";
import useShippingLabel, {
  type ShippingResponse,
} from "~/hooks/admin/use-shipping-label";

import { cn } from "~/utils/styles";

const shippingFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  street: z.string(),
  additional: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zip: z.coerce.number(),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

type TInitialData = {
  name: string | undefined;
  street: string | undefined;
  additional?: string | undefined;
  city: string | undefined;
  state: string | undefined;
  zip: string | undefined;
};

type AddressFormProps = {
  initialData?: TInitialData | null;
  successCallback: (data?: unknown) => void;
  errorCallback: (data?: unknown) => void;
};
const AddressForm: FC<AddressFormProps> = ({
  successCallback,
  errorCallback,
  initialData,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { validateAddress } = useShippingLabel();

  const defaultValues: Partial<ShippingFormValues> = {
    name: initialData?.name ?? undefined,
    street: initialData?.street ?? undefined,
    additional: initialData?.additional ?? undefined,
    city: initialData?.city ?? undefined,
    state: initialData?.state ?? undefined,
    zip: Number(initialData?.zip) ?? 0,
  };

  const shippingForm = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues,
  });

  const onAddressSubmit = (data: ShippingFormValues) => {
    setLoading(true);

    validateAddress({
      name: data.name,
      street: data.street,
      additional: data.additional,
      city: data.city,
      state: data.state,
      zip: data.zip.toString(),
    })
      .then((res: ShippingResponse) => {
        if (res.isValid) successCallback(data);
        else errorCallback();
      })
      .catch((err) => {
        console.error(err);
        errorCallback(err);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Form {...shippingForm}>
      <form
        onSubmit={(e) => void shippingForm.handleSubmit(onAddressSubmit)(e)}
        className="space-y-8"
      >
        <FormField
          control={shippingForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={shippingForm.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street address</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 1234 Main St." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />{" "}
        <FormField
          control={shippingForm.control}
          name="additional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Apt / Suite / Other{" "}
                <span className="text-xs text-gray-500">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. 1234 Main St." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />{" "}
        <FormField
          control={shippingForm.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Boulder City"
                  {...field}
                  className="col-span-1"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />{" "}
        <div className="items-center gap-8 md:grid md:grid-cols-2">
          <FormField
            control={shippingForm.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "h-10 w-[200px] justify-between py-2",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? USA_STATES.find(
                              (state) => state.value === field.value
                            )?.label
                          : "Select state"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="max-h-96 w-[200px] overflow-y-scroll p-0">
                    <Command>
                      <CommandInput placeholder="Search state..." />
                      <CommandEmpty>No state found.</CommandEmpty>
                      <CommandGroup>
                        {USA_STATES.map((state) => (
                          <CommandItem
                            value={state.label}
                            key={state.value}
                            onSelect={() => {
                              shippingForm.setValue("state", state.value);
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                state.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {state.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />{" "}
          <FormField
            control={shippingForm.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 44444"
                    {...field}
                    type="number"
                    className="col-span-1"
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />{" "}
        </div>
        <Button type="submit" disabled={loading}>
          {" "}
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Verify
          Address
        </Button>
      </form>
    </Form>
  );
};

export default AddressForm;
