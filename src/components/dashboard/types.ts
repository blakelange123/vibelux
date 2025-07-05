import { Layout } from 'react-grid-layout';

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  dataBindings: {
    source: 'modbus' | 'sensor' | 'database' | 'calculation' | 'websocket';
    path: string;
    refreshRate?: number;
    transform?: string; // JavaScript expression
  }[];
  config: any;
  locked?: boolean;
}

export interface Dashboard {
  id?: string;
  name: string;
  widgets: DashboardWidget[];
  layouts: { [key: string]: Layout[] };
}

export interface DashboardTemplate {
  name: string;
  widgets: Omit<DashboardWidget, 'id'>[];
  layouts: { [key: string]: Layout[] };
}