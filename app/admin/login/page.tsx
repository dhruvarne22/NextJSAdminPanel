import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign In · Vardaan Admin" };

// Login page must NOT be a client component at the top level
// because we need to read searchParams (server-only in Next 15)
export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const from = searchParams?.from ?? "/admin";
  return (
    <Suspense>
      <LoginForm from={from} />
    </Suspense>
  );
}