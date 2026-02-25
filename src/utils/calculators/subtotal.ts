export type LineForSubtotal = {
  unitPrice: number;
  qty: number;
};

/**
 * Compute subtotal = Σ(unitPrice * qty)
 * Strategy: multiply then round each line to 2dp, then sum and round.
 * This matches common retail display logic and avoids floating drift.
 */
export function calculateSubtotal(
  lines: LineForSubtotal[],
  decimalPlaces = 2
): number {
  const round = (n: number) => Number(n.toFixed(decimalPlaces));

  const sum = lines.reduce((acc, line) => {
    const qty = Number.isFinite(line.qty) ? line.qty : 0;
    const unit = Number.isFinite(line.unitPrice) ? line.unitPrice : 0;
    const lineTotal = round(unit * qty);
    return acc + lineTotal;
  }, 0);

  return round(sum);
}