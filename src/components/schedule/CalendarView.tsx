import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Calendar, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePatientStore } from '../../stores/patientStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useAuthStore } from '../../stores/authStore';

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

const CalendarView = ({ onDateSelect, selectedDate }: CalendarViewProps) => {
  const { user } = useAuthStore();
  const { patients } = usePatientStore();
  const { appointments, getAppointmentsByDate, isLoading } = useScheduleStore();
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(dayjs(selectedDate).startOf('month'));
  const [calendarDays, setCalendarDays] = useState<dayjs.Dayjs[]>([]);
  const [appointmentsByDate, setAppointmentsByDate] = useState<Record<string, number>>({});
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  // Generate days for the calendar
  useEffect(() => {
    // Get start of the month
    const startOfMonth = currentMonth.startOf('month');
    
    // Get start of the calendar (might be in previous month)
    const startOfCalendar = startOfMonth.startOf('week');
    
    // Generate array of days
    const daysArray: dayjs.Dayjs[] = [];
    
    // Generate 42 days (6 weeks) to ensure we always show 6 rows
    for (let i = 0; i < 42; i++) {
      daysArray.push(startOfCalendar.add(i, 'day'));
    }
    
    setCalendarDays(daysArray);
  }, [currentMonth]);
  
  // Fetch appointments count for each day in the visible calendar
  useEffect(() => {
    const fetchAppointmentCounts = async () => {
      if (calendarDays.length === 0) return;
      
      setIsLoadingDates(true);
      
      try {
        // Get unique months visible in the calendar
        const uniqueMonths = Array.from(new Set(
          calendarDays.map(day => day.format('YYYY-MM'))
        ));
        
        const appointmentCounts: Record<string, number> = {};
        
        // For each month, fetch appointments
        for (const month of uniqueMonths) {
          const monthStart = dayjs(month).startOf('month');
          const monthEnd = dayjs(month).endOf('month');
          
          // This is where we would fetch appointment counts from the server
          // For now, let's simulate with random counts
          const daysInMonth = monthEnd.date();
          
          // Create simulated appointments counts
          for (let day = 1; day <= daysInMonth; day++) {
            const date = `${month}-${day.toString().padStart(2, '0')}`;
            
            // On weekends, fewer appointments
            const isWeekend = dayjs(date).day() === 0 || dayjs(date).day() === 6;
            const max = isWeekend ? 3 : 8;
            appointmentCounts[date] = Math.floor(Math.random() * max);
          }
        }
        
        setAppointmentsByDate(appointmentCounts);
      } catch (error) {
        console.error('Error fetching appointment counts:', error);
      } finally {
        setIsLoadingDates(false);
      }
    };
    
    fetchAppointmentCounts();
  }, [calendarDays]);
  
  const previousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };
  
  const nextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };
  
  const goToToday = () => {
    setCurrentMonth(dayjs().startOf('month'));
    onDateSelect(dayjs().format('YYYY-MM-DD'));
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-1 rounded-md hover:bg-gray-100"
            onClick={previousMonth}
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-base sm:text-lg font-medium text-gray-900">
            {currentMonth.format('MMMM YYYY')}
          </h2>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-gray-100"
            onClick={nextMonth}
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
          
          <button
            type="button"
            className="ml-2 px-3 py-1 text-xs bg-primary-50 text-primary-700 rounded border border-primary-200 hover:bg-primary-100 transition-colors"
            onClick={goToToday}
          >
            Today
          </button>
        </div>
      </div>
      
      <div className="p-2 sm:p-3">
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div 
              key={day} 
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const formattedDate = day.format('YYYY-MM-DD');
            const isToday = day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
            const isSelected = formattedDate === selectedDate;
            const isCurrentMonth = day.month() === currentMonth.month();
            const appointmentsCount = appointmentsByDate[day.format('YYYY-MM-DD')] || 0;
            const hasAppointments = appointmentsCount > 0;
            
            return (
              <div 
                key={index}
                className={cn(
                  "min-h-10 sm:min-h-14 p-1 relative border",
                  isCurrentMonth 
                    ? "bg-white hover:bg-gray-50" 
                    : "bg-gray-50 text-gray-400",
                  isSelected 
                    ? "border-primary-500" 
                    : "border-gray-100",
                  "transition-all cursor-pointer"
                )}
                onClick={() => onDateSelect(day.format('YYYY-MM-DD'))}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={cn(
                      "flex items-center justify-center text-xs",
                      isToday && "h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary-500 text-white",
                      !isToday && isSelected && "h-5 w-5 sm:h-6 sm:w-6 rounded-full border border-primary-500 text-primary-700"
                    )}
                  >
                    {day.format('D')}
                  </div>
                  
                  {isSelected && (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary-500" />
                  )}
                </div>
                
                {/* Appointment indicator */}
                {hasAppointments && isCurrentMonth && (
                  <div className="mt-1">
                    <div className="text-xs text-gray-600 font-medium hidden xs:block">
                      {appointmentsCount} appt{appointmentsCount > 1 ? 's' : ''}
                    </div>
                    <div className="mt-1">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full",
                          appointmentsCount > 5 ? "bg-error-500" : appointmentsCount > 2 ? "bg-warning-500" : "bg-success-500"
                        )}
                        style={{ width: `${Math.min(100, appointmentsCount * 20)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;