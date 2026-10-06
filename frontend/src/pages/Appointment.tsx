import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, CircleCheck, Clock, MapPin, PawPrint } from "lucide-react";
import { post, useAvailability, useClinics, useServices, type Appointment, type AppointmentInput, type Species } from "../lib/api";
import { SITE, SPECIES_LABEL } from "../lib/site";
import { Button, ButtonLink, ErrorBox, Field, Loading, PageHero } from "../components/ui";

const OPEN_WEEKDAYS = [2, 3, 4, 5, 6]; // martes a sábado (getDay)

function isoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nextOpenDays(count: number) {
  const days: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < count) {
    if (OPEN_WEEKDAYS.includes(d.getDay())) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const STEPS = ["Clínica y servicio", "Fecha y hora", "Tus datos"];

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-10 flex items-center gap-2 sm:gap-4">
      {STEPS.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
              i < step ? "bg-heart text-white" : i === step ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"
            }`}
            aria-current={i === step ? "step" : undefined}
          >
            {i < step ? <CircleCheck className="size-5" aria-hidden /> : i + 1}
          </span>
          <span className={`hidden text-sm font-bold sm:block ${i === step ? "text-ink-900" : "text-ink-500"}`}>{label}</span>
          {i < STEPS.length - 1 && <span className="h-0.5 flex-1 bg-ink-100" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

export default function AppointmentPage() {
  const [params] = useSearchParams();
  const clinics = useClinics();
  const services = useServices();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [clinicId, setClinicId] = useState<number | null>(null);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [form, setForm] = useState({
    pet_name: "",
    species: "perro" as Species,
    owner_name: "",
    email: "",
    phone: "",
    is_member: false,
    notes: "",
    accepts_privacy: false,
  });

  // Preselección desde ?clinica=slug&servicio=slug
  useEffect(() => {
    const slug = params.get("clinica");
    const match = clinics.data?.find((c) => c.slug === slug);
    if (match) setClinicId((current) => current ?? match.id);
  }, [clinics.data, params]);

  useEffect(() => {
    const slug = params.get("servicio");
    const match = services.data?.find((s) => s.slug === slug && s.bookable);
    if (match) setService((current) => current || match.title);
  }, [services.data, params]);

  const days = useMemo(() => nextOpenDays(18), []);
  const availability = useAvailability(step >= 1 ? clinicId : null, date);
  const clinic = clinics.data?.find((c) => c.id === clinicId);

  const mutation = useMutation({
    mutationFn: (data: AppointmentInput) => post<Appointment>("/appointments", data),
    onError: () => queryClient.invalidateQueries({ queryKey: ["availability"] }),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!clinicId) return;
    const { accepts_privacy: _, ...rest } = form;
    mutation.mutate({ ...rest, clinic_id: clinicId, service, date, time });
  };

  if (mutation.isSuccess) {
    const a = mutation.data;
    return (
      <>
        <PageHero eyebrow="Pide cita" title="¡Cita solicitada!" />
        <section className="container-page py-16">
          <div className="mx-auto max-w-xl rounded-3xl border border-ink-100 bg-white p-8 text-center shadow-card sm:p-10" role="status">
            <CircleCheck className="mx-auto size-16 text-heart" aria-hidden />
            <h2 className="mt-4 text-2xl font-semibold">Te esperamos, {a.pet_name}</h2>
            <p className="mt-2 text-ink-600">Hemos enviado la confirmación a {a.email}.</p>
            <dl className="mt-8 space-y-3 rounded-2xl bg-brand-50 p-6 text-left">
              <div className="flex gap-3"><MapPin className="size-5 text-brand-600" aria-hidden /><dd><strong>{clinic?.name}</strong><br />{clinic?.address}, {clinic?.city}</dd></div>
              <div className="flex gap-3"><CalendarCheck className="size-5 text-brand-600" aria-hidden /><dd>{new Date(a.date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} a las {a.time.slice(0, 5)}</dd></div>
              <div className="flex gap-3"><PawPrint className="size-5 text-brand-600" aria-hidden /><dd>{a.service}</dd></div>
            </dl>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/">Volver al inicio</ButtonLink>
              {!a.is_member && <ButtonLink to="/hazte-socio" variant="outline">Hazte socio</ButtonLink>}
            </div>
          </div>
        </section>
      </>
    );
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <>
      <PageHero
        eyebrow="Pide cita"
        title="Reserva tu cita online"
        intro={`Elige clínica, servicio y el horario que mejor te venga. Para urgencias llama al ${SITE.emergencyPhone}.`}
      />

      <section className="container-page py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-ink-100 bg-white p-6 shadow-card sm:p-10">
          <Stepper step={step} />

          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(1);
              }}
              className="space-y-6"
            >
              {(clinics.isLoading || services.isLoading) && <Loading />}
              {clinics.error && <ErrorBox error={clinics.error} />}
              <Field label="Clínica">
                <select
                  className="input"
                  required
                  value={clinicId ?? ""}
                  onChange={(e) => {
                    setClinicId(Number(e.target.value) || null);
                    setTime("");
                  }}
                >
                  <option value="">Selecciona una clínica</option>
                  {clinics.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.city}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Servicio">
                <select className="input" required value={service} onChange={(e) => setService(e.target.value)}>
                  <option value="">Selecciona un servicio</option>
                  {services.data?.filter((s) => s.bookable).map((s) => (
                    <option key={s.slug} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  <option value="Consulta de especialidad">Consulta de especialidad</option>
                </select>
              </Field>
              <div className="flex justify-end">
                <Button type="submit">Continuar</Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="label">Elige un día</p>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                  {days.map((d) => {
                    const value = isoDate(d);
                    const active = value === date;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setDate(value);
                          setTime("");
                        }}
                        aria-pressed={active}
                        className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border-2 py-3 transition ${
                          active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-100 hover:border-brand-300"
                        }`}
                      >
                        <span className="text-xs font-bold uppercase">{d.toLocaleDateString("es-ES", { weekday: "short" })}</span>
                        <span className="font-display text-2xl font-bold">{d.getDate()}</span>
                        <span className="text-xs">{d.toLocaleDateString("es-ES", { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {date && (
                <div>
                  <p className="label flex items-center gap-2">
                    <Clock className="size-4" aria-hidden /> Horas disponibles
                  </p>
                  {availability.isLoading && <Loading label="Consultando disponibilidad…" />}
                  {availability.error && <ErrorBox error={availability.error} />}
                  {availability.data && availability.data.slots.length === 0 && (
                    <p className="rounded-2xl bg-ink-50 p-4 text-ink-600">No quedan huecos libres este día. Prueba con otra fecha.</p>
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {availability.data?.slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        aria-pressed={time === slot}
                        className={`rounded-xl border-2 py-2.5 font-bold transition ${
                          time === slot ? "border-ink-900 bg-ink-900 text-white" : "border-ink-100 text-ink-800 hover:border-brand-400"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(0)}>
                  Atrás
                </Button>
                <Button type="button" disabled={!date || !time} onClick={() => setStep(2)}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={submit} className="space-y-6">
              <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-2xl bg-brand-50 p-4 text-sm font-semibold text-ink-800">
                <span className="flex items-center gap-2"><MapPin className="size-4 text-brand-600" aria-hidden />{clinic?.name}</span>
                <span className="flex items-center gap-2"><CalendarCheck className="size-4 text-brand-600" aria-hidden />{date} · {time}</span>
                <span className="flex items-center gap-2"><PawPrint className="size-4 text-brand-600" aria-hidden />{service}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre de tu mascota">
                  <input className="input" required maxLength={80} value={form.pet_name} onChange={(e) => set("pet_name", e.target.value)} />
                </Field>
                <Field label="Especie">
                  <select className="input" value={form.species} onChange={(e) => set("species", e.target.value as Species)}>
                    {Object.entries(SPECIES_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Tu nombre y apellidos">
                  <input className="input" required minLength={2} autoComplete="name" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} />
                </Field>
                <Field label="Teléfono" hint="9 dígitos, por ejemplo 600 123 456">
                  <input className="input" required type="tel" pattern="[0-9+ ]{9,15}" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Correo electrónico">
                    <input className="input" required type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Motivo de la consulta (opcional)">
                    <textarea className="input min-h-28" maxLength={1000} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                  </Field>
                </div>
              </div>
              <label className="flex items-center gap-3 font-semibold text-ink-800">
                <input type="checkbox" className="size-4 accent-brand-600" checked={form.is_member} onChange={(e) => set("is_member", e.target.checked)} />
                Ya soy socio de Veterinarias Sales
              </label>
              <label className="flex items-start gap-3 text-sm text-ink-600">
                <input type="checkbox" required className="mt-1 size-4 accent-brand-600" checked={form.accepts_privacy} onChange={(e) => set("accepts_privacy", e.target.checked)} />
                <span>
                  He leído y acepto la <Link to="/legal/privacidad" className="font-bold text-brand-700 underline">política de privacidad</Link>.
                </span>
              </label>
              {mutation.error && <ErrorBox error={mutation.error} />}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    mutation.reset();
                    setStep(1);
                  }}
                >
                  Atrás
                </Button>
                <Button type="submit" loading={mutation.isPending}>
                  Confirmar cita
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
