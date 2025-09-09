import { Suspense } from "react";

import { PageContainer } from "@/shared";
import { RegisterForm, AuthSphere } from "@/features/auth";

export default async function LoginPage() {
  return (
    <PageContainer className="flex-center-col">
			<AuthSphere />
      <Suspense>
        <RegisterForm />
      </Suspense>
		</PageContainer>
  );
}
