// Extended types for PilotProgramDashboard component
export interface PilotProgramMetrics {
  participantCount: number
  avgYieldImprovement: number
  energySavings: number
  dataPointsCollected: number
}

export interface PilotProgramNotification {
  facilityId?: string
  actionRequired?: boolean
}

export interface PilotProgramWebSocketMessage {
  type: string
  data: any
}

export interface PilotProgramExport {
  facilityId: string
  data: any[]
  exportDate: Date
}