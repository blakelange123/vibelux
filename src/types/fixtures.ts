// fixtures type definitions

export interface fixtures {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type fixturesStatus = 'active' | 'inactive' | 'pending';

export interface fixturesResponse {
  data: fixtures[];
  total: number;
  page: number;
  pageSize: number;
}
