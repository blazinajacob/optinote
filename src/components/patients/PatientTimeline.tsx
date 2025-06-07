import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, FileText, Edit, Plus, Eye, Filter, ChevronDown, CheckCircle, X } from 'lucide-react';
import dayjs from 'dayjs';
import { useExaminationStore } from '../../stores/examinationStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { usePatientStore } from '../../stores/patientStore';
import { formatDate, formatTime } from '../../lib/utils';
import { Patient, Appointment, Examination, SOAPNote, TimelineEvent } from '../../types';
import { cn } from '../../lib/utils';

interface PatientTimelineProps {
  patientId: string;
  className?: string;
}

// Categories for filtering the timeline
type EventCategory = 'all' | 'appointment' | 'examination' | 'record' | 'note';

const PatientTimeline = ({ patientId, className }: PatientTimelineProps) => {
  const { selectedPatient } = usePatientStore();
  const { examinations, soapNotes, getExaminationsByPatientId } = useExaminationStore();
  const { appointments, getAppointmentsByPatientId } = useScheduleStore();

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState<EventCategory>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load data
  useEffect(() => {
    if (patientId) {
      getExaminationsByPatientId(patientId);
      getAppointmentsByPatientId(patientId);
    }
  }, [patientId, getExaminationsByPatientId, getAppointmentsByPatientId]);

  // Build timeline when data changes
  useEffect(() => {
    if (!selectedPatient) return;

    const events: TimelineEvent[] = [];

    // Add patient creation event
    events.push({
      id: `patient-created-${selectedPatient.id}`,
      type: 'record',
      title: 'Patient record created',
      date: selectedPatient.createdAt,
      icon: Plus,
      iconBackground: 'bg-primary-500',
      content: `Patient record was created for ${selectedPatient.firstName} ${selectedPatient.lastName}`
    });

    // Add patient updates
    if (selectedPatient.updatedAt !== selectedPatient.createdAt) {
      events.push({
        id: `patient-updated-${selectedPatient.id}`,
        type: 'record',
        title: 'Patient information updated',
        date: selectedPatient.updatedAt,
        icon: Edit,
        iconBackground: 'bg-secondary-500',
        content: 'Patient information was updated'
      });
    }

    // Add appointments to timeline
    appointments.forEach(appointment => {
      const isCompleted = appointment.status === 'completed';
      const isCancelled = appointment.status === 'cancelled';
      
      events.push({
        id: `appointment-${appointment.id}`,
        type: 'appointment',
        title: `${appointment.type.replace('-', ' ')} appointment ${
          isCompleted ? 'completed' : 
          isCancelled ? 'cancelled' : 
          'scheduled'
        }`,
        date: isCompleted || isCancelled ? appointment.updatedAt : appointment.createdAt,
        icon: Calendar,
        iconBackground: isCompleted ? 'bg-success-500' : isCancelled ? 'bg-gray-500' : 'bg-accent-500',
        content: appointment.notes || `${appointment.type.replace('-', ' ')} appointment on ${formatDate(appointment.date)} at ${formatTime(new Date(`2000-01-01T${appointment.startTime}`))}`,
        link: `/appointments/${appointment.id}`,
        status: appointment.status
      });
    });

    // Add examinations to timeline
    examinations.forEach(examination => {
      events.push({
        id: `examination-${examination.id}`,
        type: 'examination',
        title: 'Eye examination',
        date: examination.date,
        icon: Eye,
        iconBackground: 'bg-primary-500',
        content: examination.chiefComplaint,
        link: `/patients/${patientId}/examination?exam=${examination.id}`,
        status: examination.status
      });
    });

    // Add SOAP notes to timeline
    soapNotes.forEach(note => {
      events.push({
        id: `soap-${note.id}`,
        type: 'note',
        title: 'SOAP note created',
        date: note.createdAt,
        icon: FileText,
        iconBackground: 'bg-success-500',
        content: `SOAP note for examination on ${formatDate(note.createdAt)}`,
        link: `/patients/${patientId}/soap?exam=${note.examinationId}`
      });
    });

    // Sort by date, newest first
    const sortedEvents = events.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setTimelineEvents(sortedEvents);
  }, [selectedPatient, appointments, examinations, soapNotes, patientId]);

  // Filter timeline events
  const filteredEvents = filter === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(event => event.type === filter);

  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Patient Timeline</h3>
        <div className="relative">
          <button
            type="button"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {filter === 'all' ? 'All events' : `${filter.charAt(0).toUpperCase() + filter.slice(1)}s`}
            <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", showFilters && "rotate-180")} />
          </button>
          
          {showFilters && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  className={cn(
                    "block w-full text-left px-4 py-2 text-sm",
                    filter === 'all' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setFilter('all');
                    setShowFilters(false);
                  }}
                >
                  All events
                </button>
                <button
                  className={cn(
                    "block w-full text-left px-4 py-2 text-sm",
                    filter === 'appointment' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setFilter('appointment');
                    setShowFilters(false);
                  }}
                >
                  Appointments
                </button>
                <button
                  className={cn(
                    "block w-full text-left px-4 py-2 text-sm",
                    filter === 'examination' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setFilter('examination');
                    setShowFilters(false);
                  }}
                >
                  Examinations
                </button>
                <button
                  className={cn(
                    "block w-full text-left px-4 py-2 text-sm",
                    filter === 'record' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setFilter('record');
                    setShowFilters(false);
                  }}
                >
                  Record updates
                </button>
                <button
                  className={cn(
                    "block w-full text-left px-4 py-2 text-sm",
                    filter === 'note' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setFilter('note');
                    setShowFilters(false);
                  }}
                >
                  Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="flow-root">
          <ul className="px-6 py-5 divide-y divide-gray-200">
            {filteredEvents.map((event, eventIdx) => (
              <li key={event.id} className="py-4">
                <div className="flex space-x-3">
                  <div className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                    event.iconBackground
                  )}>
                    {event.icon && <event.icon className="h-5 w-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      {event.content}
                    </div>
                    {event.status && (
                      <div className="mt-1">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          event.status === 'completed' ? 'bg-success-100 text-success-800' : 
                          event.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          event.status === 'in-progress' ? 'bg-warning-100 text-warning-800' : 
                          event.status === 'checked-in' ? 'bg-primary-100 text-primary-800' :
                          'bg-accent-100 text-accent-800'
                        )}>
                          {event.status.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                    {event.link && (
                      <div className="mt-2">
                        <button
                          type="button"
                          className="text-sm text-primary-600 hover:text-primary-800"
                          onClick={() => window.location.href = event.link!}
                        >
                          View details →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="px-6 py-10 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline events</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'This patient has no recorded activity yet.' 
              : `No ${filter} events found for this patient.`}
          </p>
          {filter !== 'all' && (
            <button
              type="button"
              className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setFilter('all')}
            >
              <X className="mr-1.5 h-3 w-3" />
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientTimeline;