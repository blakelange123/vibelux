import {
  AccessZone,
  Door,
  Camera,
  Employee,
  Visitor,
  AccessLog,
  Alarm,
  Incident,
  Badge,
  AuditLog,
  DoorStatus,
  BadgeStatus,
  AlarmSeverity,
  IncidentStatus,
  AccessType,
  AuditAction,
  SecurityMetrics
} from './security-types';

export class SecurityManager {
  private zones: Map<string, AccessZone> = new Map();
  private doors: Map<string, Door> = new Map();
  private cameras: Map<string, Camera> = new Map();
  private employees: Map<string, Employee> = new Map();
  private visitors: Map<string, Visitor> = new Map();
  private badges: Map<string, Badge> = new Map();
  private accessLogs: AccessLog[] = [];
  private alarms: Map<string, Alarm> = new Map();
  private incidents: Map<string, Incident> = new Map();
  private auditLogs: AuditLog[] = [];

  // Access Control
  requestAccess(badgeNumber: string, doorId: string): boolean {
    const badge = this.badges.get(badgeNumber);
    const door = this.doors.get(doorId);
    
    if (!badge || !door) {
      this.logAccessAttempt(badgeNumber, doorId, false, 'Invalid badge or door');
      return false;
    }

    if (badge.status !== BadgeStatus.Active) {
      this.logAccessAttempt(badgeNumber, doorId, false, `Badge ${badge.status}`);
      return false;
    }

    const zone = this.zones.get(door.zoneId);
    if (!zone) {
      this.logAccessAttempt(badgeNumber, doorId, false, 'Invalid zone');
      return false;
    }

    // Check if badge has access to this zone
    if (!badge.accessZones.includes(zone.id)) {
      this.logAccessAttempt(badgeNumber, doorId, false, 'Unauthorized zone');
      return false;
    }

    // Check schedule
    if (!this.isWithinSchedule(zone)) {
      this.logAccessAttempt(badgeNumber, doorId, false, 'Outside scheduled hours');
      return false;
    }

    // Check capacity
    if (zone.currentOccupancy >= zone.capacity) {
      this.logAccessAttempt(badgeNumber, doorId, false, 'Zone at capacity');
      return false;
    }

    // Grant access
    this.unlockDoor(door);
    zone.currentOccupancy++;
    this.logAccessAttempt(badgeNumber, doorId, true);
    
    return true;
  }

  // Visitor Management
  checkInVisitor(visitor: Omit<Visitor, 'id' | 'badgeNumber' | 'checkInTime' | 'createdAt'>): Visitor {
    const newVisitor: Visitor = {
      ...visitor,
      id: `VIS-${Date.now()}`,
      badgeNumber: this.generateVisitorBadge(),
      checkInTime: new Date(),
      createdAt: new Date()
    };

    this.visitors.set(newVisitor.id, newVisitor);
    
    // Issue temporary badge
    const badge: Badge = {
      id: `BADGE-${Date.now()}`,
      badgeNumber: newVisitor.badgeNumber,
      type: 'Visitor',
      assignedTo: newVisitor.id,
      assignedType: 'Visitor',
      status: BadgeStatus.Active,
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      accessZones: visitor.allowedZones,
      deactivationReason: undefined
    };
    
    this.badges.set(badge.badgeNumber, badge);
    
    // Notify host
    this.notifyHost(visitor.hostEmployeeId, newVisitor);
    
    // Log audit
    this.createAuditLog('Visitor Check-In', 'Visitor', newVisitor.id, 
      `${newVisitor.firstName} ${newVisitor.lastName} checked in`);
    
    return newVisitor;
  }

  checkOutVisitor(visitorId: string): void {
    const visitor = this.visitors.get(visitorId);
    if (!visitor) throw new Error('Visitor not found');
    
    visitor.checkOutTime = new Date();
    
    // Deactivate badge
    const badge = Array.from(this.badges.values())
      .find(b => b.assignedTo === visitorId && b.assignedType === 'Visitor');
    
    if (badge) {
      badge.status = BadgeStatus.Inactive;
      badge.deactivationReason = 'Visitor checked out';
    }
    
    // Update zone occupancy
    visitor.allowedZones.forEach(zoneId => {
      const zone = this.zones.get(zoneId);
      if (zone && zone.currentOccupancy > 0) {
        zone.currentOccupancy--;
      }
    });
    
    this.createAuditLog('Visitor Check-Out', 'Visitor', visitorId, 
      `${visitor.firstName} ${visitor.lastName} checked out`);
  }

  // Door Management
  unlockDoor(door: Door): void {
    door.status = DoorStatus.Unlocked;
    
    // Auto-lock after 10 seconds
    setTimeout(() => {
      if (door.status === DoorStatus.Unlocked) {
        door.status = DoorStatus.Locked;
      }
    }, 10000);
  }

  emergencyUnlockZone(zoneId: string, reason: string, authorizedBy: string): void {
    const zone = this.zones.get(zoneId);
    if (!zone) throw new Error('Zone not found');
    
    zone.doors.forEach(door => {
      door.status = DoorStatus.Unlocked;
    });
    
    // Create incident
    this.createIncident({
      type: 'Other',
      severity: 'Major',
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      location: zone.name,
      description: `Emergency unlock: ${reason}`,
      involvedPersons: [authorizedBy],
      witnesses: [],
      reportedBy: authorizedBy,
      status: IncidentStatus.Open,
      actionsTaken: ['Emergency unlock initiated'],
      preventiveMeasures: [],
      attachments: []
    });
    
    this.createAuditLog('Emergency Unlock', 'Zone', zoneId, 
      `Emergency unlock by ${authorizedBy}: ${reason}`);
  }

  // Alarm Management
  triggerAlarm(alarm: Omit<Alarm, 'id' | 'triggeredAt'>): Alarm {
    const newAlarm: Alarm = {
      ...alarm,
      id: `ALARM-${Date.now()}`,
      triggeredAt: new Date()
    };
    
    this.alarms.set(newAlarm.id, newAlarm);
    
    // Notify security personnel
    this.notifySecurityTeam(newAlarm);
    
    // Auto-escalate critical alarms
    if (alarm.severity === AlarmSeverity.Critical) {
      this.escalateAlarm(newAlarm);
    }
    
    return newAlarm;
  }

  acknowledgeAlarm(alarmId: string, acknowledgedBy: string): void {
    const alarm = this.alarms.get(alarmId);
    if (!alarm) throw new Error('Alarm not found');
    
    alarm.acknowledgedAt = new Date();
    alarm.acknowledgedBy = acknowledgedBy;
    
    this.createAuditLog('Alarm Acknowledged', 'Alarm', alarmId, 
      `Alarm acknowledged by ${acknowledgedBy}`);
  }

  resolveAlarm(alarmId: string, response: string, falseAlarm: boolean): void {
    const alarm = this.alarms.get(alarmId);
    if (!alarm) throw new Error('Alarm not found');
    
    alarm.resolvedAt = new Date();
    alarm.response = response;
    alarm.falseAlarm = falseAlarm;
    
    this.createAuditLog('Alarm Resolved', 'Alarm', alarmId, 
      `Alarm resolved: ${response}`);
  }

  // Incident Management
  createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Incident {
    const newIncident: Incident = {
      ...incident,
      id: `INC-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.incidents.set(newIncident.id, newIncident);
    
    // Notify management for major/critical incidents
    if (incident.severity === 'Major' || incident.severity === 'Critical') {
      this.notifyManagement(newIncident);
    }
    
    this.createAuditLog('Incident Created', 'Incident', newIncident.id, 
      `${incident.type} incident reported at ${incident.location}`);
    
    return newIncident;
  }

  updateIncidentStatus(incidentId: string, status: IncidentStatus, notes: string): void {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    incident.status = status;
    incident.updatedAt = new Date();
    
    this.createAuditLog('Incident Updated', 'Incident', incidentId, 
      `Status changed to ${status}: ${notes}`);
  }

  // Badge Management
  issueBadge(badge: Omit<Badge, 'id' | 'badgeNumber' | 'issueDate' | 'status'>): Badge {
    const newBadge: Badge = {
      ...badge,
      id: `BADGE-${Date.now()}`,
      badgeNumber: this.generateBadgeNumber(badge.type),
      issueDate: new Date(),
      status: BadgeStatus.Active
    };
    
    this.badges.set(newBadge.badgeNumber, newBadge);
    
    this.createAuditLog('Badge Issued', 'Badge', newBadge.id, 
      `${badge.type} badge issued to ${badge.assignedTo}`);
    
    return newBadge;
  }

  deactivateBadge(badgeNumber: string, reason: string): void {
    const badge = this.badges.get(badgeNumber);
    if (!badge) throw new Error('Badge not found');
    
    badge.status = BadgeStatus.Inactive;
    badge.deactivationReason = reason;
    
    this.createAuditLog('Badge Deactivated', 'Badge', badge.id, 
      `Badge deactivated: ${reason}`);
  }

  // Camera Management
  getCameraFeed(cameraId: string): string {
    const camera = this.cameras.get(cameraId);
    if (!camera) throw new Error('Camera not found');
    
    if (camera.status !== 'Online') {
      throw new Error('Camera offline');
    }
    
    // Return camera feed URL
    return `/api/cameras/${cameraId}/feed`;
  }

  startRecording(cameraId: string): void {
    const camera = this.cameras.get(cameraId);
    if (!camera) throw new Error('Camera not found');
    
    camera.recordingEnabled = true;
    camera.status = 'Recording';
    
    this.createAuditLog('Recording Started', 'Camera', cameraId, 
      `Recording started on camera ${camera.name}`);
  }

  // Analytics & Reporting
  getSecurityMetrics(startDate: Date, endDate: Date): SecurityMetrics {
    const metrics: SecurityMetrics = {
      totalAccesses: 0,
      deniedAccesses: 0,
      activeAlarms: 0,
      openIncidents: 0,
      visitorsOnSite: 0,
      employeesOnSite: 0,
      zonesAtCapacity: 0,
      camerasOffline: 0,
      doorsOffline: 0,
      tailgatingEvents: 0,
      avgResponseTime: 0,
      complianceScore: 95
    };

    // Count access logs
    this.accessLogs.forEach(log => {
      if (log.timestamp >= startDate && log.timestamp <= endDate) {
        metrics.totalAccesses++;
        if (!log.granted) metrics.deniedAccesses++;
        if (log.tailgating) metrics.tailgatingEvents++;
      }
    });

    // Count active alarms
    this.alarms.forEach(alarm => {
      if (!alarm.resolvedAt) metrics.activeAlarms++;
    });

    // Count open incidents
    this.incidents.forEach(incident => {
      if (incident.status !== IncidentStatus.Closed) metrics.openIncidents++;
    });

    // Count visitors on site
    this.visitors.forEach(visitor => {
      if (!visitor.checkOutTime) metrics.visitorsOnSite++;
    });

    // Count zones at capacity
    this.zones.forEach(zone => {
      if (zone.currentOccupancy >= zone.capacity) metrics.zonesAtCapacity++;
    });

    // Count offline devices
    this.cameras.forEach(camera => {
      if (camera.status === 'Offline') metrics.camerasOffline++;
    });

    this.doors.forEach(door => {
      if (door.status === DoorStatus.Offline) metrics.doorsOffline++;
    });

    // Calculate average response time
    let totalResponseTime = 0;
    let respondedAlarms = 0;
    
    this.alarms.forEach(alarm => {
      if (alarm.acknowledgedAt) {
        totalResponseTime += alarm.acknowledgedAt.getTime() - alarm.triggeredAt.getTime();
        respondedAlarms++;
      }
    });
    
    if (respondedAlarms > 0) {
      metrics.avgResponseTime = totalResponseTime / respondedAlarms / 60000; // Convert to minutes
    }

    return metrics;
  }

  // Helper methods
  private logAccessAttempt(badgeNumber: string, doorId: string, granted: boolean, denialReason?: string): void {
    const badge = this.badges.get(badgeNumber);
    const door = this.doors.get(doorId);
    const zone = door ? this.zones.get(door.zoneId) : null;
    
    const log: AccessLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date(),
      personId: badge?.assignedTo || 'Unknown',
      personType: badge?.assignedType || 'Employee',
      personName: this.getPersonName(badge),
      doorId: doorId,
      doorName: door?.name || 'Unknown',
      zoneId: zone?.id || '',
      zoneName: zone?.name || 'Unknown',
      accessType: AccessType.Badge,
      granted,
      denialReason
    };
    
    this.accessLogs.push(log);
    
    if (door) {
      door.lastAccess = log;
    }
  }

  private getPersonName(badge?: Badge): string {
    if (!badge || !badge.assignedTo) return 'Unknown';
    
    if (badge.assignedType === 'Employee') {
      const employee = this.employees.get(badge.assignedTo);
      return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
    } else if (badge.assignedType === 'Visitor') {
      const visitor = this.visitors.get(badge.assignedTo);
      return visitor ? `${visitor.firstName} ${visitor.lastName}` : 'Unknown Visitor';
    }
    
    return 'Unknown';
  }

  private isWithinSchedule(zone: AccessZone): boolean {
    const now = new Date();
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const schedule = zone.schedule[day as keyof typeof zone.schedule];
    if (!schedule || schedule.length === 0) return false;
    
    return schedule.some(slot => currentTime >= slot.start && currentTime <= slot.end);
  }

  private generateVisitorBadge(): string {
    return `V-${Date.now().toString(36).toUpperCase()}`;
  }

  private generateBadgeNumber(type: string): string {
    const prefix = type.charAt(0).toUpperCase();
    const random = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100000).toString().padStart(5, '0');
    return `${prefix}-${random}`;
  }

  private createAuditLog(action: string, resourceType: string, resourceId: string, details: string): void {
    const log: AuditLog = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date(),
      userId: 'SYSTEM', // Would be actual user in production
      userName: 'System',
      action: action as AuditAction,
      resourceType,
      resourceId,
      details,
      ipAddress: '127.0.0.1', // Would be actual IP in production
      userAgent: 'SecurityManager',
      success: true
    };
    
    this.auditLogs.push(log);
  }

  private notifyHost(hostId: string, visitor: Visitor): void {
    // Implementation for notifying host employee
  }

  private notifySecurityTeam(alarm: Alarm): void {
    // Implementation for security team notification
  }

  private notifyManagement(incident: Incident): void {
    // Implementation for management notification
  }

  private escalateAlarm(alarm: Alarm): void {
    // Implementation for alarm escalation
  }
}