import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Router from "next/router";
import "~/styles/globals.css";
import { api } from "~/utils/api";

import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Toaster } from "~/components/ui/toaster";
import { ModalProvider } from "~/providers/admin/modal-provider";
import StorefrontModalProvider from "~/providers/core/modal-provider";
import { ThemeProvider } from "~/providers/theme-provider";
import { ToastProvider } from "~/providers/toast-provider";

Router.events.on("routeChangeStart", () => {
  NProgress.start();
});

Router.events.on("routeChangeComplete", () => {
  NProgress.done(false);
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider />
        <ModalProvider />
        <StorefrontModalProvider />
        {/* <AnimatePresence mode="wait">
          <motion.div
            key={router.route}
            initial="initialState"
            animate="animateState"
            exit="exitState"
            transition={{
              duration: 0.75,
            }}
            variants={{
              initialState: {
                opacity: 0,
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
              },
              animateState: {
                opacity: 1,
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
              },
              exitState: {
                clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
              },
            }}
            className="base-page-size"
          > */}
        <Component {...pageProps} /> <Toaster />
        {/* </motion.div>{" "}
        </AnimatePresence> */}
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
