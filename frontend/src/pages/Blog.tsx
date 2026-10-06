import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePost, usePosts } from "../lib/api";
import { formatDate, photo, PHOTOS } from "../lib/site";
import { ErrorBox, Loading, PageHero } from "../components/ui";
import { BlogCard, CtaBand, Newsletter } from "../components/sections";

export function BlogList() {
  const { data, isLoading, error } = usePosts();
  const [category, setCategory] = useState("");
  const categories = [...new Set(data?.map((p) => p.category))];
  const posts = data?.filter((p) => !category || p.category === category);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Consejos y noticias"
        intro="Artículos de nuestros veterinarios para cuidar mejor de tu mascota en cada etapa de su vida."
        image={photo(PHOTOS.dogBeach, 1800)}
      />
      <section className="container-page py-14">
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          {["", ...categories].map((c) => (
            <button
              key={c || "todas"}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                category === c ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-700 hover:bg-brand-100"
              }`}
            >
              {c || "Todas"}
            </button>
          ))}
        </div>
        {isLoading && <Loading />}
        {error && <ErrorBox error={error} />}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{posts?.map((p) => <BlogCard key={p.id} post={p} />)}</div>
      </section>
      <Newsletter />
    </>
  );
}

/** Formato mínimo del contenido: párrafos separados por línea en blanco y "## " para subtítulos. */
function Content({ text }: { text: string }) {
  return (
    <div className="prose-vet">
      {text.split(/\n\n+/).map((block, i) => {
        if (block.startsWith("## ")) {
          const [heading, ...rest] = block.split("\n");
          return (
            <div key={i}>
              <h2>{heading.slice(3)}</h2>
              {rest.length > 0 && <p>{rest.join(" ")}</p>}
            </div>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}

export function BlogPostPage() {
  const { slug = "" } = useParams();
  const { data, isLoading, error } = usePost(slug);
  const related = usePosts(4);

  if (isLoading) return <Loading />;
  if (error || !data)
    return (
      <div className="container-page py-20">
        <ErrorBox error={error ?? new Error("Artículo no encontrado")} />
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 font-bold text-brand-700">
          <ArrowLeft className="size-4" aria-hidden /> Volver al blog
        </Link>
      </div>
    );

  return (
    <>
      <article>
        <header className="relative bg-ink-900">
          <img src={data.image} alt="" className="absolute inset-0 size-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-ink-950/30" />
          <div className="container-page relative max-w-3xl py-20 sm:py-28">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-aqua-300 hover:text-white">
              <ArrowLeft className="size-4" aria-hidden /> Blog
            </Link>
            <p className="mt-6 text-sm font-extrabold tracking-wider text-aqua-300 uppercase">
              {data.category} · {formatDate(data.published_at)}
            </p>
            <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">{data.title}</h1>
          </div>
        </header>
        <div className="container-page max-w-3xl py-14">
          <p className="mb-8 text-xl leading-relaxed font-semibold text-ink-800">{data.excerpt}</p>
          <Content text={data.content} />
        </div>
      </article>

      <section className="bg-ink-50 py-16">
        <div className="container-page">
          <h2 className="mb-8 text-3xl font-bold">Sigue leyendo</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.data
              ?.filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
