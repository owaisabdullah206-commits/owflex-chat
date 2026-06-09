// Display-only USD <-> PKR conversion for the marketing tools and directory.
// This is a guidance figure for what to charge clients, not a billing rate, so
// a rounded approximate value is fine. Update here if the rate drifts.

export const USD_PKR_RATE = 300

/** Convert a PKR amount to a rounded whole-dollar USD figure. */
export function pkrToUsd(pkr: number): number {
  return Math.round(pkr / USD_PKR_RATE)
}
