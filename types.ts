export enum RoomId {
  Q1 = 'quir_1',
  Q2 = 'quir_2',
  Q3 = 'quir_3',
  Q4 = 'quir_4',
  ENDO = 'endo_1',
}

export enum ProcedureType {
  PROGRAMADO = 'Programado',
  URGENCIA = 'Urgencia',
}

export interface Patient {
  firstName: string;
  lastName: string;
  dni: string;
  insurance: string; // Financiador
}

export interface Appointment {
  id: string;
  roomId: RoomId;
  date: string; // ISO Date string YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  cleanTimeMinutes: number;
  
  // Patient Info
  patient: Patient;
  
  // Procedure Info
  specialty: string;
  procedureType: ProcedureType;
  surgeon: string;
  procedureMaterials: string;
  equipment: string[]; // List of selected equipment
  needsRecovery: boolean;
  observations: string;
}

export interface RoomDefinition {
  id: RoomId;
  name: string;
  color: string;
  cardColor: string;
}