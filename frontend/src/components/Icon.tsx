import {
  Activity,
  Apple,
  Bird,
  Bone,
  Brain,
  Cpu,
  Eye,
  FileBadge,
  FlaskConical,
  Hand,
  HeartPulse,
  Microscope,
  PawPrint,
  Ribbon,
  Scan,
  ScanSearch,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Siren,
  Sparkles,
  Stethoscope,
  Syringe,
  Toothbrush,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  apple: Apple,
  bird: Bird,
  bone: Bone,
  brain: Brain,
  cpu: Cpu,
  eye: Eye,
  "file-badge": FileBadge,
  "flask-conical": FlaskConical,
  hand: Hand,
  "heart-pulse": HeartPulse,
  microscope: Microscope,
  "paw-print": PawPrint,
  ribbon: Ribbon,
  scan: Scan,
  "scan-search": ScanSearch,
  scissors: Scissors,
  "shield-check": ShieldCheck,
  "shopping-bag": ShoppingBag,
  siren: Siren,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  syringe: Syringe,
  toothbrush: Toothbrush,
};

/** Icono por nombre (los nombres vienen de la API). */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Component = ICONS[name] ?? PawPrint;
  return <Component aria-hidden {...props} />;
}

type SvgProps = { className?: string };

export function InstagramIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8.5V6.8c0-.8.5-1.3 1.4-1.3H17V2.2C16.4 2.1 15.3 2 14.3 2 11.8 2 10 3.6 10 6.4v2.1H7.3v3.7H10V22h4v-9.8h2.8l.5-3.7H14z" />
    </svg>
  );
}

export function TiktokIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 2h-3.3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .8.1V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a7.7 7.7 0 0 0 4.4 1.4V6.7a4.4 4.4 0 0 1-4.4-4.4z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z" />
    </svg>
  );
}

export function WhatsappIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.5-.3z" />
    </svg>
  );
}
