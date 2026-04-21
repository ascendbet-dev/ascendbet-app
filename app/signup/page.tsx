import { Suspense } from "react";
import SignupClient from "./SignupClient";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <SignupClient />
    </Suspense>
  );
}