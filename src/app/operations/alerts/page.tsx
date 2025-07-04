import { PredictiveAlerts } from '@/components/operations/PredictiveAlerts';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function PredictiveAlertsPage() {
  return (
    <OperationsLayout 
      title="Predictive Alerts" 
      description="AI-powered issue prevention"
    >
      <PredictiveAlerts />
    </OperationsLayout>
  );
}