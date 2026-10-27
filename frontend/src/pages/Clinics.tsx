import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Clock, MapPin, Navigation, Phone, Siren } from "lucide-react";
import { useClinics, type Clinic } from "../lib/api";
import { SITE } from "../lib/site";
import { ErrorBox, Loading, PageHero } from "../components/ui";
import { CtaBand } from "../components/sections";

const ClinicMap = lazy(() => import("../components/ClinicMap"));

const SERVICE_LABEL: Record<string, string> = {
  consultas: "Consultas",
  tienda: "Tienda",
  "pruebas-laboratoriales": "Laboratorio",
  vacunaciones: "Vacunas",
  desparasitaciones: "Desparasitación",
  microchip: "Microchip",
  peluqueria: "Peluquería",
  radiologia: "Radiología",
  ecografia: "Ecografía",
  cirugias: "Cirugía",
  "urgencias-24h": "Urgencias 24h",
  tac: "TAC",
  endoscopia: "Endoscopia",
};

function ClinicCard({ clinic }: { clinic: Clinic }) {
  return (
    <article className="rounded-3xl border-2 border-ink-100 bg-white p-6">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-wider text-brand-600 uppercase">{clinic.region}</p>
            <h2 className="mt-1 text-lg font-semibold">{clinic.name}</h2>
          </div>
          {clinic.open_24h && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-white">
              <Siren className="size-3.5" aria-hidden /> 24h
            </span>
          )}
        </div>
        <p className="mt-3 flex items-start gap-2 text-ink-600">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          {clinic.address}, {clinic.postal_code} {clinic.city}
        </p>
      </div>

      <dl className="mt-4 grid gap-2 rounded-2xl bg-ink-50 p-4 text-sm">
        {[
          ["Veterinario", clinic.hours_vet],
          ["Tienda", clinic.hours_shop],
          ["Peluquería", clinic.hours_grooming],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden />
            <dt className="font-bold text-ink-800">{label}:</dt>
            <dd className="text-ink-600">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Servicios disponibles">
        {clinic.services.map((s) => (
          <li key={s} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
            {SERVICE_LABEL[s] ?? s}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to={`/pide-cita?clinica=${clinic.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-extrabold text-white uppercase hover:bg-brand-700"
        >
          <CalendarCheck className="size-4" aria-hidden /> Pide cita aquí
        </Link>
        <a
          href={SITE.maps}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-200 px-4 py-2 text-xs font-extrabold text-ink-800 uppercase hover:border-ink-800"
        >
          <Navigation className="size-4" aria-hidden /> Cómo llegar
        </a>
        <a
          href={`tel:${clinic.phone.replace(/\s/g, "")}`}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-200 px-4 py-2 text-xs font-extrabold text-ink-800 uppercase hover:border-ink-800"
        >
          <Phone className="size-4" aria-hidden /> {clinic.phone}
        </a>
      </div>
    </article>
  );
}

export default function Clinics() {
  const { data, isLoading, error } = useClinics();

  return (
    <>
      <PageHero
        eyebrow="Nuestra clínica"
        title="Te esperamos en Cañaveral"
        intro="Consulta la dirección, los horarios y los servicios de la clínica, y pide cita cuando mejor te venga."
      />

      <section className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="order-2 space-y-4 lg:order-1">
            {isLoading && <Loading label="Cargando la clínica…" />}
            {error && <ErrorBox error={error} />}
            {data?.map((clinic) => <ClinicCard key={clinic.id} clinic={clinic} />)}
          </div>
          <div className="order-1 h-[360px] overflow-hidden rounded-3xl border border-ink-100 shadow-card lg:order-2 lg:h-[560px]">
            <Suspense fallback={<Loading label="Cargando mapa…" />}>
              <ClinicMap clinics={data ?? []} selected={null} onSelect={() => {}} />
            </Suspense>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
