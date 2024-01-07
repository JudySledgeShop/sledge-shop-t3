/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { toast } from "react-hot-toast";
import type Shippo from "shippo";

import { Button } from "~/components/ui/button";

import { Label } from "~/components/ui/label";
import { Modal } from "~/components/ui/modal";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import useShippingLabel, {
  type RateResponse,
  type ShippingAddress,
} from "~/hooks/admin/use-shipping-label";
import { useShippingModal } from "~/hooks/admin/use-shipping-modal";
import { api } from "~/utils/api";

import axios from "axios";
import AddressForm from "./address-form";
import type { OrderColumn } from "./columns";
import PackageForm from "./package-form";
import RatesForm from "./rates-form";

export const ShippingModal = ({ data }: { data: OrderColumn | undefined }) => {
  const {
    setRates,
    getRates,
    selectedRate,
    setCustomerAddress,
    setBusinessAddress,
    businessAddress: fromAddress,
    customerAddress: toAddress,
    parcel,
  } = useShippingLabel();

  const [tabValue, setTabValue] = useState<string>("customer_address");
  const params = useRouter();
  const storeId = params?.query?.storeId as string;

  const apiContext = api.useContext();

  const shippingModal = useShippingModal();

  // const [selectedRate, setSelectedRate] = useState<Shippo.Rate | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [label, setLabel] = useState<Shippo.Transaction | null>(null);

  const { data: currentOrder } = api.orders.getOrder.useQuery({
    orderId: data?.id ?? "",
  });

  const { mutate: createLabel } = api.shippingLabels.createLabel.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const handleOnClose = () => {
    void apiContext.orders.getAllOrders.invalidate();
    shippingModal.onClose();
  };

  const purchaseAndGenerateLabel = () => {
    setLoading(true);

    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/shipping/label`, {
        rate: selectedRate?.object_id,
      })
      .then((res) => {
        if (res.status === 200 && res.data.label_url) {
          if (data?.id === undefined)
            return toast.error("Something went wrong.");
          else
            createLabel({
              orderId: data?.id,
              labelUrl: res.data.label_url,
              trackingNumber: res.data.tracking_number,
              cost: selectedRate!.amount,
              carrier: selectedRate!.provider,
              timeEstimate: selectedRate!.duration_terms,
            });
          setLabel(res.data as Shippo.Transaction);
          console.log(res.data);
        } else {
          toast.error("Something went wrong.");
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const customerAddress = data
    ? data?.address?.split(", ").length > 5
      ? {
          name: data?.name ?? undefined,
          street: data?.address?.split(", ")[0] ?? undefined,
          additional: data?.address?.split(", ")[1] ?? undefined,
          city: data?.address?.split(", ")[2] ?? undefined,
          state: data?.address?.split(", ")[3] ?? undefined,
          zip: data?.address?.split(", ")[4] ?? undefined,
        }
      : {
          name: data?.name ?? undefined,
          street: data?.address?.split(", ")[0] ?? undefined,
          additional: "",
          city: data?.address?.split(", ")[1] ?? undefined,
          state: data?.address?.split(", ")[2] ?? undefined,
          zip: data?.address?.split(", ")[3] ?? undefined,
        }
    : {
        name: "",
        street: "",
        additional: "",
        city: "",
        state: "",
        zip: "",
      };

  const { data: storeInfo } = api.store.getStore.useQuery({ storeId });

  const businessAddress = storeInfo
    ? storeInfo?.businessAddress?.split(", ").length > 5
      ? {
          name: storeInfo?.name ?? undefined,
          street: storeInfo?.businessAddress?.split(", ")[0] ?? undefined,
          additional: storeInfo?.businessAddress?.split(", ")[1] ?? undefined,
          city: storeInfo?.businessAddress?.split(", ")[2] ?? undefined,
          state: storeInfo?.businessAddress?.split(", ")[3] ?? undefined,
          zip: storeInfo?.businessAddress?.split(", ")[4] ?? undefined,
        }
      : {
          name: storeInfo?.name ?? undefined,
          street: storeInfo?.businessAddress?.split(", ")[0] ?? undefined,
          additional: "",
          city: storeInfo?.businessAddress?.split(", ")[1] ?? undefined,
          state: storeInfo?.businessAddress?.split(", ")[2] ?? undefined,
          zip: storeInfo?.businessAddress?.split(", ")[3] ?? undefined,
        }
    : {
        name: "",
        street: "",
        additional: "",
        city: "",
        state: "",
        zip: "",
      };

  useEffect(() => {
    if (tabValue === "rates")
      getRates()
        .then((res: RateResponse) => {
          console.log(res);
          setRates(res?.rates ?? []);
        })
        .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);

  const onCopy = (id: string) => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        toast.success("Tracking link copied to clipboard.");
      })
      .catch(() => {
        toast.error("Failed to copy tracking link to clipboard.");
      });
  };

  return (
    <Modal
      title="Create shipping label"
      description="Add a new store to manage products and categories."
      isOpen={shippingModal.isOpen}
      onClose={handleOnClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            {(label ?? currentOrder?.shippingLabel?.labelUrl) && (
              <div>
                <Label>
                  Successful! Your account has been charged{" "}
                  <strong>${selectedRate?.amount}</strong>
                </Label>

                <Link
                  href={
                    label?.label_url ??
                    (currentOrder?.shippingLabel?.labelUrl as string)
                  }
                  target="_blank"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 "
                >
                  Click to download the label
                </Link>

                <Button
                  onClick={() =>
                    onCopy(
                      label?.tracking_url_provider ??
                        (currentOrder?.shippingLabel?.trackingNumber as string)
                    )
                  }
                >
                  Click here to copy the tracking number url
                </Button>
              </div>
            )}
            {!label && !currentOrder?.shippingLabel?.labelUrl && (
              <Tabs
                value={tabValue}
                onValueChange={setTabValue}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="customer_address">Customer</TabsTrigger>{" "}
                  <TabsTrigger value="business_address">Business</TabsTrigger>
                  <TabsTrigger value="package">Package</TabsTrigger>
                  <TabsTrigger value="rates">Get Rates</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                </TabsList>
                <TabsContent value="customer_address">
                  {customerAddress && (
                    <AddressForm
                      successCallback={(data) => {
                        toast.success("Customer address is valid.");
                        setCustomerAddress(data as ShippingAddress);
                        setTabValue("business_address");
                      }}
                      errorCallback={() =>
                        toast.error("Customer address is invalid.")
                      }
                      initialData={customerAddress ?? null}
                    />
                  )}
                </TabsContent>
                <TabsContent value="business_address">
                  {businessAddress && (
                    <AddressForm
                      successCallback={(data) => {
                        toast.success("Business address is valid.");
                        setBusinessAddress(data as ShippingAddress);
                        setTabValue("package");
                      }}
                      errorCallback={() =>
                        toast.error("Business address is invalid.")
                      }
                      initialData={businessAddress ?? null}
                    />
                  )}
                </TabsContent>
                <TabsContent value="package">
                  <PackageForm
                    successCallback={() => {
                      toast.success("Package details saved to cache");
                      setTabValue("rates");
                    }}
                    errorCallback={() =>
                      toast.error("Business address is invalid.")
                    }
                  />
                </TabsContent>

                <TabsContent value="rates">
                  <RatesForm
                    successCallback={() => {
                      toast.success("selected");
                      setTabValue("review");
                    }}
                    errorCallback={() => {
                      toast.error("Rates could not be fetched.");
                    }}
                  />
                </TabsContent>
                <TabsContent value="review">
                  <div className="flex flex-col gap-4 text-left">
                    {fromAddress && (
                      <div className="justify-left  items-left flex w-full flex-col rounded-lg border p-4">
                        <h3>From: </h3>
                        <p>{fromAddress.name}</p>
                        <p>{fromAddress.street}</p>
                        <p>{fromAddress.additional}</p>
                        <p>
                          {fromAddress.city}, {fromAddress.state}{" "}
                          {fromAddress.zip}
                        </p>
                      </div>
                    )}

                    {toAddress && (
                      <div className="justify-left  items-left flex w-full flex-col rounded-lg border p-4">
                        <h3>To: </h3>
                        <p>{toAddress.name}</p>
                        <p>{toAddress.street}</p>
                        <p>{toAddress.additional}</p>
                        <p>
                          {toAddress.city}, {toAddress.state} {toAddress.zip}
                        </p>
                      </div>
                    )}

                    {parcel && (
                      <div className="justify-left  items-left flex w-full flex-col rounded-lg border p-4">
                        <h3 className="font-bold">Package: </h3>
                        <p>
                          {parcel.length} x {parcel.width} x {parcel.height} in
                        </p>
                        {/* Convert weight to lbs and ozs */}

                        <p>
                          {Math.floor(parcel.weight % 16)} lbs{" "}
                          {parcel.weight * 16} oz
                        </p>
                      </div>
                    )}

                    {selectedRate && (
                      <div className="justify-left  items-left flex w-full flex-col rounded-lg border p-4">
                        <h3 className="font-bold">Rate: </h3>
                        <p>{selectedRate.provider}</p>
                        <p>${selectedRate.amount}</p>

                        {/* <p>
                          {selectedRate.estimated_days}{" "}
                          {selectedRate.estimated_days > 1 ? "days" : "day"}
                        </p>

                        <p>
                          {selectedRate.extra?.amount}{" "}
                          {selectedRate.extra?.currency}
                        </p> */}
                      </div>
                    )}

                    <div>
                      <Button
                        onClick={purchaseAndGenerateLabel}
                        disabled={loading}
                        variant={"default"}
                        className="bg-green-500 hover:bg-green-500/90"
                      >
                        Purchase
                      </Button>
                      <Button>Cancel</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
