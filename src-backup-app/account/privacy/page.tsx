import { Metadata } from 'next';
import { GDPRDataManagement } from '@/components/GDPRDataManagement';

export const metadata: Metadata = {
  title: 'Privacy Settings | VibeLux',
  description: 'Manage your privacy settings and personal data',
};

export default function PrivacySettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <GDPRDataManagement />
    </div>
  );
}