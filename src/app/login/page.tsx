import LoginForm from "@/components/AuthPages/LoginForm";
import { Suspense } from "react";

const LoginPage = () => {
  return (
    <Suspense fallback="Loading...">
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
