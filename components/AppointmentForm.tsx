import React, { useState, useMemo } from 'react';
import { Appointment, ProcedureType, RoomId } from '../types';
import { ROOMS, SPECIALTIES, INSURANCES, EQUIPMENT_OPTIONS, START_HOUR, END_HOUR } from '../constants';
import { Save, Clock, User, Activity, Briefcase, AlertTriangle } from 'lucide-react';
import { DatePicker } from './ui/DatePicker';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';

interface AppointmentFormProps {
  onSubmit: (appointment: Omit<Appointment, 'id'> | Appointment) => void;
  initialDate: string;
  initialRoomId?: RoomId;
  initialStartTime?: string;
  initialData?: Appointment | null;
  existingAppointments?: Appointment[];
  onCancel: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  onSubmit, 
  initialDate, 
  initialRoomId = RoomId.Q1, 
  initialStartTime = "08:00",
  initialData,
  existingAppointments = [],
  onCancel 
}) => {
  // Form State
  const [roomId, setRoomId] = useState<string>(initialData?.roomId || initialRoomId);
  const [date, setDate] = useState(initialData?.date || initialDate);
  const [startTime, setStartTime] = useState(initialData?.startTime || initialStartTime);
  
  // Patient
  const [firstName, setFirstName] = useState(initialData?.patient.firstName || '');
  const [lastName, setLastName] = useState(initialData?.patient.lastName || '');
  const [dni, setDni] = useState(initialData?.patient.dni || '');
  const [insurance, setInsurance] = useState(initialData?.patient.insurance || INSURANCES[0]);

  // Procedure
  const [specialty, setSpecialty] = useState(initialData?.specialty || SPECIALTIES[0]);
  const [procedureType, setProcedureType] = useState<string>(initialData?.procedureType || ProcedureType.PROGRAMADO);
  const [surgeon, setSurgeon] = useState(initialData?.surgeon || '');
  const [duration, setDuration] = useState(initialData?.durationMinutes || 60);
  const [cleanTime, setCleanTime] = useState(initialData?.cleanTimeMinutes || 30);
  const [materials, setMaterials] = useState(initialData?.procedureMaterials || '');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(initialData?.equipment || []);
  const [needsRecovery, setNeedsRecovery] = useState(initialData?.needsRecovery || false);
  const [observations, setObservations] = useState(initialData?.observations || '');

  const [error, setError] = useState<string | null>(null);

  const toggleEquipment = (item: string) => {
    setSelectedEquipment(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Calculate occupied slots to disable in the dropdown
  const occupiedSlots = useMemo(() => {
    return existingAppointments
      .filter(apt => {
         // Filter for current room/date, ignore self
         if (apt.roomId !== roomId || apt.date !== date) return false;
         if (initialData && apt.id === initialData.id) return false;
         return true;
      })
      .map(apt => {
        const start = timeToMinutes(apt.startTime);
        const end = start + apt.durationMinutes + apt.cleanTimeMinutes;
        return { start, end };
      });
  }, [existingAppointments, roomId, date, initialData]);

  const isTimeOccupied = (timeStr: string) => {
    const t = timeToMinutes(timeStr);
    // Logic: A start time is invalid if it falls strictly INSIDE an existing appointment's duration (Start <= t < End)
    // We allow t == existingEnd (back-to-back), but not t == existingStart
    return occupiedSlots.some(slot => t >= slot.start && t < slot.end);
  };

  const getConflicts = () => {
    const newStart = timeToMinutes(startTime);
    const newEnd = newStart + Number(duration) + Number(cleanTime);

    const conflicts = existingAppointments.filter(apt => {
      // Don't compare with self if editing
      if (initialData && apt.id === initialData.id) return false;
      
      // Must be same room and same date
      if (apt.roomId !== roomId || apt.date !== date) return false;

      const aptStart = timeToMinutes(apt.startTime);
      const aptEnd = aptStart + apt.durationMinutes + apt.cleanTimeMinutes;

      // Check overlap logic: (StartA < EndB) and (EndA > StartB)
      return (newStart < aptEnd) && (newEnd > aptStart);
    });

    return conflicts;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const conflicts = getConflicts();
    if (conflicts.length > 0) {
      const c = conflicts[0];
      const startMins = timeToMinutes(c.startTime);
      const totalMins = startMins + c.durationMinutes + c.cleanTimeMinutes;
      const endHour = Math.floor(totalMins / 60);
      const endMin = totalMins % 60;
      const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      setError(`Superposición detectada: El quirófano está ocupado por ${c.patient.lastName} de ${c.startTime} a ${endTimeFormatted} (incluye limpieza).`);
      return;
    }

    const payload: any = {
      roomId: roomId as RoomId,
      date,
      startTime,
      durationMinutes: Number(duration),
      cleanTimeMinutes: Number(cleanTime),
      patient: {
        firstName,
        lastName,
        dni,
        insurance,
      },
      specialty,
      procedureType: procedureType as ProcedureType,
      surgeon,
      procedureMaterials: materials,
      equipment: selectedEquipment,
      needsRecovery,
      observations,
    };

    if (initialData) {
        payload.id = initialData.id;
    }

    onSubmit(payload);
  };

  // Helper to handle Date object from DatePicker
  const handleDateChange = (newDate: Date) => {
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    setDate(`${year}-${month}-${day}`);
  };

  const getDateObject = (dateString: string) => {
    return new Date(`${dateString}T12:00:00`);
  };

  // Generate time options
  const timeOptions = [];
  for (let i = START_HOUR; i < END_HOUR; i++) {
    const h = i.toString().padStart(2, '0');
    timeOptions.push({ value: `${h}:00`, label: `${h}:00` });
    timeOptions.push({ value: `${h}:15`, label: `${h}:15` });
    timeOptions.push({ value: `${h}:30`, label: `${h}:30` });
    timeOptions.push({ value: `${h}:45`, label: `${h}:45` });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: Scheduling Details */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
        <h3 className="flex items-center text-lg font-semibold text-slate-800 mb-4">
          <Clock className="w-5 h-5 mr-2 text-sky-600" />
          Fecha y Lugar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block font-medium text-slate-600 mb-1.5">Fecha</label>
            <DatePicker 
              value={getDateObject(date)}
              onChange={handleDateChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1.5">Quirófano</label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Quirófano">
                   {roomId ? ROOMS.find(r => r.id === roomId)?.name : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROOMS.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1.5">Hora Inicio</label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger>
                <SelectValue placeholder="--:--" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {timeOptions.map(t => {
                   const occupied = isTimeOccupied(t.value);
                   return (
                      <SelectItem 
                        key={t.value} 
                        value={t.value}
                        className={occupied ? "opacity-50 line-through text-slate-400 pointer-events-none" : ""}
                      >
                        {t.label}
                      </SelectItem>
                   );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* SECTION 2: Patient Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="flex items-center text-lg font-semibold text-slate-800 mb-4">
          <User className="w-5 h-5 mr-2 text-sky-600" />
          Datos del Paciente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-600 mb-1.5">Nombre</label>
              <Input 
                type="text" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)}
                placeholder="Juan"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1.5">Apellido</label>
              <Input 
                type="text" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)}
                placeholder="Pérez"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-600 mb-1.5">DNI</label>
              <Input 
                type="text" 
                value={dni} 
                onChange={e => setDni(e.target.value)}
                placeholder="12.345.678"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1.5">Financiador</label>
              <Select value={insurance} onValueChange={setInsurance}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {INSURANCES.map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Procedure Details */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="flex items-center text-lg font-semibold text-slate-800 mb-4">
          <Activity className="w-5 h-5 mr-2 text-sky-600" />
          Detalle del Procedimiento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block font-medium text-slate-600 mb-1.5">Especialidad</label>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Especialidad" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px]">
                {SPECIALTIES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div>
            <label className="block font-medium text-slate-600 mb-1.5">Tipo</label>
            <Select value={procedureType} onValueChange={setProcedureType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProcedureType.PROGRAMADO}>Programado</SelectItem>
                <SelectItem value={ProcedureType.URGENCIA}>Urgencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block font-medium text-slate-600 mb-1.5">Cirujano</label>
            <Input 
              type="text" 
              value={surgeon} 
              onChange={e => setSurgeon(e.target.value)}
              placeholder="Dr. González"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-600 mb-1.5">Duración (min)</label>
              <Input 
                type="number" 
                min="15"
                step="15"
                value={duration} 
                onChange={e => setDuration(Number(e.target.value))}
              />
            </div>
             <div>
              <label className="block font-medium text-slate-600 mb-1.5">Limpieza (min)</label>
              <Input 
                type="number" 
                min="0"
                step="5"
                value={cleanTime} 
                onChange={e => setCleanTime(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-slate-600 mb-1.5">Materiales</label>
          <Input 
            type="text" 
            value={materials} 
            onChange={e => setMaterials(e.target.value)}
            placeholder="Ej: Prótesis cadera, Clavos, Malla..."
          />
        </div>
      </div>

       {/* SECTION 4: Equipment & Resources */}
       <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="flex items-center text-lg font-semibold text-slate-800 mb-4">
          <Briefcase className="w-5 h-5 mr-2 text-sky-600" />
          Recursos y Equipamiento
        </h3>
        
        <div className="mb-4">
          <label className="block font-medium text-slate-600 mb-2">Equipamiento Requerido</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EQUIPMENT_OPTIONS.map(eq => (
              <label key={eq} className="flex items-center space-x-2 cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedEquipment.includes(eq)}
                  onChange={() => toggleEquipment(eq)}
                  className="custom-checkbox"
                />
                <span className="text-slate-700">{eq}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <input 
            id="recovery"
            type="checkbox" 
            checked={needsRecovery}
            onChange={e => setNeedsRecovery(e.target.checked)}
            className="custom-checkbox"
          />
          <label htmlFor="recovery" className="text-slate-800 font-medium">Requiere Cama en Recuperación</label>
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1.5">Observaciones</label>
          <Textarea 
            value={observations}
            onChange={e => setObservations(e.target.value)}
            rows={3}
            placeholder="Notas adicionales..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-5 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="flex items-center px-6 py-2.5 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-lg font-medium shadow-md shadow-blue-500/20 transition-all"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Turno
        </button>
      </div>
    </form>
  );
}