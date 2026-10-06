import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import models, scheduling, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["formularios"])

SLOT_TAKEN = "Ese horario ya no está disponible. Elige otro, por favor."


def _clinic_or_404(db: Session, clinic_id: int) -> models.Clinic:
    clinic = db.get(models.Clinic, clinic_id)
    if not clinic:
        raise HTTPException(404, "Clínica no encontrada")
    return clinic


def _taken_slots(db: Session, clinic_id: int, day: dt.date) -> set[dt.time]:
    return set(
        db.scalars(
            select(models.Appointment.time).where(
                models.Appointment.clinic_id == clinic_id,
                models.Appointment.date == day,
                models.Appointment.status != "cancelada",
            )
        )
    )


@router.get("/clinics/{clinic_id}/availability", response_model=schemas.AvailabilityOut)
def availability(clinic_id: int, date: dt.date = Query(...), db: Session = Depends(get_db)):
    _clinic_or_404(db, clinic_id)
    slots = scheduling.bookable_slots(date, _taken_slots(db, clinic_id, date))
    return {"date": date, "open": scheduling.is_open(date), "slots": [s.strftime("%H:%M") for s in slots]}


@router.post("/appointments", response_model=schemas.AppointmentOut, status_code=201)
def create_appointment(data: schemas.AppointmentIn, db: Session = Depends(get_db)):
    _clinic_or_404(db, data.clinic_id)
    slot = data.time.replace(second=0, microsecond=0)
    if slot not in scheduling.bookable_slots(data.date, _taken_slots(db, data.clinic_id, data.date)):
        raise HTTPException(409, SLOT_TAKEN)

    # Una cita cancelada sigue ocupando la fila única (clínica, fecha, hora): se reutiliza.
    cancelled = db.scalar(
        select(models.Appointment).where(
            models.Appointment.clinic_id == data.clinic_id,
            models.Appointment.date == data.date,
            models.Appointment.time == slot,
        )
    )
    if cancelled:
        db.delete(cancelled)
        db.flush()

    appointment = models.Appointment(**data.model_dump(exclude={"time"}), time=slot)
    db.add(appointment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, SLOT_TAKEN)
    db.refresh(appointment)
    return appointment


@router.post("/members", response_model=schemas.MemberOut, status_code=201)
def create_member(data: schemas.MemberIn, db: Session = Depends(get_db)):
    _clinic_or_404(db, data.clinic_id)
    email_taken = "Ya existe un socio registrado con ese correo."
    if db.scalar(select(models.Member.id).where(models.Member.email == data.email)):
        raise HTTPException(409, email_taken)

    payload = data.model_dump(exclude={"accepts_terms"}, mode="json")
    payload["dni"] = payload["dni"].upper()
    member = models.Member(**payload)
    db.add(member)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, email_taken)
    db.refresh(member)
    return member


@router.post("/contact", response_model=schemas.ContactOut, status_code=201)
def create_contact(data: schemas.ContactIn, db: Session = Depends(get_db)):
    message = models.ContactMessage(**data.model_dump(exclude={"accepts_privacy"}))
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.post("/newsletter", status_code=201)
def subscribe(data: schemas.NewsletterIn, db: Session = Depends(get_db)):
    exists = db.scalar(select(models.NewsletterSubscriber.id).where(models.NewsletterSubscriber.email == data.email))
    if not exists:
        db.add(models.NewsletterSubscriber(name=data.name, email=data.email))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
    return {"ok": True}
