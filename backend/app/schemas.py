import datetime as dt
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Contenido ----------

class ClinicOut(ORM):
    id: int
    slug: str
    name: str
    region: str
    city: str
    address: str
    postal_code: str
    phone: str
    lat: float
    lng: float
    hours_vet: str
    hours_shop: str
    hours_grooming: str
    services: list[str]
    open_24h: bool


class ServiceOut(ORM):
    id: int
    slug: str
    title: str
    summary: str
    description: str
    bullets: list[str]
    icon: str
    bookable: bool


class SpecialtyOut(ORM):
    id: int
    slug: str
    title: str
    description: str
    bullets: list[str]
    icon: str


class BlogPostSummary(ORM):
    id: int
    slug: str
    title: str
    category: str
    excerpt: str
    image: str
    published_at: dt.date


class BlogPostOut(BlogPostSummary):
    content: str


class TestimonialOut(ORM):
    id: int
    author: str
    pet: str
    text: str
    rating: int
    published_at: dt.date


class FaqOut(ORM):
    id: int
    category: str
    question: str
    answer: str
    featured: bool


class AvailabilityOut(BaseModel):
    date: dt.date
    open: bool
    slots: list[str]


# ---------- Formularios ----------

Species = Literal["perro", "gato", "exotico"]


class AppointmentIn(BaseModel):
    clinic_id: int
    service: str = Field(min_length=2, max_length=160)
    date: dt.date
    time: dt.time
    pet_name: str = Field(min_length=1, max_length=80)
    species: Species
    owner_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(pattern=r"^[0-9+\s]{9,15}$")
    is_member: bool = False
    notes: str = Field(default="", max_length=1000)


class AppointmentOut(ORM):
    id: int
    clinic_id: int
    service: str
    date: dt.date
    time: dt.time
    pet_name: str
    species: str
    owner_name: str
    email: str
    phone: str
    is_member: bool
    notes: str
    status: str
    created_at: dt.datetime


class PetIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    species: Species
    breed: str = Field(default="", max_length=80)
    birth_date: dt.date | None = None


class MemberIn(BaseModel):
    plan: Literal["mensual", "anual"]
    first_name: str = Field(min_length=2, max_length=80)
    last_name: str = Field(min_length=2, max_length=120)
    dni: str = Field(pattern=r"^[0-9XYZxyz][0-9]{7}[A-Za-z]$")
    email: EmailStr
    phone: str = Field(pattern=r"^[0-9+\s]{9,15}$")
    address: str = Field(min_length=4, max_length=200)
    postal_code: str = Field(pattern=r"^[0-9]{5}$")
    city: str = Field(min_length=2, max_length=80)
    clinic_id: int
    pets: list[PetIn] = Field(min_length=1, max_length=6)
    accepts_terms: Literal[True]
    accepts_marketing: bool = False


class MemberOut(ORM):
    id: int
    plan: str
    first_name: str
    last_name: str
    dni: str
    email: str
    phone: str
    address: str
    postal_code: str
    city: str
    clinic_id: int
    pets: list[dict]
    accepts_marketing: bool
    created_at: dt.datetime


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=30)
    subject: str = Field(min_length=2, max_length=120)
    message: str = Field(min_length=10, max_length=3000)
    accepts_privacy: Literal[True]


class ContactOut(ORM):
    id: int
    name: str
    email: str
    phone: str
    subject: str
    message: str
    created_at: dt.datetime


class NewsletterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    accepts_privacy: Literal[True]


class NewsletterOut(ORM):
    id: int
    name: str
    email: str
    created_at: dt.datetime


class AdminStats(BaseModel):
    appointments: int
    appointments_pending: int
    members: int
    messages: int
    subscribers: int


class StatusUpdate(BaseModel):
    status: Literal["pendiente", "confirmada", "cancelada", "completada"]
