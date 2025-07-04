'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import TrainingPortal from '@/components/training/TrainingPortal';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TrainingPage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Please sign in to access training</p>
      </div>
    );
  }

  return (
    <>
      <TrainingPortal 
        userId={user.id} 
        facilityId="default-facility"
      />
    </>
  );
}