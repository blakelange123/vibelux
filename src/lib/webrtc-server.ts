import { Server as SocketIOServer, Socket } from 'socket.io';
import { NextApiRequest } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface VideoSessionData {
  consultationId: string;
  participants: Set<string>;
  startTime?: Date;
  endTime?: Date;
  recordingUrl?: string;
  actualDuration?: number;
}

interface ConsultationUser {
  id: string;
  name: string;
  isExpert: boolean;
  consultationId: string;
}

class WebRTCSignalingServer {
  private io: SocketIOServer;
  private videoSessions: Map<string, VideoSessionData> = new Map();
  private userSockets: Map<string, Socket> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', async (socket: Socket) => {
      console.log('Client connected:', socket.id);

      // Authenticate user
      const userId = await this.authenticateSocket(socket);
      if (!userId) {
        socket.emit('error', { message: 'Authentication required' });
        socket.disconnect();
        return;
      }

      this.userSockets.set(userId, socket);

      // Handle joining consultation room
      socket.on('join-consultation', async (data: { consultationId: string }) => {
        try {
          await this.handleJoinConsultation(socket, userId, data.consultationId);
        } catch (error) {
          console.error('Error joining consultation:', error);
          socket.emit('error', { message: 'Failed to join consultation' });
        }
      });

      // WebRTC signaling events
      socket.on('offer', (data) => this.handleOffer(socket, data));
      socket.on('answer', (data) => this.handleAnswer(socket, data));
      socket.on('ice-candidate', (data) => this.handleIceCandidate(socket, data));
      socket.on('start-recording', (data) => this.handleStartRecording(socket, data));
      socket.on('stop-recording', (data) => this.handleStopRecording(socket, data));
      socket.on('end-session', (data) => this.handleEndSession(socket, userId, data));

      // Chat messages during consultation
      socket.on('consultation-message', async (data) => {
        await this.handleConsultationMessage(socket, userId, data);
      });

      // Screen sharing
      socket.on('start-screen-share', (data) => this.handleScreenShare(socket, data));
      socket.on('stop-screen-share', (data) => this.handleStopScreenShare(socket, data));

      // Platform data sharing
      socket.on('share-platform-data', (data) => this.handlePlatformDataShare(socket, data));

      socket.on('disconnect', () => {
        this.handleDisconnect(socket, userId);
      });
    });
  }

  private async authenticateSocket(socket: Socket): Promise<string | null> {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return null;

      // In a real implementation, verify JWT token
      // For now, we'll assume the token contains user ID
      return token; // This should be the actual user ID after JWT verification
    } catch (error) {
      console.error('Socket authentication error:', error);
      return null;
    }
  }

  private async handleJoinConsultation(socket: Socket, userId: string, consultationId: string) {
    // Verify user has access to this consultation
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        OR: [
          { clientId: userId },
          { expert: { userId } }
        ]
      },
      include: {
        expert: { include: { user: true } },
        client: true
      }
    });

    if (!consultation) {
      socket.emit('error', { message: 'Consultation not found or access denied' });
      return;
    }

    const isExpert = consultation.expert.userId === userId;
    const roomId = `consultation-${consultationId}`;

    // Join the socket room
    await socket.join(roomId);

    // Initialize or update video session
    if (!this.videoSessions.has(consultationId)) {
      this.videoSessions.set(consultationId, {
        consultationId,
        participants: new Set()
      });
    }

    const session = this.videoSessions.get(consultationId)!;
    session.participants.add(userId);

    // Notify other participants
    socket.to(roomId).emit('participant-joined', {
      userId,
      name: isExpert ? consultation.expert.displayName : consultation.client.name,
      isExpert
    });

    // Send current session state to joining user
    socket.emit('consultation-joined', {
      consultationId,
      isExpert,
      participants: Array.from(session.participants),
      sessionStartTime: session.startTime
    });

    // Start session if both participants are present and consultation is approved
    if (session.participants.size === 2 && consultation.status === 'APPROVED') {
      await this.startVideoSession(consultationId);
    }
  }

  private async startVideoSession(consultationId: string) {
    const session = this.videoSessions.get(consultationId);
    if (!session || session.startTime) return;

    session.startTime = new Date();

    // Update consultation status in database
    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'IN_PROGRESS',
        actualStart: session.startTime
      }
    });

    // Notify all participants
    this.io.to(`consultation-${consultationId}`).emit('session-started', {
      startTime: session.startTime
    });
  }

  private handleOffer(socket: Socket, data: { offer: RTCSessionDescriptionInit; targetUserId: string; consultationId: string }) {
    const targetSocket = this.userSockets.get(data.targetUserId);
    if (targetSocket) {
      targetSocket.emit('offer', {
        offer: data.offer,
        fromUserId: socket.id
      });
    }
  }

  private handleAnswer(socket: Socket, data: { answer: RTCSessionDescriptionInit; targetUserId: string }) {
    const targetSocket = this.userSockets.get(data.targetUserId);
    if (targetSocket) {
      targetSocket.emit('answer', {
        answer: data.answer,
        fromUserId: socket.id
      });
    }
  }

  private handleIceCandidate(socket: Socket, data: { candidate: RTCIceCandidateInit; targetUserId: string }) {
    const targetSocket = this.userSockets.get(data.targetUserId);
    if (targetSocket) {
      targetSocket.emit('ice-candidate', {
        candidate: data.candidate,
        fromUserId: socket.id
      });
    }
  }

  private async handleStartRecording(socket: Socket, data: { consultationId: string }) {
    // In production, integrate with recording service
    const roomId = `consultation-${data.consultationId}`;
    this.io.to(roomId).emit('recording-started');
  }

  private async handleStopRecording(socket: Socket, data: { consultationId: string; recordingUrl?: string }) {
    const session = this.videoSessions.get(data.consultationId);
    if (session && data.recordingUrl) {
      session.recordingUrl = data.recordingUrl;

      await prisma.consultation.update({
        where: { id: data.consultationId },
        data: { recordingUrl: data.recordingUrl }
      });
    }

    const roomId = `consultation-${data.consultationId}`;
    this.io.to(roomId).emit('recording-stopped', { recordingUrl: data.recordingUrl });
  }

  private async handleEndSession(socket: Socket, userId: string, data: { consultationId: string }) {
    const session = this.videoSessions.get(data.consultationId);
    if (!session || !session.startTime) return;

    session.endTime = new Date();
    session.actualDuration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000); // minutes

    // Calculate billing adjustment based on actual time
    const consultation = await prisma.consultation.findUnique({
      where: { id: data.consultationId },
      include: { expert: true }
    });

    if (consultation) {
      const originalAmount = consultation.totalAmount;
      const actualAmount = (session.actualDuration / 60) * consultation.expert.hourlyRate;
      const adjustedPlatformFee = actualAmount * 0.1;
      const adjustedExpertEarnings = actualAmount - adjustedPlatformFee;

      // Update consultation with actual times and billing
      await prisma.consultation.update({
        where: { id: data.consultationId },
        data: {
          status: 'COMPLETED',
          actualEnd: session.endTime,
          totalAmount: actualAmount,
          platformFee: adjustedPlatformFee,
          expertEarnings: adjustedExpertEarnings
        }
      });

      // Process refund if applicable
      if (originalAmount > actualAmount) {
        const refundAmount = originalAmount - actualAmount;
        // Integrate with Stripe refund API here
        console.log(`Processing refund of $${refundAmount} for consultation ${data.consultationId}`);
      }
    }

    const roomId = `consultation-${data.consultationId}`;
    this.io.to(roomId).emit('session-ended', {
      actualDuration: session.actualDuration,
      endTime: session.endTime
    });

    // Clean up session
    this.videoSessions.delete(data.consultationId);
  }

  private async handleConsultationMessage(socket: Socket, userId: string, data: { consultationId: string; content: string }) {
    // Store message in database
    const message = await prisma.consultationMessage.create({
      data: {
        consultationId: data.consultationId,
        senderId: userId,
        content: data.content
      },
      include: {
        sender: {
          select: { name: true }
        }
      }
    });

    // Broadcast to consultation room
    const roomId = `consultation-${data.consultationId}`;
    this.io.to(roomId).emit('new-message', {
      id: message.id,
      content: message.content,
      senderName: message.sender.name,
      senderId: userId,
      createdAt: message.createdAt
    });
  }

  private handleScreenShare(socket: Socket, data: { consultationId: string }) {
    const roomId = `consultation-${data.consultationId}`;
    socket.to(roomId).emit('screen-share-started', { fromUserId: socket.id });
  }

  private handleStopScreenShare(socket: Socket, data: { consultationId: string }) {
    const roomId = `consultation-${data.consultationId}`;
    socket.to(roomId).emit('screen-share-stopped', { fromUserId: socket.id });
  }

  private handlePlatformDataShare(socket: Socket, data: { consultationId: string; dataType: string; url: string }) {
    const roomId = `consultation-${data.consultationId}`;
    socket.to(roomId).emit('platform-data-shared', {
      dataType: data.dataType,
      url: data.url,
      fromUserId: socket.id
    });
  }

  private handleDisconnect(socket: Socket, userId: string) {
    console.log('Client disconnected:', socket.id);
    this.userSockets.delete(userId);

    // Clean up any active sessions
    for (const [consultationId, session] of this.videoSessions.entries()) {
      if (session.participants.has(userId)) {
        session.participants.delete(userId);
        
        // Notify other participants
        const roomId = `consultation-${consultationId}`;
        socket.to(roomId).emit('participant-left', { userId });

        // Clean up empty sessions
        if (session.participants.size === 0) {
          this.videoSessions.delete(consultationId);
        }
      }
    }
  }
}

export default WebRTCSignalingServer;