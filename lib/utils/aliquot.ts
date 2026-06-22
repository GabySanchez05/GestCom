import type { Unit } from '@/lib/types/database.types'

/**
 * Validates that active units' aliquot percentages sum to exactly 100%.
 * Tolerance: ±0.01 to account for floating point rounding.
 */
export function validateAliquotSum(units: Pick<Unit, 'aliquot_percentage'>[]): boolean {
  const sum = units.reduce((acc, u) => acc + Number(u.aliquot_percentage), 0)
  return Math.abs(sum - 100) <= 0.01
}

/**
 * Calculates the amount assigned to each unit based on its aliquot percentage.
 * Returns a map of unit_id -> assigned_amount.
 */
export function calculateDistributions(
  totalAmount: number,
  units: Pick<Unit, 'id' | 'aliquot_percentage'>[]
): Array<{ unit_id: string; assigned_amount: number; aliquot_percentage: number }> {
  return units.map((unit) => ({
    unit_id: unit.id,
    aliquot_percentage: Number(unit.aliquot_percentage),
    assigned_amount: parseFloat(
      (totalAmount * (Number(unit.aliquot_percentage) / 100)).toFixed(2)
    ),
  }))
}

/**
 * Returns the sum of all aliquot percentages (useful for UI validation).
 */
export function sumAliquots(units: Pick<Unit, 'aliquot_percentage'>[]): number {
  return units.reduce((acc, u) => acc + Number(u.aliquot_percentage), 0)
}
