// Copia el contenido de la API local a frontend/src/demo/data.json para la demo estática.
// Uso (con la API en marcha): node scripts/export-demo-data.mjs
import { writeFileSync } from "node:fs";

const API = process.env.API_URL ?? "http://localhost:8010/api";

async function get(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`${path} respondió ${res.status}`);
  return res.json();
}

const blog = await get("/blog");
const data = {
  clinics: await get("/clinics"),
  services: await get("/services"),
  specialties: await get("/specialties"),
  posts: await Promise.all(blog.map((p) => get(`/blog/${p.slug}`))),
  testimonials: await get("/testimonials"),
  faqs: await get("/faqs"),
};

const target = new URL("../frontend/src/demo/data.json", import.meta.url);
writeFileSync(target, JSON.stringify(data, null, 1));
console.log("data.json actualizado:", Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])));
