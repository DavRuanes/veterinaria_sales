import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck, Plus, ShieldCheck, Trash } from "lucide-react";
import { post, useClinics, type Member, type MemberInput, type PetInput } from "../lib/api";
import { SITE, SPECIES_LABEL } from "../lib/site";
import { Button, ButtonLink, ErrorBox, Field, PageHero } from "../components/ui";
import { IncludedList } from "../components/sections";

type Plan = MemberInput["plan"];

const PLANS: { id: Plan; title: string; price: string; period: string; note: string }[] = [
  { id: "mensual", title: "Pago mensual", price: SITE.priceMonthly, period: "/mes", note: "Sin permanencia" },
  { id: "anual", title: "Pago anual", price: SITE.priceYearly, period: "/año", note: "¡1 mes gratis!" },
];

const emptyPet = (): PetInput => ({ name: "", species: "perro", breed: "", birth_date: null });

export default function Membership() {
  const [params] = useSearchParams();
  const clinics = useClinics();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Plan>(params.get("plan") === "anual" ? "anual" : "mensual");
  const [owner, setOwner] = useState({
    first_name: "",
    last_name: "",
    dni: "",
    email: "",
    phone: "",
    address: "",
    postal_code: "",
    city: "",
    clinic_id: 0,
  });
  const [pets, setPets] = useState<PetInput[]>([emptyPet()]);
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const mutation = useMutation({ mutationFn: (data: MemberInput) => post<Member>("/members", data) });

  const setO = (key: keyof typeof owner, value: string | number) => setOwner((o) => ({ ...o, [key]: value }));
  const setPet = (i: number, patch: Partial<PetInput>) => setPets((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...owner,
      plan,
      pets: pets.map((p) => ({ ...p, birth_date: p.birth_date || null })),
      accepts_terms: terms,
      accepts_marketing: marketing,
    });
  };

  if (mutation.isSuccess) {
    return (
      <>
        <PageHero eyebrow="Hazte socio" title="¡Bienvenido a la familia!" />
        <section className="container-page py-16">
          <div className="mx-auto max-w-xl rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-card" role="status">
            <CircleCheck className="mx-auto size-16 text-heart" aria-hidden />
            <h2 className="mt-4 text-2xl font-semibold">Ya eres socio, {mutation.data.first_name}</h2>
            <p className="mt-3 text-ink-600">
              Hemos enviado la confirmación del alta a <strong>{mutation.data.email}</strong>. Desde hoy{" "}
              {mutation.data.pets.map((p) => String(p.name)).join(", ")} {mutation.data.pets.length > 1 ? "tienen" : "tiene"} todos los
              servicios incluidos, sin carencias.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/pide-cita">Pide tu primera cita</ButtonLink>
              <ButtonLink to="/" variant="outline">Volver al inicio</ButtonLink>
            </div>
          </div>
        </section>
      </>
    );
  }

  const selectedPlan = PLANS.find((p) => p.id === plan)!;

  return (
    <>
      <PageHero
        eyebrow="Hazte socio"
        title="Hazte socio en menos de 2 minutos"
        intro="Sin carencias, sin copagos y sin límites desde el primer día. Puedes darte de baja cuando quieras."
      />

      <section className="container-page grid gap-8 py-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card sm:p-10">
          <p className="mb-8 text-sm font-extrabold tracking-wider text-brand-600 uppercase">Paso {step + 1} de 3</p>

          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(1);
              }}
              className="space-y-8"
            >
              <fieldset>
                <legend className="mb-4 text-xl font-semibold text-ink-900">Elige tu plan</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {PLANS.map((p) => (
                    <label
                      key={p.id}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition ${plan === p.id ? "border-brand-600 bg-brand-50" : "border-ink-100 hover:border-brand-300"}`}
                    >
                      <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="sr-only" />
                      <span className="flex items-center justify-between">
                        <span className="font-bold text-ink-900">{p.title}</span>
                        <span className="rounded-full bg-heart/15 px-2.5 py-0.5 text-xs font-bold text-brand-800">{p.note}</span>
                      </span>
                      <span className="mt-3 block font-display text-4xl font-bold text-ink-900">
                        {p.price}€<span className="text-base text-ink-500">{p.period}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label="Tu clínica de referencia" hint="Podrás usar cualquier clínica de la red.">
                <select className="input" required value={owner.clinic_id || ""} onChange={(e) => setO("clinic_id", Number(e.target.value))}>
                  <option value="">Selecciona una clínica</option>
                  {clinics.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.city}
                    </option>
                  ))}
                </select>
              </Field>
              {clinics.error && <ErrorBox error={clinics.error} />}
              <div className="flex justify-end">
                <Button type="submit">Continuar</Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold">Datos del titular</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre">
                  <input className="input" required minLength={2} autoComplete="given-name" value={owner.first_name} onChange={(e) => setO("first_name", e.target.value)} />
                </Field>
                <Field label="Apellidos">
                  <input className="input" required minLength={2} autoComplete="family-name" value={owner.last_name} onChange={(e) => setO("last_name", e.target.value)} />
                </Field>
                <Field label="DNI / NIE" hint="Ej.: 12345678Z o X1234567L">
                  <input className="input uppercase" required pattern="[0-9XYZxyz][0-9]{7}[A-Za-z]" value={owner.dni} onChange={(e) => setO("dni", e.target.value)} />
                </Field>
                <Field label="Teléfono">
                  <input className="input" required type="tel" pattern="[0-9+ ]{9,15}" autoComplete="tel" value={owner.phone} onChange={(e) => setO("phone", e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Correo electrónico">
                    <input className="input" required type="email" autoComplete="email" value={owner.email} onChange={(e) => setO("email", e.target.value)} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Dirección">
                    <input className="input" required minLength={4} autoComplete="street-address" value={owner.address} onChange={(e) => setO("address", e.target.value)} />
                  </Field>
                </div>
                <Field label="Código postal">
                  <input className="input" required pattern="[0-9]{5}" inputMode="numeric" autoComplete="postal-code" value={owner.postal_code} onChange={(e) => setO("postal_code", e.target.value)} />
                </Field>
                <Field label="Población">
                  <input className="input" required minLength={2} autoComplete="address-level2" value={owner.city} onChange={(e) => setO("city", e.target.value)} />
                </Field>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(0)}>Atrás</Button>
                <Button type="submit">Continuar</Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submit} className="space-y-6">
              <h2 className="text-xl font-semibold">Tus mascotas</h2>
              {pets.map((pet, i) => (
                <fieldset key={i} className="rounded-2xl border border-ink-100 p-5">
                  <legend className="px-2 font-bold text-ink-800">Mascota {i + 1}</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nombre">
                      <input className="input" required value={pet.name} onChange={(e) => setPet(i, { name: e.target.value })} />
                    </Field>
                    <Field label="Especie">
                      <select className="input" value={pet.species} onChange={(e) => setPet(i, { species: e.target.value as PetInput["species"] })}>
                        {Object.entries(SPECIES_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Raza (opcional)">
                      <input className="input" value={pet.breed} onChange={(e) => setPet(i, { breed: e.target.value })} />
                    </Field>
                    <Field label="Fecha de nacimiento (opcional)">
                      <input className="input" type="date" max={new Date().toISOString().slice(0, 10)} value={pet.birth_date ?? ""} onChange={(e) => setPet(i, { birth_date: e.target.value })} />
                    </Field>
                  </div>
                  {pets.length > 1 && (
                    <button type="button" onClick={() => setPets((ps) => ps.filter((_, j) => j !== i))} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:underline">
                      <Trash className="size-4" aria-hidden /> Quitar mascota
                    </button>
                  )}
                </fieldset>
              ))}
              {pets.length < 6 && (
                <button type="button" onClick={() => setPets((ps) => [...ps, emptyPet()])} className="inline-flex items-center gap-2 font-bold text-brand-700 hover:underline">
                  <Plus className="size-5" aria-hidden /> Añadir otra mascota
                </button>
              )}

              <div className="space-y-3 border-t border-ink-100 pt-6">
                <label className="flex items-start gap-3 text-sm text-ink-700">
                  <input type="checkbox" required className="mt-1 size-4 accent-brand-600" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                  <span>
                    Acepto las <Link to="/legal/condiciones" className="font-bold text-brand-700 underline">condiciones del servicio</Link> y la{" "}
                    <Link to="/legal/privacidad" className="font-bold text-brand-700 underline">política de privacidad</Link>.
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm text-ink-700">
                  <input type="checkbox" className="mt-1 size-4 accent-brand-600" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                  Quiero recibir novedades, campañas de prevención y ofertas.
                </label>
              </div>

              {mutation.error && <ErrorBox error={mutation.error} />}
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Atrás</Button>
                <Button type="submit" loading={mutation.isPending}>Completar alta</Button>
              </div>
            </form>
          )}
        </div>

        <aside className="h-fit rounded-3xl bg-ink-900 p-8 text-ink-200 lg:sticky lg:top-28">
          <p className="text-sm font-bold tracking-wider text-aqua-300 uppercase">Tu plan</p>
          <p className="mt-2 font-display text-4xl font-bold text-white">
            {selectedPlan.price}€<span className="text-lg text-ink-300">{selectedPlan.period}</span>
          </p>
          <p className="mt-1 text-sm">{selectedPlan.title} · misma cuota para cualquier mascota</p>
          <div className="my-6 h-px bg-ink-700" />
          <div className="[&_span]:text-ink-100">
            <IncludedList
              items={["Consultas ilimitadas", "Vacunas y desparasitaciones", "Microchip", "Sin carencias ni copagos", "Descuentos exclusivos"]}
            />
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-ink-300">
            <ShieldCheck className="size-5 text-aqua-300" aria-hidden /> Tus datos están protegidos
          </p>
        </aside>
      </section>
    </>
  );
}
