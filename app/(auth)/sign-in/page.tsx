import { AuthForm } from "@/components/forms/auth-form";
import { signInAction } from "@/app/server-actions";

export default function SignInPage() {
  return (
    <main className="auth-card stack">
      <div>
        <p className="eyebrow">Welcome Back</p>
        <h1 className="page-title">Sign in to your tracker.</h1>
        <p className="auth-copy">
          Your meals, symptom logs, insights, and reminder settings stay scoped to your account.
        </p>
      </div>

      <AuthForm action={signInAction} mode="sign-in" />
    </main>
  );
}
