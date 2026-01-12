import React, { useRef } from 'react';
import { Appointment, RoomId, ProcedureType } from '../types';
import { ROOMS, START_HOUR, END_HOUR, PIXELS_PER_HOUR } from '../constants';
import { Sparkles, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const totalHours = END_HOUR - START_HOUR;
  const totalHeight = totalHours * PIXELS_PER_HOUR;
  const totalMinutesAvailable = totalHours * 60;

  // --- Helpers ---

  const scrollHorizontal = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 300; // Approx width of a column
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // "HH:mm" to Pixel offset from top
  const getTopOffset = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const minutesFromStart = (h - START_HOUR) * 60 + m;
    return (minutesFromStart / 60) * PIXELS_PER_HOUR;
  };

  // Height in Pixels
  const getHeight = (minutes: number) => {
    return (minutes / 60) * PIXELS_PER_HOUR;
  };

  // Calculate End Time string
  const getEndTime = (startTime: string, durationMinutes: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  // Format Duration like "(02:30 hs.)"
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `(${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} hs.)`;
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
    // Main Container with overflow-auto handling BOTH x and y scrolling
    <div 
      ref={containerRef}
      className="h-full w-full overflow-auto bg-white rounded-lg font-sans relative overscroll-contain scroll-smooth"
    >
      
      {/* Inner Container to enforce minimum width for mobile scrolling */}
      <div className="min-w-[900px] md:min-w-full relative">

        {/* --- HEADER ROW (Sticky Top) --- */}
        <div className="flex sticky top-0 z-40 bg-slate-50 border-b border-slate-200 shadow-sm h-[70px]">
          
          {/* Top-Left Corner (Sticky Left + Sticky Top) - HIGHEST Z-INDEX */}
          <div className="sticky left-0 z-50 w-14 flex-shrink-0 bg-white border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
            {/* Corner content if needed */}
          </div>
          
          {/* Room Headers Container */}
          <div className="flex-1 flex relative">
            
            {/* --- NAVIGATION BUTTONS (Overlay in Header) --- */}
            {/* Left Scroll Button Container - Width 0 to prevent layout shift */}
            <div className="sticky left-0 z-50 h-full flex items-center w-0 overflow-visible pointer-events-none">
                 <button 
                    onClick={() => scrollHorizontal('left')}
                    className="pointer-events-auto absolute left-2 bg-white/90 hover:bg-white text-slate-600 hover:text-sky-600 border border-slate-200 shadow-md rounded-full p-1.5 transition-all active:scale-95 backdrop-blur-sm"
                    aria-label="Scroll Izquierda"
                 >
                    <ChevronLeft className="w-4 h-4" />
                 </button>
            </div>

            {/* Room Columns Render */}
            {ROOMS.map(room => {
              const occupancy = getRoomOccupancy(room.id);
              return (
                <div key={room.id} className={`flex-1 px-2 py-3 text-center border-r border-slate-100 last:border-r-0 flex flex-col justify-between ${room.color}`}>
                  <div>
                    <span className="font-bold text-slate-700 block text-xs md:text-sm truncate uppercase tracking-tight">{room.name}</span>
                  </div>
                  <div className="mt-1 text-[10px] font-semibold text-slate-500">
                    Ocupación: <span className={occupancy > 80 ? 'text-rose-500' : 'text-slate-600'}>{occupancy}%</span>
                  </div>
                </div>
              );
            })}

             {/* Right Scroll Button Container - Width 0 to prevent layout shift */}
             <div className="sticky right-0 z-50 h-full flex items-center justify-end w-0 overflow-visible pointer-events-none ml-auto">
                 <button 
                    onClick={() => scrollHorizontal('right')}
                    className="pointer-events-auto absolute right-2 bg-white/90 hover:bg-white text-slate-600 hover:text-sky-600 border border-slate-200 shadow-md rounded-full p-1.5 transition-all active:scale-95 backdrop-blur-sm"
                    aria-label="Scroll Derecha"
                 >
                    <ChevronRight className="w-4 h-4" />
                 </button>
            </div>

          </div>
        </div>

        {/* --- BODY ROW --- */}
        <div className="flex relative" style={{ height: totalHeight }}>
          
          {/* Time Column (Sticky Left) */}
          <div className="sticky left-0 z-30 w-14 flex-shrink-0 border-r border-slate-200 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
             {Array.from({ length: totalHours }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full text-center border-b border-slate-100 flex items-start justify-center pt-1 text-[10px] text-slate-400 font-medium"
                style={{ 
                  top: i * PIXELS_PER_HOUR, 
                  height: PIXELS_PER_HOUR 
                }}
              >
                {formatTime(START_HOUR + i)}
              </div>
            ))}
          </div>

          {/* Grid Content */}
          <div className="flex-1 flex relative bg-slate-50/30">
            {/* Background Grid Lines */}
             <div className="absolute inset-0 w-full pointer-events-none z-0">
               {Array.from({ length: totalHours }).map((_, i) => (
                 <div 
                   key={i} 
                   className="w-full border-b border-dashed border-slate-200"
                   style={{ 
                     position: 'absolute',
                     top: i * PIXELS_PER_HOUR,
                     height: 1 
                   }}
                 />
               ))}
             </div>

            {/* Room Columns */}
            {ROOMS.map(room => (
              <div 
                key={room.id} 
                className="flex-1 border-r border-slate-200 last:border-r-0 relative group hover:bg-slate-100/40 transition-colors"
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
                  <div className="opacity-0 group-hover:opacity-100 absolute top-0 left-0 bg-slate-900/5 w-full h-full pointer-events-none transition-opacity" />
                </div>

                {/* Appointments for this room */}
                {appointments
                  .filter(apt => apt.roomId === room.id && apt.date === date)
                  .map(apt => {
                    const top = getTopOffset(apt.startTime);
                    const height = getHeight(apt.durationMinutes);
                    const endTime = getEndTime(apt.startTime, apt.durationMinutes);
                    const isUrgency = apt.procedureType === ProcedureType.URGENCIA;

                    // Light/Pastel Colors Logic (Restored)
                    const bgClass = isUrgency 
                        ? 'bg-orange-50 border-orange-400 text-orange-900 shadow-orange-100' 
                        : room.cardColor;
                    
                    const isTiny = height < 35;
                    const isSmall = height < 60;
                    const isMedium = height < 90;

                    const requirementsText = [
                        ...apt.equipment, 
                        apt.procedureMaterials
                    ].filter(Boolean).join(', ');

                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => { e.stopPropagation(); onAppointmentClick(apt); }}
                        className={`absolute left-0.5 right-0.5 rounded-[4px] shadow-sm cursor-pointer transition-all hover:brightness-105 hover:z-20 hover:shadow-md overflow-hidden flex flex-col border-l-4
                          ${bgClass} group/card z-10`}
                        style={{ top, height }}
                      >
                         <div className="flex flex-col h-full relative p-1.5">
                            
                            {/* 1. Header: Procedure Name */}
                            <div className="font-extrabold uppercase text-[10px] md:text-[11px] leading-tight truncate tracking-wide mb-0.5">
                                {apt.specialty}
                            </div>

                            {!isTiny && (
                                <>
                                    {/* 2. Time & Duration */}
                                    <div className="text-[10px] font-medium opacity-90 flex items-center gap-1 shrink-0 mb-1">
                                        {apt.startTime} - {endTime} hs. <span className="opacity-75 font-normal">{formatDuration(apt.durationMinutes)}</span>
                                    </div>

                                    {/* 3. Surgeon Block - WHITER BACKGROUND */}
                                    {!isSmall && (
                                        <div className="bg-white/70 rounded-[3px] px-1.5 py-0.5 mb-1 backdrop-blur-[1px] border border-white/50 shadow-sm">
                                            <div className="text-[9px] truncate text-slate-900">
                                                <span className="opacity-60 font-medium mr-1 text-slate-700">Cirujano:</span> 
                                                <span className="font-bold">{apt.surgeon}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. Requirements Text */}
                                    {!isSmall && !isMedium && requirementsText && (
                                        <div className="text-[9px] leading-tight opacity-90 mb-1 px-0.5 line-clamp-2">
                                            <span className="opacity-75 font-normal mr-1">Requerimientos:</span>
                                            <span className="font-medium">{requirementsText}</span>
                                        </div>
                                    )}

                                    {/* 5. Patient Block */}
                                    {!isSmall && (
                                        <div className="mt-auto bg-current/10 rounded-[3px] px-1.5 py-0.5 flex items-center gap-1.5">
                                            <div className="bg-white/50 p-0.5 rounded-full">
                                                <Activity className="w-2.5 h-2.5 opacity-80" />
                                            </div>
                                            <div className="text-[9px] truncate font-bold">
                                                <span className="opacity-75 font-normal mr-1">Paciente:</span>
                                                {apt.patient.lastName} {apt.patient.firstName}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
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
                        className="absolute left-1 right-1 flex items-center justify-center bg-stripes pointer-events-none rounded-sm opacity-60 z-0"
                        style={{ top, height }}
                      >
                         {height > 15 && (
                             <div className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm border border-slate-200">
                                 <Sparkles className="w-2.5 h-2.5 text-slate-500" />
                                 <span className="text-[9px] font-bold text-slate-600 whitespace-nowrap">
                                   Limpieza: {apt.cleanTimeMinutes}m
                                 </span>
                             </div>
                         )}
                      </div>
                    )
                  })}

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};