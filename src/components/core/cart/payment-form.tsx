import { zodResolver } from "@hookform/resolvers/zod";

import Image from "next/image";
import { useRouter as useNavigationRouter } from "next/navigation";
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

import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import useCart from "~/hooks/core/use-cart";
import { toast } from "~/hooks/use-toast";

const paymentFormSchema = z.object({
  payment: z.enum(["credit", "paypal", "cash"]),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<PaymentFormValues> = {
  // name: "Your name",
  // dob: new Date("2023-01-23"),
};

export function PaymentForm() {
  const router = useNavigationRouter();
  const cart = useCart();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
  });

  function onSubmit(data: PaymentFormValues) {
    cart.setValue("paymentType", data.payment);
    router.push(`/cart/review/checkout/`);
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="space-y-8"
      >
        {" "}
        <FormField
          control={form.control}
          name="payment"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="sr-only">Payment Methods</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <RadioGroupItem value="credit" />
                    </FormControl>
                    <FormLabel className="flex w-full items-center justify-between font-normal">
                      Card{" "}
                      <Image
                        src="/img/stripe.svg"
                        width={25}
                        height={25}
                        alt=""
                      />
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <RadioGroupItem value="paypal" />
                    </FormControl>
                    <FormLabel className="flex w-full items-center justify-between font-normal">
                      Pay with PayPal{" "}
                      <Image
                        src="/img/paypal.svg"
                        width={20}
                        height={20}
                        alt=""
                      />
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <RadioGroupItem value="cash" />
                    </FormControl>
                    <FormLabel className="flex w-full items-center justify-between font-normal">
                      Pay with Cash on Delivery{" "}
                      <Image
                        src="/img/money-bill-solid.svg"
                        width={25}
                        height={25}
                        alt=""
                      />
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Next</Button>
      </form>
    </Form>
  );
}
