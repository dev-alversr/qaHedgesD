export type CurrencyParseOptions = {
  decimalPlaces?: number;      // default 2
  allowNegative?: boolean;     // default false
};

/**
 * Parses money strings like:
 *  "£1,234.56" -> 1234.56
 *  "Discount: -£10.00" -> 10.00 or -10.00 (depending on allowNegative)
 */
export function parseCurrency(
  raw: string | null | undefined,
  opts: CurrencyParseOptions = {}
): number {
  if (!raw) return 0;

  const decimalPlaces = opts.decimalPlaces ?? 2;
  const allowNegative = opts.allowNegative ?? false;

  const normalized = raw
    .replace(/\s+/g, ' ')
    .replace(/,/g, '');

  const hasMinus = /-/.test(normalized);

  // keep digits and dot only
  const cleaned = normalized.replace(/[^\d.]/g, '');
  const value = Number.parseFloat(cleaned);

  if (Number.isNaN(value)) return 0;

  const signed = allowNegative && hasMinus ? -value : value;
  return Number(signed.toFixed(decimalPlaces));
}

/** Formats number to currency string (default £) */
export function formatCurrency(value: number, symbol = '£', decimalPlaces = 2): string {
  return `${symbol}${value.toFixed(decimalPlaces)}`;
}