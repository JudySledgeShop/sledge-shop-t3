import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import "~/styles/globals.css";
import { api } from "~/utils/api";

import { ModalProvider } from "~/providers/modal-provider";
// import { ThemeProvider } from "~/providers/theme-provider";
import { ToastProvider } from "~/providers/toast-provider";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ToastProvider />
      <ModalProvider />
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
