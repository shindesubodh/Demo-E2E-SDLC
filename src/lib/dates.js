// All dates are local calendar dates stored as "YYYY-MM-DD" strings.
// Because the format is zero-padded, plain string comparison orders them correctly.

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseISO(iso) {
  const [, y, m, d] = ISO_DATE.exec(iso);
  return new Date(Number(y), Number(m) - 1, Number(d));
}

export function isValidISODate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  return toISO(parseISO(value)) === value;
}

export function todayISO(now = new Date()) {
  return toISO(now);
}

// Monday to Sunday of the week that contains `today`.
export function weekRange(today) {
  const date = parseISO(today);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysSinceMonday);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return { start: toISO(start), end: toISO(end) };
}

export function isThisWeek(due, today) {
  if (!due) return false;
  const { start, end } = weekRange(today);
  return due >= start && due <= end;
}

// Earliest due date first; tasks with no due date go last.
export function compareDue(a, b) {
  if (a === b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a < b ? -1 : 1;
}

// "2026-11-17" -> "Tue 17 Nov 2026"
export function formatDate(iso) {
  const date = parseISO(iso);
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
