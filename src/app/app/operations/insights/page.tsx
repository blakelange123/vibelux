import { OperationalInsights } from '@/components/operations/OperationalInsights';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function OperationalInsightsPage() {
  return (
    <OperationsLayout 
      title="Operational Insights" 
      description="Environmental impact on business outcomes"
    >
      <OperationalInsights />
    </OperationsLayout>
  );
}