'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Phone,
  Video,
  MessageSquare
} from 'lucide-react';
import VideoConference from '@/components/VideoConference';

interface Consultation {
  id: string;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  expert: {
    displayName: string;
    title: string;
    photoUrl: string;
  };
  client: {
    name: string;
  };
  totalAmount: number;
  duration: number;
  objectives: string[];
}

interface VideoSession {
  roomId: string;
  token: string;
  config: any;
  isNewSession: boolean;
}

export default function ConsultationRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [videoSession, setVideoSession] = useState<VideoSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [billingResult, setBillingResult] = useState<any>(null);

  useEffect(() => {
    loadConsultation();
  }, [params.id]);

  const loadConsultation = async () => {
    try {
      const response = await fetch(`/api/consultations?consultationId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        const consultationData = data.consultations.find((c: any) => c.id === params.id);
        if (consultationData) {
          setConsultation(consultationData);
        } else {
          setError('Consultation not found');
        }
      } else {
        setError('Failed to load consultation');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const joinVideoConference = async () => {
    if (isJoining || !consultation) return;
    
    setIsJoining(true);
    setError('');

    try {
      const response = await fetch(`/api/consultations/${consultation.id}/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' })
      });

      if (response.ok) {
        const data = await response.json();
        setVideoSession(data.conference);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to join video conference');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSessionEnd = (billing: any) => {
    setBillingResult(billing);
    setSessionEnded(true);
    setVideoSession(null);
  };

  const leaveConference = async () => {
    if (!consultation) return;

    try {
      await fetch(`/api/consultations/${consultation.id}/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' })
      });
    } catch (error) {
      console.error('Error leaving conference:', error);
    }

    router.push('/consultations');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Unable to Load Consultation</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => router.push('/consultations')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Back to Consultations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-b border-indigo-800/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/consultations')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-white">{consultation.title}</h1>
                <p className="text-gray-400">
                  {new Date(consultation.scheduledStart).toLocaleDateString()} • 
                  {new Date(consultation.scheduledStart).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              consultation.status === 'IN_PROGRESS' ? 'bg-green-900/30 text-green-400' :
              consultation.status === 'APPROVED' ? 'bg-blue-900/30 text-blue-400' :
              consultation.status === 'COMPLETED' ? 'bg-gray-600/30 text-gray-400' :
              'bg-yellow-900/30 text-yellow-400'
            }`}>
              {consultation.status.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {sessionEnded && billingResult ? (
          // Session completed - show billing summary
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Consultation Completed</h2>
            
            <div className="bg-gray-700 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white font-medium">{billingResult.actualDuration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Final Amount:</span>
                  <span className="text-white font-medium">${billingResult.finalAmount.toFixed(2)}</span>
                </div>
                {billingResult.refundAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Refund:</span>
                    <span className="font-medium">${billingResult.refundAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-400 mb-8">{billingResult.message}</p>
            
            <button
              onClick={() => router.push('/consultations')}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              View All Consultations
            </button>
          </div>
        ) : videoSession ? (
          // Active video conference
          <div className="space-y-6">
            <VideoConference
              roomId={videoSession.roomId}
              token={videoSession.token}
              config={videoSession.config}
              consultationId={consultation.id}
              onSessionEnd={handleSessionEnd}
            />
            
            {/* Consultation info sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Objectives */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Session Objectives</h3>
                  <ul className="space-y-2">
                    {consultation.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Participant info */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={consultation.expert.photoUrl}
                        alt={consultation.expert.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-white">{consultation.expert.displayName}</div>
                        <div className="text-sm text-gray-400">Expert</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{consultation.client.name}</div>
                        <div className="text-sm text-gray-400">Client</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session info */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Session Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scheduled Duration:</span>
                      <span className="text-white">{consultation.duration / 60} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hourly Rate:</span>
                      <span className="text-white">$200/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total (Max):</span>
                      <span className="text-white">${consultation.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <p className="text-blue-300 text-xs">
                      You'll only be charged for the actual time spent in consultation. 
                      Any unused time will be automatically refunded.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Pre-conference lobby
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Consultation?</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Click the button below to join the video conference. Your expert will be notified 
                when you join the session.
              </p>

              {error && (
                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={joinVideoConference}
                  disabled={isJoining}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-semibold text-lg flex items-center gap-2 transition-all"
                >
                  {isJoining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      Join Video Conference
                    </>
                  )}
                </button>

                <button
                  onClick={leaveConference}
                  className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
                >
                  Leave Room
                </button>
              </div>

              {/* Consultation details */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-gray-700 rounded-lg p-6">
                  <User className="w-8 h-8 text-indigo-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Expert</h3>
                  <p className="text-gray-300 text-sm">{consultation.expert.displayName}</p>
                  <p className="text-gray-400 text-xs">{consultation.expert.title}</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-6">
                  <Clock className="w-8 h-8 text-indigo-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Duration</h3>
                  <p className="text-gray-300 text-sm">
                    Scheduled: {consultation.duration / 60} hours
                  </p>
                  <p className="text-gray-400 text-xs">Billed by actual time used</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-6">
                  <DollarSign className="w-8 h-8 text-indigo-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Billing</h3>
                  <p className="text-gray-300 text-sm">$200/hour</p>
                  <p className="text-gray-400 text-xs">Max: ${consultation.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}