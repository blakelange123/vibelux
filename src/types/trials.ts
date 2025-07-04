// trials type definitions

export interface trials {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type trialsStatus = 'active' | 'inactive' | 'pending';

export interface trialsResponse {
  data: trials[];
  total: number;
  page: number;
  pageSize: number;
}
