import React from 'react';
import { Appointment, RoomId, ProcedureType } from '../types';
import { ROOMS, START_HOUR, END_HOUR, PIXELS_PER_HOUR } from '../constants';
import { Clock, User, AlertCircle, Sparkles } from 'lucide-react';

interface ScheduleGridProps {
  date: string;
  appointments: Appointment[];
  onSlotClick: (roomId: RoomId, time: string) => void;
  onAppointmentClick: (apt: Appointment) => void;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  date, 
  appointments, 
  onSlotClick,
  onAppointmentClick
}) => {
  const totalHours = END_HOUR - START_HOUR;
  const totalHeight = totalHours * PIXELS_PER_HOUR;
  const totalMinutesAvailable = totalHours * 60;

  // Helper to convert "HH:mm" to pixel offset from top
  const getTopOffset = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const minutesFromStart = (h - START_HOUR) * 60 + m;
    return (minutesFromStart / 60) * PIXELS_PER_HOUR;
  };

  // Helper to get height from duration minutes
  const getHeight = (minutes: number) => {
    return (minutes / 60) * PIXELS_PER_HOUR;
  };

  // Helper to calculate occupancy percentage for a room
  const getRoomOccupancy = (roomId: RoomId) => {
    const roomApts = appointments.filter(a => a.roomId === roomId && a.date === date);
    const totalMinutesUsed = roomApts.reduce((acc, curr) => acc + curr.durationMinutes + curr.cleanTimeMinutes, 0);
    return Math.round((totalMinutesUsed / totalMinutesAvailable) * 100);
  };

  // Format time for display
  const formatTime = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      
      {/* Header: Rooms */}
      <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
        <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-white"></div> {/* Time axis header */}
        <div className="flex-1 flex overflow-x-auto">
           {/* Mobile responsiveness: min-w on container ensures scrolling on small screens */}
           <div className="flex w-full min-w-[800px]">
            {ROOMS.map(room => {
              const occupancy = getRoomOccupancy(room.id);
              return (
                <div key={room.id} className="flex-1 px-2 py-3 text-center border-r border-slate-200 last:border-r-0 flex flex-col justify-between">
                  <div>
                    <span className="font-semibold text-slate-700 block text-sm">{room.name}</span>
                    <div className={`h-1 w-8 mx-auto mt-1 rounded-full ${room.color.replace('bg-', 'bg-').replace('border-', 'bg-').split(' ')[0].replace('50', '500')}`}></div>
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-500">
                    Ocupación: <span className={occupancy > 80 ? 'text-red-500 font-bold' : 'text-slate-700'}>{occupancy}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body: Time & Grid */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="flex min-w-[800px]"> {/* Wrap content to allow horizontal scroll on mobile */}
          
          {/* Time Sidebar */}
          <div 
            className="w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50 text-xs text-slate-500 font-medium relative z-10"
            style={{ height: totalHeight }}
          >
            {Array.from({ length: totalHours }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full text-center border-b border-slate-200 flex items-start justify-center pt-1"
                style={{ 
                  top: i * PIXELS_PER_HOUR, 
                  height: PIXELS_PER_HOUR 
                }}
              >
                {formatTime(START_HOUR + i)}
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          <div className="flex-1 flex relative" style={{ height: totalHeight }}>
             {/* Background Grid Lines */}
             <div className="absolute inset-0 w-full pointer-events-none z-0">
               {Array.from({ length: totalHours }).map((_, i) => (
                 <div 
                   key={i} 
                   className="w-full border-b border-dashed border-slate-100"
                   style={{ 
                     position: 'absolute',
                     top: i * PIXELS_PER_HOUR,
                     height: 1 
                   }}
                 />
               ))}
             </div>

            {ROOMS.map(room => (
              <div 
                key={room.id} 
                className="flex-1 border-r border-slate-100 last:border-r-0 relative group"
              >
                {/* Click listener for empty slots */}
                <div 
                  className="absolute inset-0 z-0 cursor-crosshair"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relativeY = e.nativeEvent.offsetY;
                    const hoursClicked = Math.floor(relativeY / PIXELS_PER_HOUR);
                    const minutesClicked = Math.floor((relativeY % PIXELS_PER_HOUR) / (PIXELS_PER_HOUR/60));
                    
                    // Round to nearest 15
                    const roundedMinutes = Math.floor(minutesClicked / 15) * 15;
                    const hour = START_HOUR + hoursClicked;
                    const timeString = `${hour.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
                    
                    onSlotClick(room.id, timeString);
                  }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute top-0 left-0 bg-indigo-50 text-indigo-600 text-[10px] p-1 pointer-events-none transition-opacity">
                    + Agendar
                  </div>
                </div>

                {/* Appointments for this room */}
                {appointments
                  .filter(apt => apt.roomId === room.id && apt.date === date)
                  .map(apt => {
                    const top = getTopOffset(apt.startTime);
                    const height = getHeight(apt.durationMinutes);
                    const cleanHeight = getHeight(apt.cleanTimeMinutes);
                    const isUrgency = apt.procedureType === ProcedureType.URGENCIA;

                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => { e.stopPropagation(); onAppointmentClick(apt); }}
                        className={`absolute left-1 right-1 rounded px-2 py-1 shadow-sm cursor-pointer border-l-4 transition-all hover:scale-[1.02] hover:shadow-md hover:z-20 text-xs overflow-hidden
                          ${isUrgency 
                            ? 'bg-red-50 border-red-500 text-red-900' 
                            : 'bg-sky-100 border-sky-500 text-sky-900'
                          }`}
                        style={{ top, height }}
                      >
                        <div className="font-bold truncate flex items-center gap-1">
                          {isUrgency && <AlertCircle className="w-3 h-3 text-red-600" />}
                          {apt.patient.lastName.toUpperCase()}, {apt.patient.firstName}
                        </div>
                        <div className="truncate opacity-90">{apt.specialty}</div>
                        <div className="flex items-center gap-1 mt-1 opacity-75 text-[10px]">
                          <User className="w-3 h-3" />
                          <span className="truncate">{apt.surgeon}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-75 text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>{apt.startTime} - {apt.durationMinutes}m</span>
                        </div>
                      </div>
                    );
                  })}
                  
                 {/* Cleanup Time Visualization */}
                 {appointments
                  .filter(apt => apt.roomId === room.id && apt.date === date && apt.cleanTimeMinutes > 0)
                  .map(apt => {
                    const top = getTopOffset(apt.startTime) + getHeight(apt.durationMinutes);
                    const height = getHeight(apt.cleanTimeMinutes);
                    
                    return (
                      <div 
                        key={`clean-${apt.id}`}
                        className="absolute left-1 right-1 flex items-center justify-center bg-stripes pointer-events-none"
                        style={{ top, height }}
                      >
                        <Sparkles className="w-3 h-3 text-slate-500 opacity-70" />
                      </div>
                    )
                  })}

              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend Footer */}
      <div className="p-2 bg-slate-50 border-t border-slate-200 flex gap-4 text-xs text-slate-600 justify-end">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-sky-100 border-l-2 border-sky-500"></div>
          <span>Programado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-50 border-l-2 border-red-500"></div>
          <span>Urgencia</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-stripes border border-slate-200"></div>
          <span>Limpieza</span>
        </div>
      </div>
    </div>
  );
};