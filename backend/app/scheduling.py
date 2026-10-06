import datetime as dt
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Europe/Madrid")
# Martes (1) a sábado (5), como el horario veterinario de las clínicas.
OPEN_WEEKDAYS = {1, 2, 3, 4, 5}
FIRST_SLOT = dt.time(10, 0)
LAST_SLOT = dt.time(20, 30)
SLOT_MINUTES = 30
MAX_DAYS_AHEAD = 60


def now() -> dt.datetime:
    return dt.datetime.now(TZ)


def is_open(day: dt.date) -> bool:
    return day.weekday() in OPEN_WEEKDAYS


def all_slots() -> list[dt.time]:
    slots = []
    current = dt.datetime.combine(dt.date.today(), FIRST_SLOT)
    last = dt.datetime.combine(dt.date.today(), LAST_SLOT)
    while current <= last:
        slots.append(current.time())
        current += dt.timedelta(minutes=SLOT_MINUTES)
    return slots


def bookable_slots(day: dt.date, taken: set[dt.time]) -> list[dt.time]:
    """Huecos libres de un día: dentro de horario, no ocupados y no en el pasado."""
    current = now()
    if not is_open(day) or day < current.date() or day > current.date() + dt.timedelta(days=MAX_DAYS_AHEAD):
        return []
    return [
        slot
        for slot in all_slots()
        if slot not in taken and (day > current.date() or slot > current.time())
    ]
