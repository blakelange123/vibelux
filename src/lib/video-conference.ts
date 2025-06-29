import { prisma } from '@/lib/db';

export interface VideoConferenceConfig {
  consultationId: string;
  participantId: string;
  participantType: 'expert' | 'client';
  isHost: boolean;
}

export interface ConferenceSession {
  sessionId: string;
  roomId: string;
  startTime: Date;
  endTime?: Date;
  participants: ConferenceParticipant[];
  recordingUrl?: string;
  actualDuration?: number; // in minutes
}

export interface ConferenceParticipant {
  userId: string;
  role: 'expert' | 'client';
  joinedAt: Date;
  leftAt?: Date;
  connectionTime: number; // total minutes connected
}

export class VideoConferenceManager {
  private static sessions = new Map<string, ConferenceSession>();
  
  /**
   * Initialize a new video conference session
   */
  static async initializeSession(config: VideoConferenceConfig): Promise<{
    roomId: string;
    token: string;
    sessionConfig: any;
  }> {
    const consultation = await prisma.consultation.findUnique({
      where: { id: config.consultationId },
      include: {
        expert: { select: { displayName: true } },
        client: { select: { name: true } }
      }
    });

    if (!consultation) {
      throw new Error('Consultation not found');
    }

    // Generate unique room ID
    const roomId = `consultation-${config.consultationId}-${Date.now()}`;
    
    // Create session
    const session: ConferenceSession = {
      sessionId: roomId,
      roomId,
      startTime: new Date(),
      participants: []
    };

    this.sessions.set(roomId, session);

    // Update consultation with meeting info
    await prisma.consultation.update({
      where: { id: config.consultationId },
      data: {
        meetingId: roomId,
        status: 'IN_PROGRESS',
        actualStart: new Date()
      }
    });

    // Generate participant token (simple implementation - in production use JWT)
    const token = this.generateParticipantToken({
      roomId,
      userId: config.participantId,
      role: config.participantType,
      consultationId: config.consultationId
    });

    const sessionConfig = {
      roomId,
      participantName: config.participantType === 'expert' 
        ? consultation.expert.displayName 
        : consultation.client.name,
      isHost: config.isHost,
      maxDuration: consultation.duration, // Original booked duration
      recordingEnabled: true,
      features: {
        chat: true,
        screenShare: true,
        recording: config.isHost, // Only host can control recording
        fileSharing: true
      }
    };

    return { roomId, token, sessionConfig };
  }

  /**
   * Handle participant joining
   */
  static async handleParticipantJoin(
    roomId: string, 
    userId: string, 
    role: 'expert' | 'client'
  ): Promise<void> {
    const session = this.sessions.get(roomId);
    if (!session) {
      throw new Error('Session not found');
    }

    const participant: ConferenceParticipant = {
      userId,
      role,
      joinedAt: new Date(),
      connectionTime: 0
    };

    session.participants.push(participant);

    // Log participant join
    console.log(`Participant ${userId} (${role}) joined room ${roomId}`);
  }

  /**
   * Handle participant leaving
   */
  static async handleParticipantLeave(
    roomId: string, 
    userId: string
  ): Promise<void> {
    const session = this.sessions.get(roomId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant && !participant.leftAt) {
      participant.leftAt = new Date();
      participant.connectionTime = Math.round(
        (participant.leftAt.getTime() - participant.joinedAt.getTime()) / (1000 * 60)
      );
    }

    console.log(`Participant ${userId} left room ${roomId}`);
  }

  /**
   * End conference session and calculate final billing
   */
  static async endSession(
    roomId: string, 
    consultationId: string
  ): Promise<{
    actualDuration: number;
    adjustedBilling: {
      originalAmount: number;
      actualAmount: number;
      refundAmount: number;
    };
  }> {
    const session = this.sessions.get(roomId);
    if (!session) {
      throw new Error('Session not found');
    }

    const now = new Date();
    session.endTime = now;

    // Calculate actual session duration (when both participants were present)
    const actualDuration = this.calculateBillingDuration(session);
    session.actualDuration = actualDuration;

    // Get consultation for billing calculation
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { expert: true }
    });

    if (!consultation) {
      throw new Error('Consultation not found');
    }

    // Calculate adjusted billing
    const originalMinutes = consultation.duration;
    const actualMinutes = Math.max(actualDuration, 15); // Minimum 15 minutes billing
    
    const hourlyRate = consultation.hourlyRate;
    const originalAmount = consultation.totalAmount;
    const actualAmount = (actualMinutes / 60) * hourlyRate;
    const refundAmount = Math.max(0, originalAmount - actualAmount);

    const platformFee = actualAmount * 0.1;
    const expertEarnings = actualAmount * 0.9;

    // Update consultation with final billing
    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        actualEnd: now,
        status: 'COMPLETED',
        totalAmount: actualAmount,
        platformFee,
        expertEarnings,
        notes: `Session duration: ${actualDuration} minutes`
      }
    });

    // Process refund if necessary
    if (refundAmount > 0) {
      await this.processRefund(consultation.paymentIntentId!, refundAmount);
    }

    // Update expert stats
    await prisma.expert.update({
      where: { id: consultation.expertId },
      data: {
        totalSessions: { increment: 1 },
        totalEarnings: { increment: expertEarnings }
      }
    });

    // Clean up session
    this.sessions.delete(roomId);

    return {
      actualDuration,
      adjustedBilling: {
        originalAmount,
        actualAmount,
        refundAmount
      }
    };
  }

  /**
   * Calculate billable duration based on when both participants were present
   */
  private static calculateBillingDuration(session: ConferenceSession): number {
    if (!session.endTime || session.participants.length < 2) {
      return 0;
    }

    const expert = session.participants.find(p => p.role === 'expert');
    const client = session.participants.find(p => p.role === 'client');

    if (!expert || !client) {
      return 0;
    }

    // Calculate overlap time when both were present
    const sessionStart = Math.max(
      expert.joinedAt.getTime(),
      client.joinedAt.getTime()
    );

    const sessionEnd = Math.min(
      expert.leftAt?.getTime() || session.endTime!.getTime(),
      client.leftAt?.getTime() || session.endTime!.getTime()
    );

    const durationMs = Math.max(0, sessionEnd - sessionStart);
    return Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }

  /**
   * Process refund for unused consultation time
   */
  private static async processRefund(
    paymentIntentId: string, 
    refundAmount: number
  ): Promise<void> {
    // TODO: Implement Stripe refund
    console.log(`Processing refund of $${refundAmount} for payment ${paymentIntentId}`);
    
    // In production, implement Stripe refund:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // await stripe.refunds.create({
    //   payment_intent: paymentIntentId,
    //   amount: Math.round(refundAmount * 100), // Convert to cents
    //   reason: 'requested_by_customer',
    //   metadata: {
    //     reason: 'consultation_duration_adjustment'
    //   }
    // });
  }

  /**
   * Generate participant access token
   */
  private static generateParticipantToken(data: {
    roomId: string;
    userId: string;
    role: string;
    consultationId: string;
  }): string {
    // In production, use proper JWT signing
    return Buffer.from(JSON.stringify({
      ...data,
      exp: Date.now() + (4 * 60 * 60 * 1000) // 4 hours
    })).toString('base64');
  }

  /**
   * Validate participant token
   */
  static validateToken(token: string): any {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (decoded.exp < Date.now()) {
        throw new Error('Token expired');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get active sessions for monitoring
   */
  static getActiveSessions(): ConferenceSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Force end session (admin function)
   */
  static async forceEndSession(
    roomId: string, 
    reason: string = 'Administrative action'
  ): Promise<void> {
    const session = this.sessions.get(roomId);
    if (session) {
      session.endTime = new Date();
      
      // Mark all participants as left
      session.participants.forEach(p => {
        if (!p.leftAt) {
          p.leftAt = new Date();
          p.connectionTime = Math.round(
            (p.leftAt.getTime() - p.joinedAt.getTime()) / (1000 * 60)
          );
        }
      });

      console.log(`Force ended session ${roomId}: ${reason}`);
    }
  }
}

/**
 * Real-time session monitoring
 */
export class SessionMonitor {
  private static intervals = new Map<string, NodeJS.Timeout>();

  /**
   * Start monitoring a session
   */
  static startMonitoring(roomId: string): void {
    const interval = setInterval(async () => {
      const session = VideoConferenceManager.getActiveSessions()
        .find(s => s.roomId === roomId);

      if (!session) {
        this.stopMonitoring(roomId);
        return;
      }

      // Check for session timeout (4 hours max)
      const sessionDuration = Date.now() - session.startTime.getTime();
      if (sessionDuration > 4 * 60 * 60 * 1000) {
        await VideoConferenceManager.forceEndSession(
          roomId, 
          'Session timeout (4 hours)'
        );
        this.stopMonitoring(roomId);
      }

      // Check if session has been inactive (no participants for 10 minutes)
      const now = Date.now();
      const hasActiveParticipants = session.participants.some(p => 
        !p.leftAt || (now - p.leftAt.getTime()) < 10 * 60 * 1000
      );

      if (!hasActiveParticipants) {
        await VideoConferenceManager.forceEndSession(
          roomId, 
          'No active participants'
        );
        this.stopMonitoring(roomId);
      }
    }, 60 * 1000); // Check every minute

    this.intervals.set(roomId, interval);
  }

  /**
   * Stop monitoring a session
   */
  static stopMonitoring(roomId: string): void {
    const interval = this.intervals.get(roomId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(roomId);
    }
  }
}