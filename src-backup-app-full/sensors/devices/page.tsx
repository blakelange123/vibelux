import { Metadata } from 'next';
import DeviceRegistration from '@/components/sensors/DeviceRegistration';

export const metadata: Metadata = {
  title: 'Arduino Sensor Integration | VibeLux',
  description: 'Connect Arduino, ESP32, and other microcontrollers to VibeLux for cost-effective sensor monitoring',
};

export default function DevicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DeviceRegistration />
    </div>
  );
}