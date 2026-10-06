import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { CalendarCheck, ChevronDown, Menu, Phone, Siren, X } from "lucide-react";
import { LOGO, REGIONS, SITE } from "../lib/site";
import { ButtonLink } from "./ui";
import {
  AppleStoreIcon,
  FacebookIcon,
  GooglePlayIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  WhatsappIcon,
} from "./Icon";

type NavItem = { label: string; to: string; children?: { label: string; to: string }[] };

const NAV: NavItem[] = [
  { label: "¿Qué es Veterinarias Sales?", to: "/que-es-veterinarias-sales" },
  {
    label: "Tus servicios incluidos",
    to: "/servicios-de-las-clinicas",
    children: [
      { label: "Especialidades", to: "/especialidades" },
      { label: "Servicios de las clínicas", to: "/servicios-de-las-clinicas" },
      { label: "Medicina general y preventiva", to: "/medicina-general-y-preventiva" },
    ],
  },
  {
    label: "Tus clínicas",
    to: "/tus-clinicas",
    children: REGIONS.map((r) => ({ label: r, to: `/tus-clinicas?region=${encodeURIComponent(r)}` })),
  },
  { label: "Blog", to: "/blog" },
  { label: "Contacto", to: "/contacto" },
];

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={`${SITE.name}, ir al inicio`}>
      <img src={LOGO} alt="" className="size-14 shrink-0 rounded-full bg-white object-contain p-0.5 shadow-md ring-2 ring-brand-200" />
      <span className="leading-none">
        <span className={`block font-display text-xl font-bold ${light ? "text-white" : "text-brand-800"}`}>Veterinarias</span>
        <span className={`block font-script text-xl ${light ? "text-aqua-300" : "text-brand-600"}`}>Sales</span>
      </span>
    </Link>
  );
}

function TopBar() {
  const messages = [
    <>
      <strong>La seguridad social de tu mascota.</strong> Hazte socio por solo {SITE.priceMonthly} €/mes
    </>,
    <>Sin carencias, sin copagos y sin límites</>,
    <>
      Urgencias 24h: <strong>{SITE.emergencyPhone}</strong>
    </>,
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="bg-ink-900 text-sm text-ink-100">
      <div className="container-page flex h-10 items-center justify-between gap-4">
        <p key={index} className="animate-fade-up truncate" aria-live="polite">
          {messages[index]}
        </p>
        <div className="hidden shrink-0 items-center gap-5 md:flex">
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-aqua-300">
            <Phone className="size-4" aria-hidden /> {SITE.phone}
          </a>
          <a href={`tel:${SITE.emergencyPhone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-aqua-300">
            <Siren className="size-4" aria-hidden /> Urgencias
          </a>
        </div>
      </div>
    </div>
  );
}

function DesktopNav() {
  return (
    <nav aria-label="Principal" className="hidden xl:block">
      <ul className="flex items-center gap-1">
        {NAV.map((item) => (
          <li key={item.label} className="group relative">
            <NavLink
              to={item.to}
              end={!item.children}
              className={({ isActive }) =>
                `flex items-center gap-1 rounded-full px-3 py-2 text-[15px] font-bold transition ${
                  isActive ? "text-brand-600" : "text-ink-800 hover:text-brand-600"
                }`
              }
            >
              {item.label}
              {item.children && <ChevronDown className="size-4 transition group-hover:rotate-180" aria-hidden />}
            </NavLink>
            {item.children && (
              <div className="invisible absolute top-full left-0 z-30 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="min-w-64 overflow-hidden rounded-2xl border border-ink-100 bg-white p-2 shadow-lift">
                  {item.children.map((child) => (
                    <li key={child.to}>
                      <Link
                        to={child.to}
                        className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MobileNav({ onClose }: { onClose: () => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Menú">
      <div className="absolute inset-0 bg-ink-950/60" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-white p-6 shadow-lift">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <button onClick={onClose} className="rounded-full p-2 hover:bg-ink-100" aria-label="Cerrar menú">
            <X className="size-6" />
          </button>
        </div>
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-bold text-ink-800 hover:bg-brand-50"
                    aria-expanded={openGroup === item.label}
                    onClick={() => setOpenGroup(openGroup === item.label ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown className={`size-5 transition ${openGroup === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {openGroup === item.label && (
                    <ul className="mb-2 ml-3 border-l-2 border-brand-100 pl-3">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <Link to={child.to} className="block rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 hover:text-brand-700">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link to={item.to} className="block rounded-xl px-3 py-3 font-bold text-ink-800 hover:bg-brand-50">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-auto grid gap-3 pt-8">
          <ButtonLink to="/pide-cita" variant="outline">
            Pide cita
          </ButtonLink>
          <ButtonLink to="/hazte-socio">Hazte socio</ButtonLink>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <ButtonLink to="/pide-cita" variant="outline" size="sm">
              Pide cita
            </ButtonLink>
            <ButtonLink to="/hazte-socio" size="sm">
              Hazte socio
            </ButtonLink>
          </div>
          <button
            className="rounded-full p-2 text-ink-800 hover:bg-ink-100 xl:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="size-7" />
          </button>
        </div>
      </div>
      {open && <MobileNav onClose={() => setOpen(false)} />}
    </header>
  );
}

function FloatingButtons() {
  return (
    <>
      {/* Móvil: barra fija inferior */}
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-ink-800 bg-ink-900 text-xs font-extrabold text-white uppercase sm:hidden">
        <Link to="/hazte-socio" className="bg-brand-600 py-4 text-center">Hazte socio</Link>
        <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 py-4">
          <WhatsappIcon className="size-4" /> WhatsApp
        </a>
        <Link to="/pide-cita" className="flex items-center justify-center gap-1.5 py-4">
          <CalendarCheck className="size-4" aria-hidden /> Pide cita
        </Link>
      </div>
      <DesktopFloatingButtons />
    </>
  );
}

function DesktopFloatingButtons() {
  return (
    <div className="fixed right-4 bottom-4 z-30 hidden flex-col items-end gap-3 sm:flex">
      <a
        href={`https://wa.me/${SITE.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lift transition hover:scale-105"
        aria-label="Escríbenos por WhatsApp"
      >
        <WhatsappIcon className="size-7" />
      </a>
      <Link
        to="/pide-cita"
        className="flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-extrabold text-white uppercase shadow-lift transition hover:bg-ink-800"
      >
        <CalendarCheck className="size-5" aria-hidden /> Pide cita
      </Link>
      <Link
        to="/hazte-socio"
        className="rounded-full bg-brand-600 px-5 py-3 text-sm font-extrabold text-white uppercase shadow-lift transition hover:bg-brand-700"
      >
        Hazte socio
      </Link>
    </div>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Atención",
    links: [
      ["Hazte socio", "/hazte-socio"],
      ["Pide cita", "/pide-cita"],
      ["Contacto", "/contacto"],
      ["Nuestro blog", "/blog"],
      ["Preguntas frecuentes", "/faqs"],
    ],
  },
  {
    title: "Veterinarias Sales",
    links: [
      ["¿Qué es Veterinarias Sales?", "/que-es-veterinarias-sales"],
      ["Servicios de las clínicas", "/servicios-de-las-clinicas"],
      ["Especialidades", "/especialidades"],
      ["Tus clínicas", "/tus-clinicas"],
      ["Trabaja con nosotros", "/contacto?asunto=empleo"],
    ],
  },
];

function Footer() {
  const socials = [
    { href: SITE.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: SITE.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: SITE.social.tiktok, label: "TikTok", Icon: TiktokIcon },
    { href: SITE.social.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  ];

  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-5 text-sm leading-relaxed">
            La seguridad social de tu mascota. Clínicas veterinarias sin carencias, sin copagos y sin límites.
          </p>
          <ul className="mt-6 flex gap-3">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full bg-ink-800 text-white transition hover:bg-brand-600"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 font-display text-lg font-semibold text-white">{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-aqua-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-4 font-display text-lg font-semibold text-white">¿Ya eres socio?</h3>
          <p className="mb-4 text-sm">Descarga nuestra app y gestiona tus citas desde el móvil.</p>
          <div className="flex flex-wrap gap-2">
            <a href={SITE.appStore} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-white hover:border-brand-400">
              <AppleStoreIcon className="size-6" />
              <span className="text-left text-[10px] leading-tight">
                Descárgala en
                <br />
                <strong className="text-sm">App Store</strong>
              </span>
            </a>
            <a href={SITE.googlePlay} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-white hover:border-brand-400">
              <GooglePlayIcon className="size-5" />
              <span className="text-left text-[10px] leading-tight">
                Disponible en
                <br />
                <strong className="text-sm">Google Play</strong>
              </span>
            </a>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <p>
              <span className="block text-xs tracking-wider text-ink-500 uppercase">Atención al cliente</span>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="font-display text-xl font-semibold text-white hover:text-aqua-300">
                {SITE.phone}
              </a>
              <span className="block text-xs">{SITE.phoneHours}</span>
            </p>
            <p>
              <span className="block text-xs tracking-wider text-ink-500 uppercase">Urgencias 24h</span>
              <a href={`tel:${SITE.emergencyPhone.replace(/\s/g, "")}`} className="font-display text-xl font-semibold text-white hover:text-aqua-300">
                {SITE.emergencyPhone}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="container-page flex flex-col gap-3 py-6 pb-24 text-xs sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <p>© {new Date().getFullYear()} Veterinarias Sales. Todos los derechos reservados.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link to="/legal/condiciones" className="hover:text-white">Condiciones del servicio</Link></li>
            <li><Link to="/legal/privacidad" className="hover:text-white">Política de privacidad</Link></li>
            <li><Link to="/legal/cookies" className="hover:text-white">Cookies</Link></li>
            <li><Link to="/legal/aviso-legal" className="hover:text-white">Aviso legal</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <TopBar />
      <Header />
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
