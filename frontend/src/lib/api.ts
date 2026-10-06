import { useQuery } from "@tanstack/react-query";

export type Clinic = {
  id: number;
  slug: string;
  name: string;
  region: string;
  city: string;
  address: string;
  postal_code: string;
  phone: string;
  lat: number;
  lng: number;
  hours_vet: string;
  hours_shop: string;
  hours_grooming: string;
  services: string[];
  open_24h: boolean;
};

export type Service = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  bullets: string[];
  icon: string;
  bookable: boolean;
};

export type Specialty = {
  id: number;
  slug: string;
  title: string;
  description: string;
  bullets: string[];
  icon: string;
};

export type BlogPostSummary = {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  published_at: string;
};

export type BlogPost = BlogPostSummary & { content: string };

export type Testimonial = {
  id: number;
  author: string;
  pet: string;
  text: string;
  rating: number;
  published_at: string;
};

export type Faq = {
  id: number;
  category: string;
  question: string;
  answer: string;
  featured: boolean;
};

export type Availability = { date: string; open: boolean; slots: string[] };

export type Species = "perro" | "gato" | "exotico";

export type AppointmentInput = {
  clinic_id: number;
  service: string;
  date: string;
  time: string;
  pet_name: string;
  species: Species;
  owner_name: string;
  email: string;
  phone: string;
  is_member: boolean;
  notes: string;
};

export type Appointment = AppointmentInput & { id: number; status: string; created_at: string };

export type PetInput = { name: string; species: Species; breed: string; birth_date: string | null };

export type MemberInput = {
  plan: "mensual" | "anual";
  first_name: string;
  last_name: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  clinic_id: number;
  pets: PetInput[];
  accepts_terms: boolean;
  accepts_marketing: boolean;
};

export type Member = Omit<MemberInput, "accepts_terms"> & { id: number; created_at: string };

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
};

export type Subscriber = { id: number; name: string; email: string; created_at: string };

export type AdminStats = {
  appointments: number;
  appointments_pending: number;
  members: number;
  messages: number;
  subscribers: number;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function errorMessage(body: unknown, status: number): string {
  const detail = (body as { detail?: unknown })?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return "Revisa los datos del formulario: hay campos con un formato no válido.";
  if (status >= 500) return "Ha ocurrido un error en el servidor. Inténtalo de nuevo en unos minutos.";
  return "No se ha podido completar la operación.";
}

/** En la demo estática (GitHub Pages) no hay backend: se usa la API simulada. */
export const IS_DEMO = import.meta.env.VITE_DEMO === "true";

export async function api<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  if (IS_DEMO) {
    const { mockFetch } = await import("../demo/mockApi");
    const { status, body } = await mockFetch(path, init, init?.token);
    if (status >= 400) throw new ApiError(status, errorMessage(body, status));
    return body as T;
  }

  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  if (init?.token) headers.set("X-Admin-Token", init.token);

  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "No hay conexión con el servidor. Comprueba que la API está en marcha.");
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, errorMessage(body, res.status));
  return body as T;
}

export const post = <T>(path: string, data: unknown) => api<T>(path, { method: "POST", body: JSON.stringify(data) });

// ---------- Hooks de contenido ----------

const STATIC = { staleTime: 5 * 60 * 1000 };

export const useClinics = (params: { region?: string; q?: string } = {}) => {
  const search = new URLSearchParams();
  if (params.region) search.set("region", params.region);
  if (params.q) search.set("q", params.q);
  const qs = search.toString();
  return useQuery({
    queryKey: ["clinics", params.region ?? "", params.q ?? ""],
    queryFn: () => api<Clinic[]>(`/clinics${qs ? `?${qs}` : ""}`),
    ...STATIC,
  });
};

export const useServices = () =>
  useQuery({ queryKey: ["services"], queryFn: () => api<Service[]>("/services"), ...STATIC });

export const useSpecialties = () =>
  useQuery({ queryKey: ["specialties"], queryFn: () => api<Specialty[]>("/specialties"), ...STATIC });

export const usePosts = (limit?: number) =>
  useQuery({
    queryKey: ["blog", limit ?? "all"],
    queryFn: () => api<BlogPostSummary[]>(`/blog${limit ? `?limit=${limit}` : ""}`),
    ...STATIC,
  });

export const usePost = (slug: string) =>
  useQuery({ queryKey: ["blog", "post", slug], queryFn: () => api<BlogPost>(`/blog/${slug}`), ...STATIC });

export const useTestimonials = () =>
  useQuery({ queryKey: ["testimonials"], queryFn: () => api<Testimonial[]>("/testimonials"), ...STATIC });

export const useFaqs = (featured?: boolean) =>
  useQuery({
    queryKey: ["faqs", featured ?? "all"],
    queryFn: () => api<Faq[]>(`/faqs${featured === undefined ? "" : `?featured=${featured}`}`),
    ...STATIC,
  });

export const useAvailability = (clinicId: number | null, date: string) =>
  useQuery({
    queryKey: ["availability", clinicId, date],
    queryFn: () => api<Availability>(`/clinics/${clinicId}/availability?date=${date}`),
    enabled: !!clinicId && !!date,
  });
