import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { signIn, signUp } from "../features/auth/api";
import { loginSchema, signupSchema } from "../features/auth/schemas";
import { useAuth } from "../features/auth/AuthProvider";

type Mode = "login" | "signup";
type AuthForm = { display_name?: string; email: string; password: string };

const copy = {
  login: { title: "Welcome back.", text: "Continue to your Hiring Compass workspace.", submit: "Log in" },
  signup: { title: "Start with better hiring context.", text: "Create your Hiring Compass account and bring the hiring journey together.", submit: "Create account" },
};

export function AuthPage() {
  const { user, loading, authenticate } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const mode: Mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<AuthForm>({ defaultValues: { display_name: "", email: "", password: "" } });
  const emailField = register("email");

  useEffect(() => { emailRef.current?.focus(); }, [mode]);
  if (loading) return <main className="grid min-h-screen place-items-center">Loading authentication…</main>;
  if (user) return <Navigate replace to="/app" />;

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
      navigate("/app");
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Unable to continue. Please try again." });
    }
  };
  const active = copy[mode];
  return <AuthLayout>
    <div className="mt-8" role="tablist" aria-label="Authentication mode">
      <div className="grid grid-cols-2 rounded-xl bg-[var(--color-canvas)] p-1">
        {(["login", "signup"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={mode === item} tabIndex={mode === item ? 0 : -1} onClick={() => changeMode(item)} onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") changeMode(mode === "login" ? "signup" : "login"); }} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] ${mode === item ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm" : "text-[var(--color-muted)]"}`}>{item === "login" ? "Log in" : "Sign up"}</button>)}
      </div>
    </div>
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={mode} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -8 }} transition={{ duration: .18 }}>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">{active.title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{active.text}</p>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit(submit)} noValidate>
          {mode === "signup" && <Field label="Full name" error={errors.display_name?.message}><input className="auth-input" autoComplete="name" {...register("display_name")} /></Field>}
          <Field label="Email" error={errors.email?.message}><input className="auth-input" type="email" autoComplete="email" {...emailField} ref={(node) => { emailField.ref(node); emailRef.current = node; }} /></Field>
          <Field label="Password" error={errors.password?.message}><div className="relative"><input className="auth-input pr-11" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} {...register("password")} /><button className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></Field>
          {mode === "signup" && <p className="text-xs leading-5 text-[var(--color-muted)]">Use at least 10 characters, including a letter and a number.</p>}
          {errors.root?.message && <p className="text-sm text-[var(--color-red)]" role="alert">{errors.root.message}</p>}
          <button className="w-full rounded-xl bg-[var(--color-navy)] p-3 font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : active.submit}</button>
        </form>
        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">{mode === "login" ? <>New to Hiring Compass? <button type="button" onClick={() => changeMode("signup")} className="font-semibold text-[var(--color-navy)] hover:underline">Sign up</button></> : <>Already have an account? <button type="button" onClick={() => changeMode("login")} className="font-semibold text-[var(--color-navy)] hover:underline">Log in</button></>}</p>
      </motion.div>
    </AnimatePresence>
  </AuthLayout>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block text-sm font-medium">{label}{children}{error && <span className="mt-1 block text-sm text-[var(--color-red)]" role="alert">{error}</span>}</label>;
}
