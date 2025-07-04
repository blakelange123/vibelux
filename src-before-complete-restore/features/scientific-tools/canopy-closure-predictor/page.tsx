import CanopyClosurePredictor from '@/components/CanopyClosurePredictor';

export const metadata = {
  title: 'Canopy Closure Predictor | VibeLux Scientific Tools',
  description: 'Predict canopy development using Beer-Lambert law for light interception modeling. Track LAI, growth stages, pruning effects, and optimize harvest timing for maximum yield.',
  keywords: 'canopy closure, leaf area index, LAI, light interception, Beer-Lambert law, plant growth modeling, canopy architecture, agriculture, horticulture, harvest optimization',
};

export default function CanopyClosurePredictorPage() {
  return <CanopyClosurePredictor />;
}