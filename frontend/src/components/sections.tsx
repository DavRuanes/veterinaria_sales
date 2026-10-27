import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Quote,
  Star,
} from "lucide-react";
import { post, useFaqs, useTestimonials, type BlogPostSummary, type Faq } from "../lib/api";
import { formatDate, photo, SITE } from "../lib/site";
import { Button, ButtonLink, ErrorBox, Eyebrow, Loading } from "./ui";

/* ---------- Banda "Hazte socio" ---------- */

export function CtaBand({
  title = "Hazte socio hoy mismo",
  text = `Todo lo que tu mascota necesita por solo ${SITE.priceMonthly} € al mes. Sin carencias, sin copagos y sin límites.`,
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="container-page py-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-800 via-brand-700 to-ink-900 px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="bg-paws absolute inset-0" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-brand-100">{text}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/hazte-socio" variant="light" size="lg">
              Hazte socio
            </ButtonLink>
            <ButtonLink to="/tus-clinicas" variant="dark" size="lg">
              Dónde estamos
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonios ---------- */

export function Testimonials() {
  const { data, isLoading, error } = useTestimonials();
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("article");
    track.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 24), behavior: "smooth" });
  };

  return (
    <section className="bg-brand-50 py-20">
      <div className="container-page">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Opiniones</Eyebrow>
            <h2 className="text-3xl font-bold sm:text-4xl">Lo que dicen nuestros socios</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="rounded-full border-2 border-brand-200 bg-white p-3 text-brand-700 hover:border-brand-500" aria-label="Opiniones anteriores">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => scroll(1)} className="rounded-full border-2 border-brand-200 bg-white p-3 text-brand-700 hover:border-brand-500" aria-label="Siguientes opiniones">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
        {isLoading && <Loading />}
        {error && <ErrorBox error={error} />}
        <div ref={trackRef} className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 [scrollbar-width:none]">
          {data?.map((t) => (
            <article key={t.id} className="flex w-[85%] shrink-0 snap-start flex-col rounded-3xl bg-white p-7 shadow-card sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <Quote className="size-8 text-brand-300" aria-hidden />
              <div className="mt-3 flex gap-0.5" aria-label={`${t.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`size-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} aria-hidden />
                ))}
              </div>
              <p className="mt-4 flex-1 leading-relaxed text-ink-700">“{t.text}”</p>
              <div className="mt-6 flex items-center gap-3 border-t border-ink-100 pt-5">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-600 font-display text-lg font-bold text-white">
                  {t.author[0]}
                </span>
                <div>
                  <p className="font-bold text-ink-900">{t.author}</p>
                  <p className="text-sm text-ink-500">
                    {t.pet} · {formatDate(t.published_at)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Preguntas frecuentes ---------- */

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);
  return (
    <div className="space-y-3">
      {faqs.map((f) => {
        const isOpen = open === f.id;
        return (
          <div key={f.id} className={`rounded-2xl border bg-white transition ${isOpen ? "border-brand-300 shadow-card" : "border-ink-100"}`}>
            <h3>
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-sans text-base font-bold text-ink-900"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : f.id)}
              >
                {f.question}
                <ChevronDown className={`size-5 shrink-0 text-brand-600 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
            </h3>
            {isOpen && <p className="px-6 pb-6 leading-relaxed text-ink-600">{f.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function FeaturedFaqs() {
  const { data, isLoading, error } = useFaqs(true);
  return (
    <section className="py-20">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Eyebrow>Preguntas frecuentes</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">¿Tienes dudas?</h2>
          <p className="mt-4 text-lg text-ink-600">Resolvemos las preguntas más habituales sobre la cuota de socio.</p>
          <ButtonLink to="/faqs" variant="outline" className="mt-8">
            Ver todas las preguntas <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
        <div>
          {isLoading && <Loading />}
          {error && <ErrorBox error={error} />}
          {data && <FaqAccordion faqs={data} />}
        </div>
      </div>
    </section>
  );
}

/* ---------- Blog ---------- */

export function BlogCard({ post: p }: { post: BlogPostSummary }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/blog/${p.slug}`} className="block aspect-[16/10] overflow-hidden" tabIndex={-1} aria-hidden>
        <img src={photo(p.image)} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-extrabold tracking-wider text-brand-600 uppercase">
          {p.category} · {formatDate(p.published_at)}
        </p>
        <h3 className="mt-2 text-xl font-semibold">
          <Link to={`/blog/${p.slug}`} className="hover:text-brand-700">
            {p.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-ink-600">{p.excerpt}</p>
        <Link to={`/blog/${p.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand-700 uppercase">
          Leer más <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/* ---------- Newsletter ---------- */

export function Newsletter() {
  const [form, setForm] = useState({ name: "", email: "", accepts_privacy: false });
  const mutation = useMutation({ mutationFn: () => post("/newsletter", form) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <section className="bg-aqua-100 py-16">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>Newsletter</Eyebrow>
          <h2 className="text-3xl font-bold">Recibe consejos y novedades</h2>
          <p className="mt-3 text-ink-600">Campañas de prevención, artículos de nuestros veterinarios y ofertas exclusivas, directos a tu correo.</p>
        </div>
        {mutation.isSuccess ? (
          <div className="flex items-center gap-4 rounded-3xl bg-white p-8 shadow-card" role="status">
            <CircleCheck className="size-10 shrink-0 text-brand-600" aria-hidden />
            <div>
              <p className="font-display text-xl font-semibold text-ink-900">¡Gracias por suscribirte!</p>
              <p className="text-ink-600">Pronto recibirás nuestras novedades en {form.email}.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="input" placeholder="Nombre" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Nombre" />
              <input className="input" type="email" placeholder="Correo electrónico" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-label="Correo electrónico" />
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm text-ink-600">
              <input type="checkbox" required className="mt-1 size-4 accent-brand-600" checked={form.accepts_privacy} onChange={(e) => setForm({ ...form, accepts_privacy: e.target.checked })} />
              <span>
                Acepto la <Link to="/legal/privacidad" className="font-bold text-brand-700 underline">política de privacidad</Link> y recibir comunicaciones comerciales.
              </span>
            </label>
            {mutation.error && <ErrorBox error={mutation.error} className="mt-4" />}
            <Button type="submit" loading={mutation.isPending} className="mt-5 w-full">
              Quiero recibir novedades
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ---------- Bloque "lo que incluye" ---------- */

export function IncludedList({ items, columns = 2 }: { items: string[]; columns?: 2 | 3 }) {
  return (
    <ul className={`grid gap-3 ${columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-heart" aria-hidden />
          <span className="font-semibold text-ink-800">{item}</span>
        </li>
      ))}
    </ul>
  );
}

