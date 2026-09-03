import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { signIn, signUp } from "../features/auth/api";
import { loginSchema, signupSchema } from "../features/auth/schemas";
import { useAuth } from "../features/auth/AuthProvider";
import { portalUrl } from "../lib/hosts";

type Mode = "login" | "signup";
type AuthForm = { display_name?: string; email: string; password: string };

const copy = {
  login: { title: "Welcome back.", text: "Continue to your Hiring Compass workspace.", submit: "Log in" },
  signup: { title: "Start with better hiring context.", text: "Create your Hiring Compass account and bring the hiring journey together.", submit: "Create account" },
};

export function AuthPage() {
  const { user, loading, authenticate } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduced = useReducedMotion();
  const mode: Mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<AuthForm>({ defaultValues: { display_name: "", email: "", password: "" } });
  const emailField = register("email");

  useEffect(() => { emailRef.current?.focus(); }, [mode]);
  if (loading) return <main className="grid min-h-screen place-items-center">Loading authentication…</main>;
  if (user) {
    window.location.replace(portalUrl());
    return null;
  }

  const changeMode = (next: Mode) => {
    if (next === mode) return;
    clearErrors();
    setSearchParams({ mode: next });
  };
  const submit = async (values: AuthForm) => {
    const parsed = (mode === "login" ? loginSchema : signupSchema).safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach(({ path, message }) => setError(path[0] as keyof AuthForm, { message }));
      return;
    }
    try {
      const payload = mode === "login"
        ? await signIn(values.email, values.password)
        : await signUp(values.email, values.display_name!, values.password);
      authenticate(payload);
      window.location.assign(portalUrl());
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Unable to continue. Please try again." });
    }
  };
  const active = copy[mode];
  return <AuthLayout>
    <div className="hc-auth-tabs" role="tablist" aria-label="Authentication mode">
      {(["login", "signup"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={mode === item} tabIndex={mode === item ? 0 : -1} onClick={() => changeMode(item)} onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") changeMode(mode === "login" ? "signup" : "login"); }} className={`hc-auth-tab${mode === item ? " is-active" : ""}`}>{item === "login" ? "Log in" : "Sign up"}</button>)}
      </div>
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={mode} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -8 }} transition={{ duration: .18 }}>
        <h1 className="hc-auth-title">{active.title}</h1>
        <p className="hc-auth-description">{active.text}</p>
        <form className="hc-auth-form" onSubmit={handleSubmit(submit)} noValidate>
          {mode === "signup" && <Field label="Full name" error={errors.display_name?.message}><input className="auth-input" autoComplete="name" {...register("display_name")} /></Field>}
          <Field label="Email" error={errors.email?.message}><input className="auth-input" type="email" autoComplete="email" {...emailField} ref={(node) => { emailField.ref(node); emailRef.current = node; }} /></Field>
          <Field label="Password" error={errors.password?.message}><div className="relative"><input className="auth-input pr-11" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} {...register("password")} /><button className="hc-auth-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></Field>
          {mode === "signup" && <p className="hc-auth-help">Use at least 10 characters, including a letter and a number.</p>}
          {errors.root?.message && <p className="hc-auth-error" role="alert">{errors.root.message}</p>}
          <button className="hc-auth-submit" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : active.submit}</button>
        </form>
      </motion.div>
    </AnimatePresence>
  </AuthLayout>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="hc-auth-field">{label}{children}{error && <span className="hc-auth-error" role="alert">{error}</span>}</label>;
}
