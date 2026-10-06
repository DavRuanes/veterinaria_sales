import { Building, CircleCheck, HandHeart, Infinity as InfinityIcon, PiggyBank } from "lucide-react";
import { photo, PHOTOS, SITE } from "../lib/site";
import { ButtonLink, Eyebrow, PageHero, SectionHeading } from "../components/ui";
import { AppPromo, IncludedList } from "../components/sections";

const INCLUDED = [
  "Consultas ilimitadas",
  "Seguimiento veterinario",
  "Vacunas y recordatorios de vacunación",
  "Desparasitaciones",
  "Microchip y pasaporte",
  "Higiene bucal y corte de uñas",
  "Curas y suturas",
  "Descuentos en tienda y peluquería",
  "Precios exclusivos en especialidades",
];

const PILLARS = [
  { Icon: PiggyBank, title: "Cuota mensual única", text: "Un precio fijo para cualquier mascota, sea cual sea su raza, edad o tamaño." },
  { Icon: InfinityIcon, title: "Todo incluido", text: "Sin carencias, sin copagos y sin límites de uso desde el primer día." },
  { Icon: Building, title: "Red de clínicas propias", text: "Clínicas en toda España con el mismo nivel de calidad y equipamiento." },
  { Icon: HandHeart, title: "Trato humano y vocación", text: "Profesionales que aman a los animales tanto como tú." },
];

const STEPS = [
  { title: "Hazte socio online", text: "Completa el alta en menos de 2 minutos y elige tu clínica." },
  { title: "Visítanos sin preocuparte", text: "Acude siempre que lo necesites sin pensar en la factura." },
  { title: "Disfruta de tus ventajas", text: "Descuentos exclusivos en alimentación, peluquería y especialidades." },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="¿Qué es Veterinarias Sales?"
        title="Sin carencias. Sin copagos. Sin límites."
        intro="Somos la seguridad social de tu mascota: un modelo de clínicas veterinarias que hace accesible el mejor cuidado a todas las familias."
        image={photo(PHOTOS.beagle, 1800)}
      >
        <ButtonLink to="/hazte-socio" size="lg">
          Hazte socio ahora
        </ButtonLink>
      </PageHero>

      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <div>
          <Eyebrow>Nuestro modelo</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">Cuidar de tu mascota no debería ser un lujo</h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-600">
            Creemos en una veterinaria cercana y transparente, en la que la prevención es la base y las facturas
            imprevisibles no existen. Por eso creamos un modelo de cuota única que incluye todo lo que tu mascota
            necesita en su día a día.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-600">
            Con una sola cuota tienes acceso a consultas ilimitadas, seguimiento veterinario, desparasitaciones,
            recordatorios de vacunación y mucho más en cualquiera de nuestras clínicas.
          </p>
        </div>
        <img src={photo(PHOTOS.catDog, 1000)} alt="Un perro y un gato descansando juntos" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift" />
      </section>

      <section className="bg-ink-900 py-20">
        <div className="container-page">
          <SectionHeading light eyebrow="Ventajas" title="Por qué miles de familias ya son socias" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(({ Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-ink-700 bg-ink-800 p-7">
                <Icon className="size-10 text-aqua-300" aria-hidden />
                <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-ink-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="Precio" title="Una cuota, todo incluido" intro="Elige cómo prefieres pagar. Sin permanencia." />
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border-2 border-ink-100 bg-white p-8">
            <h3 className="text-xl font-semibold">Pago mensual</h3>
            <p className="mt-4 font-display text-5xl font-bold text-ink-900">
              {SITE.priceMonthly}€<span className="text-lg text-ink-500">/mes</span>
            </p>
            <p className="mt-2 text-ink-600">Paga mes a mes y date de baja cuando quieras.</p>
            <ButtonLink to="/hazte-socio?plan=mensual" variant="outline" className="mt-8 w-full">
              Elegir mensual
            </ButtonLink>
          </div>
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white shadow-lift">
            <span className="absolute -top-3 right-6 rounded-full bg-heart px-4 py-1 text-xs font-extrabold uppercase">1 mes gratis</span>
            <h3 className="text-xl font-semibold text-white">Pago anual</h3>
            <p className="mt-4 font-display text-5xl font-bold">
              {SITE.priceYearly}€<span className="text-lg text-brand-200">/año</span>
            </p>
            <p className="mt-2 text-brand-100">Ahorra un mes pagando el año completo.</p>
            <ButtonLink to="/hazte-socio?plan=anual" variant="light" className="mt-8 w-full">
              Elegir anual
            </ButtonLink>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-4xl rounded-3xl bg-brand-50 p-8">
          <h3 className="mb-6 text-xl font-semibold">¿Qué incluye la cuota?</h3>
          <IncludedList items={INCLUDED} columns={3} />
        </div>
      </section>

      <section className="bg-ink-50 py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Cómo funciona" title="Empieza en 3 pasos" />
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-3xl bg-white p-8 shadow-card">
                <span className="font-display text-6xl font-bold text-brand-100">0{i + 1}</span>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-ink-600">{s.text}</p>
                <CircleCheck className="absolute top-8 right-8 size-7 text-heart" aria-hidden />
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <ButtonLink to="/hazte-socio" size="lg">
              Hazte socio ahora
            </ButtonLink>
          </div>
        </div>
      </section>

      <AppPromo />
    </>
  );
}
