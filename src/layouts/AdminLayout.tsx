import Head from "next/head";
import Navbar from "~/components/admin/navbar";

export default function AdminLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <>
      <Head>
        <title>{title ?? "Admin"} | Admin</title>
        <meta name="description" content="Admin" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-screen flex-col overflow-y-auto">
        <Navbar />
        {children}
      </main>
    </>
  );
}
