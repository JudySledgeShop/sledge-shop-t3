import { useEffect } from "react";
import Footer from "~/components/core/footer";
import Navbar from "~/components/core/navbar";

import useCart from "~/hooks/core/use-cart";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const updateStore = () => {
    // void cart.verifyValues();

    void useCart.persist.rehydrate();
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", updateStore);
    window.addEventListener("focus", updateStore);
    return () => {
      document.removeEventListener("visibilitychange", updateStore);
      window.removeEventListener("focus", updateStore);
    };
  }, []);
  return (
    <>
      <main className="flex h-full  min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto h-full w-full max-w-7xl flex-grow">
          {children}
        </div>
        <Footer />
      </main>
    </>
  );
}
