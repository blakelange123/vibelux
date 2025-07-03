import LightRequirementCalculator from '@/components/LightRequirementCalculator';

export const metadata = {
  title: 'Light Requirement Calculator | Vibelux',
  description: 'Calculate optimal light requirements based on plant development stage and fruit load',
};

export default function LightRequirementsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Light Requirement Calculator</h1>
        <p className="text-muted-foreground">
          Calculate daily light requirements based on plant development stage and fruit load. 
          Following Advanced Dutch Research principles: 200 J/day base + 150-250 J per truss.
        </p>
      </div>
      <LightRequirementCalculator />
    </div>
  );
}