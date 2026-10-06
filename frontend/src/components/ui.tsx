import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, LoaderCircle, PawPrint } from "lucide-react";

type Variant = "primary" | "secondary" | "dark" | "outline" | "light";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-700/25",
  secondary: "bg-heart text-white hover:bg-brand-500 shadow-lg shadow-heart/25",
  dark: "bg-ink-900 text-white hover:bg-ink-800 shadow-lg shadow-ink-900/25",
  outline: "border-2 border-brand-600 text-brand-700 hover:bg-brand-600 hover:text-white",
  light: "bg-white text-brand-800 hover:bg-brand-50 shadow-lg shadow-ink-900/10",
};

export function buttonClass(variant: Variant = "primary", size: "md" | "lg" | "sm" = "md") {
  const sizes = { sm: "px-4 py-2 text-xs", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base" };
  return `inline-flex items-center justify-center gap-2 rounded-full font-extrabold uppercase tracking-wide transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${VARIANTS[variant]}`;
}

export function ButtonLink({
  to,
  variant,
  size,
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: "md" | "lg" | "sm" }) {
  return <Link to={to} className={`${buttonClass(variant, size)} ${className}`} {...props} />;
}

export function Button({
  variant,
  size,
  className = "",
  loading,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: "md" | "lg" | "sm"; loading?: boolean }) {
  return (
    <button className={`${buttonClass(variant, size)} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`mb-3 inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] uppercase ${
        light ? "text-aqua-300" : "text-brand-600"
      }`}
    >
      <PawPrint className="size-4" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  light,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  light?: boolean;
  align?: "center" | "left";
}) {
  return (
    <div className={`mb-12 max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <h2 className={`text-3xl font-bold sm:text-4xl ${light ? "text-white" : ""}`}>{title}</h2>
      {intro && <p className={`mt-4 text-lg ${light ? "text-ink-200" : "text-ink-600"}`}>{intro}</p>}
    </div>
  );
}

/** Cabecera de página interior: banda oscura con foto de fondo. */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      {image && <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-30" />}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-900/90 to-brand-900/60" />
      <div className="bg-paws absolute inset-0" />
      <div className="container-page relative py-16 sm:py-24">
        <div className="max-w-2xl animate-fade-up">
          {eyebrow && <Eyebrow light>{eyebrow}</Eyebrow>}
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{title}</h1>
          {intro && <p className="mt-5 text-lg leading-relaxed text-ink-200">{intro}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
      <Wave className="text-white" />
    </section>
  );
}

export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      className={`absolute bottom-0 left-0 h-6 w-full sm:h-10 ${className}`}
      aria-hidden
    >
      <path fill="currentColor" d="M0 40c240 26 480 26 720 6s480-40 720-14v28H0z" />
    </svg>
  );
}

export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-500" role="status">
      <LoaderCircle className="size-6 animate-spin text-brand-500" aria-hidden />
      {label}
    </div>
  );
}

export function ErrorBox({ error, className = "" }: { error: unknown; className?: string }) {
  const message = error instanceof Error ? error.message : "Ha ocurrido un error.";
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 ${className}`}>
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <p>{message}</p>
    </div>
  );
}

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}
