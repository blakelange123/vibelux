import VPDAdvancedCalculator from '@/components/VPDAdvancedCalculator';

export const metadata = {
  title: 'Advanced VPD Calculator | Vibelux',
  description: 'Calculate VPD and humidity deficit with semi-closed greenhouse optimization strategies',
};

export default function VPDAdvancedPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced VPD & Humidity Deficit Calculator</h1>
        <p className="text-muted-foreground">
          Based on Advanced Dutch Research principles for optimal climate control in semi-closed greenhouses.
          Target humidity deficit of 5 g/m³ for disease prevention and optimal transpiration.
        </p>
      </div>
      <VPDAdvancedCalculator />
    </div>
  );
}