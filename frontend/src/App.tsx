import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Specialties from "./pages/Specialties";
import Preventive from "./pages/Preventive";
import Clinics from "./pages/Clinics";
import AppointmentPage from "./pages/Appointment";
import Membership from "./pages/Membership";
import { BlogList, BlogPostPage } from "./pages/Blog";
import Faqs from "./pages/Faqs";
import Contact from "./pages/Contact";
import Legal, { NotFound } from "./pages/Legal";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="que-es-veterinarias-sales" element={<About />} />
        <Route path="servicios-de-las-clinicas" element={<Services />} />
        <Route path="especialidades" element={<Specialties />} />
        <Route path="medicina-general-y-preventiva" element={<Preventive />} />
        <Route path="tus-clinicas" element={<Clinics />} />
        <Route path="pide-cita" element={<AppointmentPage />} />
        <Route path="hazte-socio" element={<Membership />} />
        <Route path="blog" element={<BlogList />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="faqs" element={<Faqs />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="legal/:page" element={<Legal />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
