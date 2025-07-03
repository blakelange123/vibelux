import { TaskAutomation } from '@/components/operations/TaskAutomation';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function TaskManagementPage() {
  return (
    <OperationsLayout 
      title="Task Management" 
      description="Environment-triggered task automation"
    >
      <TaskAutomation />
    </OperationsLayout>
  );
}