import { zodResolver } from "@hookform/resolvers/zod";

import { useState, type FC } from "react";
import { useForm } from "react-hook-form";

import * as z from "zod";

import { Button } from "~/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import useShippingLabel from "~/hooks/admin/use-shipping-label";

const shippingFormSchema = z.object({
  package_length: z.coerce.number().min(1),
  package_width: z.coerce.number().min(1),
  package_height: z.coerce.number().min(1),
  package_weight_lbs: z.coerce.number(),
  package_weight_oz: z.coerce.number(),
});

export type PackageFormValues = z.infer<typeof shippingFormSchema>;

type PackageFormProps = {
  successCallback: (data?: unknown) => void;
  errorCallback: (data?: unknown) => void;
};
const PackageForm: FC<PackageFormProps> = ({ successCallback }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setParcelMeasurements } = useShippingLabel();

  const defaultValues: Partial<PackageFormValues> = {
    package_length: 0,
    package_width: 0,
    package_height: 0,
    package_weight_lbs: 0,
    package_weight_oz: 0,
  };

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues,
  });

  const onSubmit = (data: PackageFormValues) => {
    setLoading(true);
    setParcelMeasurements(data);
    setLoading(true);
    successCallback();

    // getRates()
    //   .then((res: RateResponse) => {
    //     if (res.isValid) successCallback(res.rates);
    //     else errorCallback();
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     errorCallback(err);
    //   })
    //   .finally(() => setLoading(false));
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
        <div className="flex flex-col gap-y-5">
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="package_length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length (in)</FormLabel>

                  <FormControl>
                    <Input
                      disabled={loading}
                      {...field}
                      type="number"
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="package_width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width (in)</FormLabel>

                  <FormControl>
                    <Input
                      disabled={loading}
                      {...field}
                      type="number"
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="package_height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (in)</FormLabel>

                  <FormControl>
                    <Input
                      disabled={loading}
                      {...field}
                      type="number"
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="package_weight_lbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lbs</FormLabel>

                  <FormControl>
                    <Input
                      disabled={loading}
                      {...field}
                      type="number"
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="package_weight_oz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ozs</FormLabel>

                  <FormControl>
                    <Input
                      disabled={loading}
                      {...field}
                      type="number"
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-end space-x-2 pt-6">
          {/* <Button
            disabled={loading}
            variant="outline"
            // onClick={shippingModal.onClose}
          >
            Cancel
          </Button>{" "} */}
          <Button disabled={loading} type="submit">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PackageForm;
