import { Suspense } from "react";

import { PageContainer } from "@/shared";
import { LoginForm, AuthSphere } from "@/features/auth";

export default async function LoginPage() {
  return (
	<PageContainer className="flex-center-col">
      <AuthSphere />
      <Suspense>
        <LoginForm />
      </Suspense>
    </PageContainer>
  );
}
