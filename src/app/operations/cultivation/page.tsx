import { CultivationInsightsHub } from '@/components/operations/CultivationInsightsHub';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function CultivationInsightsPage() {
  return (
    <OperationsLayout 
      title="Cultivation Insights" 
      description="AI-powered cultivation intelligence"
    >
      <CultivationInsightsHub />
    </OperationsLayout>
  );
}