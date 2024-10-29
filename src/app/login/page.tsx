"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const LoginPage = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div>
      <h1>Login</h1>
      <div className="flex flex-col">
        <button onClick={() => signIn("google", { callbackUrl })}>
          Sign in with Google
        </button>
        <button onClick={() => signIn("github", { callbackUrl })}>
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
