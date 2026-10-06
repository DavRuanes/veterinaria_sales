import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck, Mail, Phone, Siren } from "lucide-react";
import { post } from "../lib/api";
import { SITE } from "../lib/site";
import { WhatsappIcon } from "../components/Icon";
import { Button, ErrorBox, Field, PageHero } from "../components/ui";

const SUBJECTS = ["Información para socios", "Citas", "Facturación", "Sugerencias", "Reclamaciones", "Trabaja con nosotros", "Otro"];

export default function Contact() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: params.get("asunto") === "empleo" ? "Trabaja con nosotros" : SUBJECTS[0],
    message: "",
    accepts_privacy: false,
  });
  const mutation = useMutation({ mutationFn: () => post("/contact", form) });
  const set = (key: keyof typeof form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const channels = [
    { Icon: Phone, title: "Atención al cliente", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}`, note: SITE.phoneHours },
    { Icon: Siren, title: "Urgencias 24h", value: SITE.emergencyPhone, href: `tel:${SITE.emergencyPhone.replace(/\s/g, "")}`, note: "Todos los días del año" },
    { Icon: WhatsappIcon, title: "WhatsApp", value: "Escríbenos", href: `https://wa.me/${SITE.whatsapp}`, note: "Respuesta en horario de atención" },
    { Icon: Mail, title: "Correo electrónico", value: SITE.email, href: `mailto:${SITE.email}`, note: "Te respondemos en 24-48 h" },
  ];

  return (
    <>
      <PageHero eyebrow="Contacto" title="¿En qué podemos ayudarte?" intro="Estamos aquí para resolver cualquier duda sobre tu mascota o tu cuota de socio." />
      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          {channels.map(({ Icon, title, value, href, note }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="flex items-center gap-4 rounded-3xl border border-ink-100 bg-white p-5 transition hover:border-brand-300 hover:shadow-card"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
                <Icon className="size-6" />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink-500">{title}</span>
                <span className="block font-display text-lg font-semibold text-ink-900">{value}</span>
                <span className="block text-sm text-ink-500">{note}</span>
              </span>
            </a>
          ))}
        </div>

        <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card sm:p-10">
          {mutation.isSuccess ? (
            <div className="py-10 text-center" role="status">
              <CircleCheck className="mx-auto size-16 text-heart" aria-hidden />
              <h2 className="mt-4 text-2xl font-semibold">¡Mensaje enviado!</h2>
              <p className="mt-2 text-ink-600">Gracias, {form.name}. Te responderemos lo antes posible en {form.email}.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h2 className="text-2xl font-semibold">Escríbenos</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre">
                  <input className="input" required minLength={2} autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </Field>
                <Field label="Teléfono (opcional)">
                  <input className="input" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
                <Field label="Correo electrónico">
                  <input className="input" required type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="Asunto">
                  <select className="input" value={form.subject} onChange={(e) => set("subject", e.target.value)}>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Mensaje">
                <textarea className="input min-h-36" required minLength={10} maxLength={3000} value={form.message} onChange={(e) => set("message", e.target.value)} />
              </Field>
              <label className="flex items-start gap-3 text-sm text-ink-600">
                <input type="checkbox" required className="mt-1 size-4 accent-brand-600" checked={form.accepts_privacy} onChange={(e) => set("accepts_privacy", e.target.checked)} />
                <span>
                  He leído y acepto la <Link to="/legal/privacidad" className="font-bold text-brand-700 underline">política de privacidad</Link>.
                </span>
              </label>
              {mutation.error && <ErrorBox error={mutation.error} />}
              <Button type="submit" loading={mutation.isPending} className="w-full sm:w-auto">
                Enviar mensaje
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
