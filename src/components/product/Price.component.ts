export type MoneyParseOptions = {
  currencySymbol?: string; // default '£'
  decimalPlaces?: number;  // default 2
};

export class PriceComponent {
  static parse(text: string | null | undefined, opts: MoneyParseOptions = {}): number {
    if (!text) return 0;

    // Remove currency symbols, commas, and keep digits + dot
    const cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/,/g, '')
      .replace(/[^\d.]/g, '');

    const val = Number.parseFloat(cleaned);
    if (Number.isNaN(val)) return 0;

    const dp = opts.decimalPlaces ?? 2;
    // Normalize rounding
    return Number(val.toFixed(dp));
  }

  static format(value: number, opts: MoneyParseOptions = {}): string {
    const sym = opts.currencySymbol ?? '£';
    const dp = opts.decimalPlaces ?? 2;
    return `${sym}${value.toFixed(dp)}`;
  }
}