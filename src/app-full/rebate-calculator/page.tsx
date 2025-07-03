import { UtilityRebateCalculator } from '@/components/UtilityRebateCalculator'
import { EnhancedUtilityRebateCalculator } from '@/components/EnhancedRebateCalculator'

export default function RebateCalculatorPage() {
  // You can toggle between basic and enhanced versions
  // For now, let's use the enhanced version
  return <EnhancedUtilityRebateCalculator />
}