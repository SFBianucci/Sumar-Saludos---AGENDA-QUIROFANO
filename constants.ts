import { RoomDefinition, RoomId } from './types';

// Updated colors to match the "Sumar Salud" Blue/Cyan/Medical theme
export const ROOMS: RoomDefinition[] = [
  { id: RoomId.Q1, name: 'Quirófano 1', color: 'bg-sky-50 border-sky-200' },
  { id: RoomId.Q2, name: 'Quirófano 2', color: 'bg-blue-50 border-blue-200' },
  { id: RoomId.Q3, name: 'Quirófano 3', color: 'bg-cyan-50 border-cyan-200' },
  { id: RoomId.Q4, name: 'Quirófano 4', color: 'bg-slate-50 border-slate-200' },
  { id: RoomId.ENDO, name: 'Endoscopias', color: 'bg-emerald-50 border-emerald-200' },
];

export const SPECIALTIES = [
  'Cirugía General',
  'Traumatología',
  'Urología',
  'Ginecología',
  'Oftalmología',
  'Gastroenterología',
  'Cardiología',
  'Cirugía Plástica',
  'Neurocirugía',
  'ORL',
];

export const INSURANCES = [
  'OSDE',
  'Swiss Medical',
  'Galeno',
  'PAMI',
  'IOMA',
  'Sancor Salud',
  'Medicus',
  'OMINT',
  'Accord Salud',
  'Particular',
];

export const EQUIPMENT_OPTIONS = [
  'Arco en C',
  'Torre de Laparoscopía',
  'Microscopio',
  'Láser',
  'Monitor Multiparamétrico',
  'Mesa de Anestesia',
];

export const START_HOUR = 7;
export const END_HOUR = 22;
export const PIXELS_PER_HOUR = 120; // Controls the vertical zoom of the calendar