/**
 * API simulada para la demo estática (GitHub Pages).
 * Replica las reglas del backend FastAPI y guarda los envíos en el navegador del visitante.
 */
import data from "./data.json";

export const DEMO_ADMIN_TOKEN = "demo";

type Result = { status: number; body: unknown };
type Row = Record<string, unknown> & { id: number };
type Db = { appointments: Row[]; members: Row[]; messages: Row[]; subscribers: Row[] };

const STORAGE_KEY = "vs-demo-db";
let memoryDb: Db | null = null;

function load(): Db {
  if (memoryDb) return memoryDb;
  const empty: Db = { appointments: [], members: [], messages: [], subscribers: [] };
  try {
    memoryDb = { ...empty, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    memoryDb = empty;
  }
  return memoryDb!;
}

function save(db: Db) {
  memoryDb = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* sin almacenamiento: los datos viven solo en memoria */
  }
}

const ok = (body: unknown, status = 200): Result => ({ status, body });
const fail = (status: number, detail: unknown): Result => ({ status, body: { detail } });
const invalid = () => fail(422, [{ msg: "invalid" }]);
const nextId = (rows: Row[]) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
const now = () => new Date().toISOString();

// ---------- Horarios (igual que backend/app/scheduling.py) ----------

const OPEN_DAYS = [2, 3, 4, 5, 6]; // martes a sábado
const MAX_DAYS_AHEAD = 60;
const ALL_SLOTS = Array.from({ length: 22 }, (_, i) => {
  const minutes = 10 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

function parseDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isOpen(iso: string) {
  return OPEN_DAYS.includes(parseDay(iso).getDay());
}

function freeSlots(clinicId: number, iso: string) {
  const day = parseDay(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + MAX_DAYS_AHEAD);
  if (!isOpen(iso) || day < today || day > limit) return [];

  const taken = new Set(
    load()
      .appointments.filter((a) => a.clinic_id === clinicId && a.date === iso && a.status !== "cancelada")
      .map((a) => String(a.time).slice(0, 5)),
  );
  const nowTime = new Date().toTimeString().slice(0, 5);
  const isToday = day.getTime() === today.getTime();
  return ALL_SLOTS.filter((s) => !taken.has(s) && (!isToday || s > nowTime));
}

// ---------- Validación ----------

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+\s]{9,15}$/;
const DNI = /^[0-9XYZxyz][0-9]{7}[A-Za-z]$/;
const SPECIES = ["perro", "gato", "exotico"];

const str = (v: unknown, min = 1, max = 300) => typeof v === "string" && v.trim().length >= min && v.length <= max;

// ---------- Rutas ----------

const clinicExists = (id: unknown) => data.clinics.some((c) => c.id === id);

function getRoute(path: string, params: URLSearchParams, token: string): Result {
  if (path === "/health") return ok({ status: "ok" });

  if (path === "/clinics") {
    const region = params.get("region");
    const q = params.get("q")?.trim().toLowerCase();
    return ok(
      data.clinics.filter(
        (c) =>
          (!region || c.region === region) &&
          (!q ||
            [c.name, c.city, c.address, c.region].some((f) => f.toLowerCase().includes(q)) ||
            c.postal_code.startsWith(q)),
      ),
    );
  }

  const availability = path.match(/^\/clinics\/(\d+)\/availability$/);
  if (availability) {
    const id = Number(availability[1]);
    const date = params.get("date") ?? "";
    if (!clinicExists(id)) return fail(404, "Clínica no encontrada");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return invalid();
    return ok({ date, open: isOpen(date), slots: freeSlots(id, date) });
  }

  const clinic = path.match(/^\/clinics\/([\w-]+)$/);
  if (clinic) {
    const found = data.clinics.find((c) => c.slug === clinic[1]);
    return found ? ok(found) : fail(404, "Clínica no encontrada");
  }

  if (path === "/services") return ok(data.services);
  if (path === "/specialties") return ok(data.specialties);
  if (path === "/testimonials") return ok(data.testimonials);

  if (path === "/faqs") {
    const featured = params.get("featured");
    return ok(featured === null ? data.faqs : data.faqs.filter((f) => f.featured === (featured === "true")));
  }

  if (path === "/blog") {
    const category = params.get("category");
    const limit = Number(params.get("limit") ?? 50);
    return ok(data.posts.filter((p) => !category || p.category === category).slice(0, limit));
  }

  const post = path.match(/^\/blog\/([\w-]+)$/);
  if (post) {
    const found = data.posts.find((p) => p.slug === post[1]);
    return found ? ok(found) : fail(404, "Artículo no encontrado");
  }

  if (path.startsWith("/admin/")) {
    if (token !== DEMO_ADMIN_TOKEN) return fail(401, "Token de administración no válido");
    const db = load();
    const newest = (rows: Row[]) => [...rows].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    switch (path) {
      case "/admin/stats":
        return ok({
          appointments: db.appointments.length,
          appointments_pending: db.appointments.filter((a) => a.status === "pendiente").length,
          members: db.members.length,
          messages: db.messages.length,
          subscribers: db.subscribers.length,
        });
      case "/admin/appointments":
        return ok([...db.appointments].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)));
      case "/admin/members":
        return ok(newest(db.members));
      case "/admin/messages":
        return ok(newest(db.messages));
      case "/admin/subscribers":
        return ok(newest(db.subscribers));
    }
  }

  return fail(404, "Not Found");
}

function postRoute(path: string, b: Record<string, unknown>): Result {
  const db = load();

  if (path === "/appointments") {
    if (!clinicExists(b.clinic_id)) return fail(404, "Clínica no encontrada");
    if (
      !str(b.service, 2, 160) || !str(b.pet_name, 1, 80) || !str(b.owner_name, 2, 120) ||
      !SPECIES.includes(String(b.species)) || !EMAIL.test(String(b.email)) || !PHONE.test(String(b.phone))
    )
      return invalid();
    const time = String(b.time).slice(0, 5);
    if (!freeSlots(Number(b.clinic_id), String(b.date)).includes(time))
      return fail(409, "Ese horario ya no está disponible. Elige otro, por favor.");

    const row: Row = {
      id: nextId(db.appointments), clinic_id: b.clinic_id, service: b.service, date: b.date, time: `${time}:00`,
      pet_name: b.pet_name, species: b.species, owner_name: b.owner_name, email: b.email, phone: b.phone,
      is_member: !!b.is_member, notes: b.notes ?? "", status: "pendiente", created_at: now(),
    };
    save({ ...db, appointments: [...db.appointments, row] });
    return ok(row, 201);
  }

  if (path === "/members") {
    if (!clinicExists(b.clinic_id)) return fail(404, "Clínica no encontrada");
    const pets = Array.isArray(b.pets) ? (b.pets as Record<string, unknown>[]) : [];
    if (
      !["mensual", "anual"].includes(String(b.plan)) || b.accepts_terms !== true ||
      !str(b.first_name, 2, 80) || !str(b.last_name, 2, 120) || !DNI.test(String(b.dni)) ||
      !EMAIL.test(String(b.email)) || !PHONE.test(String(b.phone)) || !str(b.address, 4, 200) ||
      !/^[0-9]{5}$/.test(String(b.postal_code)) || !str(b.city, 2, 80) ||
      pets.length < 1 || pets.length > 6 || pets.some((p) => !str(p.name, 1, 80) || !SPECIES.includes(String(p.species)))
    )
      return invalid();
    if (db.members.some((m) => m.email === b.email)) return fail(409, "Ya existe un socio registrado con ese correo.");

    const { accepts_terms: _, ...rest } = b;
    const row: Row = { ...rest, dni: String(b.dni).toUpperCase(), id: nextId(db.members), created_at: now() };
    save({ ...db, members: [...db.members, row] });
    return ok(row, 201);
  }

  if (path === "/contact") {
    if (b.accepts_privacy !== true || !str(b.name, 2, 120) || !EMAIL.test(String(b.email)) || !str(b.subject, 2, 120) || !str(b.message, 10, 3000))
      return invalid();
    const row: Row = {
      id: nextId(db.messages), name: b.name, email: b.email, phone: b.phone ?? "",
      subject: b.subject, message: b.message, created_at: now(),
    };
    save({ ...db, messages: [...db.messages, row] });
    return ok(row, 201);
  }

  if (path === "/newsletter") {
    if (b.accepts_privacy !== true || !str(b.name, 2, 120) || !EMAIL.test(String(b.email))) return invalid();
    if (!db.subscribers.some((s) => s.email === b.email)) {
      const row: Row = { id: nextId(db.subscribers), name: b.name, email: b.email, created_at: now() };
      save({ ...db, subscribers: [...db.subscribers, row] });
    }
    return ok({ ok: true }, 201);
  }

  return fail(404, "Not Found");
}

function patchRoute(path: string, b: Record<string, unknown>, token: string): Result {
  if (token !== DEMO_ADMIN_TOKEN) return fail(401, "Token de administración no válido");
  const match = path.match(/^\/admin\/appointments\/(\d+)$/);
  if (!match) return fail(404, "Not Found");
  if (!["pendiente", "confirmada", "cancelada", "completada"].includes(String(b.status))) return invalid();

  const db = load();
  const row = db.appointments.find((a) => a.id === Number(match[1]));
  if (!row) return fail(404, "Cita no encontrada");
  const updated = { ...row, status: b.status };
  save({ ...db, appointments: db.appointments.map((a) => (a.id === row.id ? updated : a)) });
  return ok(updated);
}

export async function mockFetch(fullPath: string, init: RequestInit = {}, token = ""): Promise<Result> {
  // Pequeña latencia para que los estados de carga se vean como con la API real.
  await new Promise((r) => setTimeout(r, 150));
  const [path, query = ""] = fullPath.split("?");
  const params = new URLSearchParams(query);
  const method = (init.method ?? "GET").toUpperCase();
  let body: Record<string, unknown> = {};
  if (typeof init.body === "string") {
    try {
      body = JSON.parse(init.body);
    } catch {
      return fail(400, "There was an error parsing the body");
    }
  }

  if (method === "GET") return getRoute(path, params, token);
  if (method === "POST") return postRoute(path, body);
  if (method === "PATCH") return patchRoute(path, body, token);
  return fail(405, "Method Not Allowed");
}
