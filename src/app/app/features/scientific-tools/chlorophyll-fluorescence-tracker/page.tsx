import ChlorophyllFluorescenceTracker from '@/components/ChlorophyllFluorescenceTracker';

export const metadata = {
  title: 'Chlorophyll Fluorescence Tracker | VibeLux Scientific Tools',
  description: 'Real-time monitoring of photosystem II efficiency using PAM fluorometry. Track Fv/Fm, ΦPSII, NPQ, and stress detection protocols for optimal plant health.',
  keywords: 'chlorophyll fluorescence, PAM fluorometry, Fv/Fm, PSII efficiency, NPQ, photochemical quenching, plant stress detection, photosynthesis monitoring, agriculture, horticulture',
};

export default function ChlorophyllFluorescenceTrackerPage() {
  return <ChlorophyllFluorescenceTracker />;
}