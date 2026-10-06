import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import { useServices } from "../lib/api";
import { photo, PHOTOS, SITE } from "../lib/site";
import { Icon } from "../components/Icon";
import { ButtonLink, ErrorBox, Loading, PageHero } from "../components/ui";
import { CtaBand, IncludedList } from "../components/sections";

export default function Services() {
  const { data, isLoading, error } = useServices();
  const { hash } = useLocation();

  // Al llegar desde la portada con #servicio, desplazarse cuando los datos ya están pintados.
  useEffect(() => {
    if (!data || !hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [data, hash]);

  return (
    <>
      <PageHero
        eyebrow="Tus servicios incluidos"
        title="Servicios de las clínicas"
        intro={`Todo lo que tu mascota necesita, en un solo lugar y por solo una cuota de ${SITE.priceMonthly} € al mes.`}
        image={photo(PHOTOS.puppy, 1800)}
      >
        <ButtonLink to="/hazte-socio" size="lg">
          Hazte socio hoy mismo
        </ButtonLink>
        <ButtonLink to="/tus-clinicas" variant="light" size="lg">
          Localiza tu clínica
        </ButtonLink>
      </PageHero>

      <section className="container-page py-16">
        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-ink-600">
          En Veterinarias Sales apostamos por un enfoque integral: tecnología de última generación, equipamiento médico
          avanzado, un equipo profesional multidisciplinar y una atención personalizada en cada caso.
        </p>

        {isLoading && <Loading />}
        {error && <ErrorBox error={error} className="mt-8" />}

        {data && (
          <nav aria-label="Índice de servicios" className="mt-10 flex flex-wrap justify-center gap-2">
            {data.map((s) => (
              <a
                key={s.slug}
                href={`#${s.slug}`}
                className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-bold text-ink-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
              >
                {s.title}
              </a>
            ))}
          </nav>
        )}

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {data?.map((s) => (
            <article
              key={s.slug}
              id={s.slug}
              className="flex scroll-mt-28 flex-col rounded-3xl border border-ink-100 bg-white p-8 shadow-card"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                  <Icon name={s.icon} className="size-7" />
                </span>
                <h2 className="text-2xl font-semibold">{s.title}</h2>
              </div>
              <p className="mt-5 leading-relaxed text-ink-600">{s.description}</p>
              {s.bullets.length > 0 && (
                <div className="mt-6 rounded-2xl bg-brand-50 p-5">
                  <IncludedList items={s.bullets} />
                </div>
              )}
              {s.bookable && (
                <Link
                  to={`/pide-cita?servicio=${s.slug}`}
                  className="mt-6 inline-flex items-center gap-2 self-start text-sm font-extrabold text-brand-700 uppercase hover:text-brand-900"
                >
                  <CalendarCheck className="size-4" aria-hidden /> Pide cita para este servicio
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
