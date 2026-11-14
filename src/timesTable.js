export const ERROR_MESSAGE = "Please enter a whole number from 1 to 100.";

const MIN = 1;
const MAX = 100;
const MULTIPLIERS = 10;

// Never throws: any entry that is not a whole number from 1 to 100 is rejected.
export function parseTableNumber(text) {
  const trimmed = String(text ?? "").trim();
  if (!/^[0-9]+$/.test(trimmed)) {
    return { ok: false, error: ERROR_MESSAGE };
  }
  const value = Number.parseInt(trimmed, 10);
  if (value < MIN || value > MAX) {
    return { ok: false, error: ERROR_MESSAGE };
  }
  return { ok: true, value };
}

export function formatRow(n, m) {
  return `${n} \u00D7 ${m} = ${n * m}`;
}

export function buildTable(n) {
  if (!Number.isInteger(n) || n < MIN || n > MAX) {
    throw new RangeError(`Table number must be an integer from ${MIN} to ${MAX}.`);
  }
  const rows = [];
  for (let multiplier = 1; multiplier <= MULTIPLIERS; multiplier++) {
    rows.push({ multiplier, product: n * multiplier, text: formatRow(n, multiplier) });
  }
  return rows;
}
