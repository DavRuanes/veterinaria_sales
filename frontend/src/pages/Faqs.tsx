import { useFaqs } from "../lib/api";
import { SITE } from "../lib/site";
import { ButtonLink, ErrorBox, Loading, PageHero } from "../components/ui";
import { FaqAccordion } from "../components/sections";

export default function Faqs() {
  const { data, isLoading, error } = useFaqs();
  const groups = [...new Set(data?.map((f) => f.category))];

  return (
    <>
      <PageHero eyebrow="Ayuda" title="Preguntas frecuentes" intro="Todo lo que necesitas saber sobre la cuota de socio, las citas y nuestros servicios." />
      <section className="container-page max-w-4xl py-14">
        {isLoading && <Loading />}
        {error && <ErrorBox error={error} />}
        {groups.map((g) => (
          <div key={g} className="mb-12">
            <h2 className="mb-5 text-2xl font-semibold">{g}</h2>
            <FaqAccordion faqs={data!.filter((f) => f.category === g)} />
          </div>
        ))}
        <div className="rounded-3xl bg-ink-900 p-8 text-center sm:p-10">
          <h2 className="text-2xl font-semibold text-white">¿No encuentras lo que buscas?</h2>
          <p className="mt-2 text-ink-300">
            Llámanos al {SITE.phone} ({SITE.phoneHours.toLowerCase()}) o escríbenos.
          </p>
          <ButtonLink to="/contacto" variant="light" className="mt-6">
            Contactar
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
