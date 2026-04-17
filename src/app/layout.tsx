import type { Metadata } from "next";
import "./globals.css";
import { QueryClientProviderContext } from "./query-client-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "./session-provider";
import { getAuthServerSession } from "@/server/auth";

export const metadata: Metadata = {
  title: "BookApp — онлайн-запись для бьюти-бизнеса",
  description:
    "Многоролевая SaaS-платформа для автоматизации онлайн-записи, управления расписанием, базой клиентов и сотрудников в сфере бьюти-услуг.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthServerSession();

  return (
    <html lang="ru">
      <body>
        <SessionProvider session={session}>
          <QueryClientProviderContext>
            {children}
          </QueryClientProviderContext>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
