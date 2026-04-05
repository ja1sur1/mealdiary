import { AuthForm } from "@/components/forms/auth-form";
import { signUpAction } from "@/app/server-actions";

export default function SignUpPage() {
  return (
    <main className="auth-card stack">
      <div>
        <p className="eyebrow">Create Account</p>
        <h1 className="page-title">Start tracking with your own login.</h1>
        <p className="auth-copy">
          Create an account to keep meal logs, symptoms, and reminders tied to your own history.
        </p>
      </div>

      <AuthForm action={signUpAction} mode="sign-up" />
    </main>
  );
}
