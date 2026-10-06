import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarCheck, Clock, LocateFixed, MapPin, Navigation, Phone, Search, Siren } from "lucide-react";
import { useClinics, type Clinic } from "../lib/api";
import { REGIONS } from "../lib/site";
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

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function ClinicCard({ clinic, distance, active, onSelect }: { clinic: Clinic; distance?: number; active: boolean; onSelect: () => void }) {
  return (
    <article
      className={`rounded-3xl border-2 bg-white p-6 transition ${active ? "border-brand-500 shadow-lift" : "border-ink-100 hover:border-brand-200"}`}
    >
      <button onClick={onSelect} className="w-full text-left">
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
          {distance !== undefined && <span className="ml-auto shrink-0 font-bold text-brand-700">{distance.toFixed(1)} km</span>}
        </p>
      </button>

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
          href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`}
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
  const [params, setParams] = useSearchParams();
  const region = params.get("region") ?? "";
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);
  const [selected, setSelected] = useState<Clinic | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState("");
  const [locating, setLocating] = useState(false);

  const { data, isLoading, error } = useClinics({ region: region || undefined, q: q || undefined });

  const clinics = useMemo(() => {
    const list = (data ?? []).map((c) => ({ clinic: c, distance: position ? distanceKm(position, c) : undefined }));
    if (position) list.sort((a, b) => a.distance! - b.distance!);
    return list;
  }, [data, position]);

  const update = (next: { region?: string; q?: string }) => {
    const merged = { region, q, ...next };
    const search = new URLSearchParams();
    if (merged.region) search.set("region", merged.region);
    if (merged.q) search.set("q", merged.q);
    setParams(search, { replace: true });
    setSelected(null);
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no permite la geolocalización.");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        update({ region: "", q: "" });
        setDraft("");
      },
      () => {
        setGeoError("No hemos podido obtener tu ubicación. Revisa los permisos del navegador.");
        setLocating(false);
      },
    );
  };

  return (
    <>
      <PageHero
        eyebrow="Tus clínicas"
        title="Encuentra tu clínica más cercana"
        intro="Consulta dirección, horarios y servicios de cada clínica y pide cita en la que te quede más cerca."
      />

      <section className="container-page py-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: draft.trim() });
          }}
          className="flex flex-col gap-3 rounded-3xl border border-ink-100 bg-white p-3 shadow-card md:flex-row"
        >
          <label className="flex flex-1 items-center gap-3 px-3">
            <Search className="size-5 text-brand-600" aria-hidden />
            <span className="sr-only">Buscar por ciudad, código postal o provincia</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ciudad, código postal o provincia"
              className="w-full py-3 text-ink-900 placeholder:text-ink-500 focus:outline-none"
            />
          </label>
          <button type="submit" className="rounded-2xl bg-ink-900 px-6 py-3 font-extrabold text-white uppercase hover:bg-ink-800">
            Buscar
          </button>
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-brand-600 px-5 py-3 font-extrabold text-brand-700 uppercase hover:bg-brand-50 disabled:opacity-60"
          >
            <LocateFixed className={`size-5 ${locating ? "animate-pulse" : ""}`} aria-hidden /> Cerca de mí
          </button>
        </form>
        {geoError && <ErrorBox error={new Error(geoError)} className="mt-4" />}

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por comunidad">
          {["", ...REGIONS].map((r) => (
            <button
              key={r || "todas"}
              onClick={() => update({ region: r })}
              aria-pressed={region === r}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                region === r ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-700 hover:bg-brand-100"
              }`}
            >
              {r || "Todas"}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="order-2 space-y-4 lg:order-1 lg:max-h-[720px] lg:overflow-y-auto lg:pr-2">
            {isLoading && <Loading label="Buscando clínicas…" />}
            {error && <ErrorBox error={error} />}
            {data && (
              <p className="text-sm font-bold text-ink-500" aria-live="polite">
                {data.length === 0
                  ? "No hemos encontrado clínicas con esa búsqueda."
                  : `${data.length} ${data.length === 1 ? "clínica encontrada" : "clínicas encontradas"}${position ? ", ordenadas por cercanía" : ""}`}
              </p>
            )}
            {clinics.map(({ clinic, distance }) => (
              <ClinicCard key={clinic.id} clinic={clinic} distance={distance} active={selected?.id === clinic.id} onSelect={() => setSelected(clinic)} />
            ))}
          </div>
          <div className="order-1 h-[360px] overflow-hidden rounded-3xl border border-ink-100 shadow-card lg:sticky lg:top-28 lg:order-2 lg:h-[720px]">
            <Suspense fallback={<Loading label="Cargando mapa…" />}>
              <ClinicMap clinics={data ?? []} selected={selected} onSelect={setSelected} />
            </Suspense>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
