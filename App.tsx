import React, { useState } from 'react';
import { ScheduleGrid } from './components/ScheduleGrid';
import { AppointmentForm } from './components/AppointmentForm';
import { Modal } from './components/ui/Modal';
import { DatePicker } from './components/ui/DatePicker';
import { Appointment, RoomId, ProcedureType } from './types';
import { Plus } from 'lucide-react';
import { ROOMS } from './constants';
import { Logo } from './components/Logo';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Initial Data
const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    roomId: RoomId.Q1,
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    durationMinutes: 90,
    cleanTimeMinutes: 30,
    patient: {
      firstName: 'Roberto',
      lastName: 'Gomez',
      dni: '20.123.456',
      insurance: 'OSDE'
    },
    specialty: 'Traumatología',
    procedureType: ProcedureType.PROGRAMADO,
    surgeon: 'Dr. Martinez',
    procedureMaterials: 'Clavos femorales',
    equipment: ['Arco en C'],
    needsRecovery: true,
    observations: 'Paciente alérgico al iodo'
  },
  {
    id: '2',
    roomId: RoomId.Q3,
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    durationMinutes: 60,
    cleanTimeMinutes: 15,
    patient: {
      firstName: 'Maria',
      lastName: 'Lopez',
      dni: '30.987.654',
      insurance: 'Galeno'
    },
    specialty: 'Cirugía General',
    procedureType: ProcedureType.URGENCIA,
    surgeon: 'Dra. Fernandez',
    procedureMaterials: '',
    equipment: ['Torre de Laparoscopía'],
    needsRecovery: true,
    observations: ''
  }
];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for pre-filling the form when clicking a slot or editing
  const [selectedSlot, setSelectedSlot] = useState<{roomId: RoomId, time: string} | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleCreateOrUpdateAppointment = (data: Omit<Appointment, 'id'> | Appointment) => {
    if ('id' in data) {
      // Update existing
      setAppointments(appointments.map(apt => apt.id === data.id ? data as Appointment : apt));
    } else {
      // Create new
      const newAppointment: Appointment = {
        ...data,
        id: generateId(),
      };
      setAppointments([...appointments, newAppointment]);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setEditingAppointment(null);
  };

  const openNewAppointmentModal = () => {
    setSelectedSlot(null);
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleSlotClick = (roomId: RoomId, time: string) => {
    setSelectedSlot({ roomId, time });
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleAppointmentClick = (apt: Appointment) => {
    setEditingAppointment(apt);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  // Helper to safely handle timezone when converting Date picker to YYYY-MM-DD
  const handleDateChange = (date: Date) => {
    // We construct the string manually to avoid timezone shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  // Safe parse for initial value
  const getDateObject = (dateString: string) => {
    // append T12:00:00 to avoid UTC midnight shifts
    return new Date(`${dateString}T12:00:00`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <Logo className="h-12 w-auto" />
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <p className="text-sm text-slate-500 font-medium">Gestión Quirúrgica</p>
        </div>
        
        <div className="flex items-center space-x-4">
           {/* Date Picker */}
           <div className="w-56">
             <DatePicker 
               value={getDateObject(currentDate)}
               onChange={handleDateChange}
             />
           </div>

          <button 
            onClick={openNewAppointmentModal}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Turno
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
        
        {/* Statistics / Summary Bar */}
        <div className="mb-4 flex gap-4 overflow-x-auto pb-2">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm min-w-[160px] flex flex-col justify-between">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Turnos</span>
                <div className="text-3xl font-bold text-slate-700 mt-1">{appointments.filter(a => a.date === currentDate).length}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm min-w-[160px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-0 top-0 p-2 opacity-10">
                  <div className="w-16 h-16 bg-red-500 rounded-full blur-xl"></div>
                </div>
                <span className="text-xs text-red-400 uppercase font-bold tracking-wider">Urgencias</span>
                <div className="text-3xl font-bold text-red-500 mt-1">
                    {appointments.filter(a => a.date === currentDate && a.procedureType === ProcedureType.URGENCIA).length}
                </div>
            </div>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <ScheduleGrid 
            date={currentDate}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>
      </main>

      {/* Booking Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={editingAppointment ? "Editar Turno" : (selectedSlot ? "Agendar Turno" : "Nuevo Agendamiento")}
      >
        <AppointmentForm 
          key={editingAppointment ? editingAppointment.id : (selectedSlot ? `${selectedSlot.roomId}-${selectedSlot.time}` : 'new')}
          onSubmit={handleCreateOrUpdateAppointment}
          initialDate={currentDate}
          initialRoomId={selectedSlot?.roomId}
          initialStartTime={selectedSlot?.time}
          initialData={editingAppointment}
          existingAppointments={appointments}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}

export default App;