import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, LogOut } from "lucide-react";
import {
  api,
  ApiError,
  IS_DEMO,
  useClinics,
  type AdminStats,
  type Appointment,
  type ContactMessage,
  type Member,
  type Subscriber,
} from "../lib/api";
import { SPECIES_LABEL } from "../lib/site";
import { Button, ErrorBox, Loading } from "../components/ui";

const TOKEN_KEY = "vs-admin-token";
const STATUSES = ["pendiente", "confirmada", "completada", "cancelada"] as const;
const STATUS_STYLE: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmada: "bg-brand-100 text-brand-800",
  completada: "bg-emerald-100 text-emerald-800",
  cancelada: "bg-ink-100 text-ink-500",
};

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function useAdmin<T>(token: string, path: string) {
  return useQuery({ queryKey: ["admin", path, token], queryFn: () => api<T>(`/admin${path}`, { token }) });
}

function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty: boolean }) {
  if (empty) return <p className="rounded-2xl bg-ink-50 p-6 text-ink-500">Todavía no hay registros.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-ink-50 text-xs tracking-wider text-ink-500 uppercase">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-extrabold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-ink-100">{children}</tbody>
      </table>
    </div>
  );
}

const fmt = (iso: string) => new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });

function Appointments({ token }: { token: string }) {
  const { data, isLoading, error } = useAdmin<Appointment[]>(token, "/appointments");
  const clinics = useClinics();
  const client = useQueryClient();
  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api<Appointment>(`/admin/appointments/${id}`, { method: "PATCH", token, body: JSON.stringify({ status }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin"] }),
  });
  const clinicName = (id: number) => clinics.data?.find((c) => c.id === id)?.city ?? `#${id}`;

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  return (
    <>
      {update.error && <ErrorBox error={update.error} className="mb-4" />}
      <Table head={["Fecha", "Clínica", "Servicio", "Mascota", "Tutor", "Contacto", "Estado"]} empty={!data?.length}>
        {data?.map((a) => (
          <tr key={a.id} className="align-top">
            <td className="px-4 py-3 font-bold whitespace-nowrap text-ink-900">{a.date} · {a.time.slice(0, 5)}</td>
            <td className="px-4 py-3">{clinicName(a.clinic_id)}</td>
            <td className="px-4 py-3">{a.service}</td>
            <td className="px-4 py-3">{a.pet_name} <span className="text-ink-500">({SPECIES_LABEL[a.species]})</span></td>
            <td className="px-4 py-3">{a.owner_name}{a.is_member && <span className="ml-1 rounded bg-brand-100 px-1.5 text-xs font-bold text-brand-800">socio</span>}</td>
            <td className="px-4 py-3">{a.email}<br />{a.phone}</td>
            <td className="px-4 py-3">
              <select
                value={a.status}
                onChange={(e) => update.mutate({ id: a.id, status: e.target.value })}
                className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[a.status]}`}
                aria-label={`Estado de la cita de ${a.pet_name}`}
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

function Members({ token }: { token: string }) {
  const { data, isLoading, error } = useAdmin<Member[]>(token, "/members");
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  return (
    <Table head={["Alta", "Titular", "DNI", "Contacto", "Plan", "Mascotas"]} empty={!data?.length}>
      {data?.map((m) => (
        <tr key={m.id}>
          <td className="px-4 py-3 whitespace-nowrap">{fmt(m.created_at)}</td>
          <td className="px-4 py-3 font-bold text-ink-900">{m.first_name} {m.last_name}</td>
          <td className="px-4 py-3">{m.dni}</td>
          <td className="px-4 py-3">{m.email}<br />{m.phone}</td>
          <td className="px-4 py-3 capitalize">{m.plan}</td>
          <td className="px-4 py-3">{m.pets.map((p) => `${p.name} (${SPECIES_LABEL[p.species]})`).join(", ")}</td>
        </tr>
      ))}
    </Table>
  );
}

function Messages({ token }: { token: string }) {
  const { data, isLoading, error } = useAdmin<ContactMessage[]>(token, "/messages");
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  return (
    <Table head={["Fecha", "Nombre", "Contacto", "Asunto", "Mensaje"]} empty={!data?.length}>
      {data?.map((m) => (
        <tr key={m.id} className="align-top">
          <td className="px-4 py-3 whitespace-nowrap">{fmt(m.created_at)}</td>
          <td className="px-4 py-3 font-bold text-ink-900">{m.name}</td>
          <td className="px-4 py-3">{m.email}<br />{m.phone}</td>
          <td className="px-4 py-3">{m.subject}</td>
          <td className="max-w-md px-4 py-3 whitespace-pre-line">{m.message}</td>
        </tr>
      ))}
    </Table>
  );
}

function Subscribers({ token }: { token: string }) {
  const { data, isLoading, error } = useAdmin<Subscriber[]>(token, "/subscribers");
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  return (
    <Table head={["Fecha", "Nombre", "Correo"]} empty={!data?.length}>
      {data?.map((s) => (
        <tr key={s.id}>
          <td className="px-4 py-3">{fmt(s.created_at)}</td>
          <td className="px-4 py-3 font-bold text-ink-900">{s.name}</td>
          <td className="px-4 py-3">{s.email}</td>
        </tr>
      ))}
    </Table>
  );
}

const TABS = [
  { id: "citas", label: "Citas", View: Appointments },
  { id: "socios", label: "Socios", View: Members },
  { id: "mensajes", label: "Mensajes", View: Messages },
  { id: "newsletter", label: "Newsletter", View: Subscribers },
];

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [value, setValue] = useState("");
  const check = useMutation({ mutationFn: (token: string) => api<AdminStats>("/admin/stats", { token }) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    check.mutate(value, { onSuccess: () => onLogin(value) });
  };

  return (
    <section className="container-page flex justify-center py-24">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-ink-100 bg-white p-8 shadow-card">
        <Lock className="size-10 text-brand-600" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold">Panel de administración</h1>
        <label className="mt-6 block">
          <span className="label">Token de acceso</span>
          <input type="password" className="input" required value={value} onChange={(e) => setValue(e.target.value)} />
          {IS_DEMO && <span className="mt-1.5 block text-xs text-ink-500">Versión demo: el token es <strong>demo</strong>. Verás los envíos hechos desde este navegador.</span>}
        </label>
        {check.error && <ErrorBox error={check.error} className="mt-4" />}
        <Button type="submit" loading={check.isPending} className="mt-6 w-full">
          Entrar
        </Button>
      </form>
    </section>
  );
}

export default function Admin() {
  const [token, setToken] = useState(readToken);
  const [tab, setTab] = useState(TABS[0].id);
  const stats = useQuery({
    queryKey: ["admin", "stats", token],
    queryFn: () => api<AdminStats>("/admin/stats", { token }),
    enabled: !!token,
  });

  const login = (value: string) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, value);
    } catch {
      /* sin almacenamiento: el token vive solo en memoria */
    }
    setToken(value);
  };
  const logout = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nada que borrar */
    }
    setToken("");
  };

  if (!token || (stats.error instanceof ApiError && stats.error.status === 401)) return <Login onLogin={login} />;

  const { View } = TABS.find((t) => t.id === tab)!;
  const tiles = stats.data
    ? [
        ["Citas", stats.data.appointments],
        ["Pendientes", stats.data.appointments_pending],
        ["Socios", stats.data.members],
        ["Mensajes", stats.data.messages],
        ["Suscriptores", stats.data.subscribers],
      ]
    : [];

  return (
    <section className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Panel de administración</h1>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="size-4" aria-hidden /> Salir
        </Button>
      </div>
      {stats.error && !(stats.error instanceof ApiError && stats.error.status === 401) && <ErrorBox error={stats.error} className="mt-6" />}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-ink-900 p-5">
            <p className="text-sm font-bold text-ink-300">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 mb-6 flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-bold ${tab === t.id ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-700 hover:bg-brand-100"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <View token={token} />
    </section>
  );
}
