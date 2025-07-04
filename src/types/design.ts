// design type definitions

export interface design {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type designStatus = 'active' | 'inactive' | 'pending';

export interface designResponse {
  data: design[];
  total: number;
  page: number;
  pageSize: number;
}
