import { useSpecialties } from "../lib/api";
import { photo, PHOTOS } from "../lib/site";
import { Icon } from "../components/Icon";
import { ButtonLink, ErrorBox, Loading, PageHero, SectionHeading } from "../components/ui";
import { CtaBand, IncludedList } from "../components/sections";

export default function Specialties() {
  const { data, isLoading, error } = useSpecialties();

  return (
    <>
      <PageHero
        eyebrow="Especialidades"
        title="Un equipo experto para cada necesidad"
        intro="Más de 150 veterinarios especializados trabajan en nuestras clínicas para ofrecer a tu mascota el mejor diagnóstico y tratamiento."
        image={photo(PHOTOS.vetCat, 1800)}
      >
        <ButtonLink to="/pide-cita" size="lg">
          Pide cita
        </ButtonLink>
      </PageHero>

      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Nuestras especialidades"
          title="Medicina especializada en tu clínica de siempre"
          intro="Como socio, tienes acceso a nuestros especialistas con precios exclusivos."
        />
        {isLoading && <Loading />}
        {error && <ErrorBox error={error} />}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((s) => (
            <article key={s.slug} id={s.slug} className="group rounded-3xl border border-ink-100 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lift">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-ink-900 text-aqua-300 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon name={s.icon} className="size-7" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 mb-5 text-ink-600">{s.description}</p>
              <IncludedList items={s.bullets} />
            </article>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
