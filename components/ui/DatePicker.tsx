import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onChange, 
  className = "",
  placeholder = "Seleccionar fecha"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync current month if value changes externally
  useEffect(() => {
    if (value) setCurrentMonth(value);
  }, [value]);

  const togglePopover = () => setIsOpen(!isOpen);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDayClick = (day: Date) => {
    if (onChange) onChange(day);
    setIsOpen(false);
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Calendar Grid Calculation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: es });
  const endDate = endOfWeek(monthEnd, { locale: es });
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={togglePopover}
        className={`
          flex w-full items-center justify-start text-left font-normal
          rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
          placeholder:text-slate-500 
          focus:outline-none focus:border-sky-500 focus:bg-slate-50
          disabled:cursor-not-allowed disabled:opacity-50
          transition-colors hover:bg-slate-50
          ${!value && "text-slate-500"}
        `}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, "PPP", { locale: es }) : <span>{placeholder}</span>}
      </button>

      {/* Popover Content */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-auto min-w-[280px] rounded-md border border-slate-200 bg-white p-4 shadow-md animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header */}
          <div className="flex items-center justify-between space-x-1 pt-1 pb-4">
            <button 
              type="button" 
              onClick={prevMonth}
              className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-100 rounded-md flex items-center justify-center transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-medium text-slate-900">
              {capitalize(format(currentMonth, "MMMM yyyy", { locale: es }))}
            </div>
            <button 
              type="button" 
              onClick={nextMonth}
              className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-100 rounded-md flex items-center justify-center transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days Header */}
          <div className="flex mb-2">
            {weekDays.map((day) => (
              <div key={day} className="w-9 text-[0.8rem] font-normal text-slate-500 text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 w-full">
            {calendarDays.map((day, dayIdx) => {
              const isSelected = value ? isSameDay(day, value) : false;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);

              return (
                <button
                  key={day.toString()}
                  type="button"
                  onClick={() => onDayClick(day)}
                  className={`
                    h-9 w-9 p-0 text-sm font-normal rounded-md flex items-center justify-center
                    transition-colors
                    ${!isCurrentMonth ? "text-slate-300 pointer-events-none" : "text-slate-900"}
                    ${isSelected 
                      ? "bg-sky-600 text-white hover:bg-sky-600 hover:text-white" 
                      : isCurrentMonth ? "hover:bg-slate-100" : ""}
                    ${isDayToday && !isSelected ? "bg-slate-100 text-sky-600 font-semibold" : ""}
                  `}
                >
                  <time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};