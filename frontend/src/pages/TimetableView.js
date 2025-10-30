import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timetableService, scheduleEntryService } from '../services/crudService';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  UserIcon,
  BuildingOfficeIcon,
  PrinterIcon,
  ShareIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const TimetableView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const { isAdmin, isTeacher } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({ teacher_id: '', room_id: '' });

  // Fetch timetable with schedule data
  const { data: timetableData, isLoading, error } = useQuery({
    queryKey: ['timetable', id, 'schedule'],
    queryFn: () => timetableService.getWithSchedule(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  // 8 periods of 60 minutes, lunch break from 13:00-14:00 (period index 4)
  const timeSlots = [
    { id: 0, time: '09:00 - 10:00', period: '1st Period' },
    { id: 1, time: '10:00 - 11:00', period: '2nd Period' },
    { id: 2, time: '11:00 - 12:00', period: '3rd Period' },
    { id: 3, time: '12:00 - 13:00', period: '4th Period' },
    { id: 4, time: '13:00 - 14:00', period: 'Lunch Break', isBreak: true },
    { id: 5, time: '14:00 - 15:00', period: '5th Period' },
    { id: 6, time: '15:00 - 16:00', period: '6th Period' },
    { id: 7, time: '16:00 - 17:00', period: '7th Period' }
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const skipCells = React.useRef(new Set());

  // Helper function to get schedule entry for a specific day and time slot
  const getScheduleEntry = (day, timeSlotId) => {
    if (!timetableData?.schedule_entries) return null;
    const dayIndex = weekDays.indexOf(day);
    return timetableData.schedule_entries.find(entry => 
      entry.day_index === dayIndex && entry.period_index === timeSlotId
    );
  };

  // Helper function to render a schedule cell
  const renderScheduleCell = (day, timeSlot) => {
    if (timeSlot.isBreak) {
      return (
        <div className="p-2 text-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium rounded">
          {timeSlot.period}
        </div>
      );
    }

    const dayIdx = weekDays.indexOf(day);
    const key = `${dayIdx}-${timeSlot.id}`;
    if (skipCells.current.has(key)) {
      return <div className="p-2" />;
    }
    const entry = getScheduleEntry(day, timeSlot.id);
    
    if (!entry) {
      return (
        <div className="p-2 text-center text-gray-400 dark:text-gray-500 text-sm italic">
          Free Period
        </div>
      );
    }

    // Determine label rules: lectures use division only; labs/tutorials use division+batch
    const isLecture = entry.subject?.type === 'lecture';
    const divisionLabel = entry.division?.name ? `Div ${entry.division.name}` : '';
    const batchLabel = entry.batch?.number ? ` - Batch ${entry.batch.number}` : '';

    // Detect 2-hour lab spanning
    const isLab = entry.subject?.type === 'lab';
    const nextEntry = getScheduleEntry(day, timeSlot.id + 1);
    const isConsecutiveLab = isLab && nextEntry && nextEntry.subject?.type === 'lab' && (nextEntry.batch?.id === entry.batch?.id) && (nextEntry.division?.id === entry.division?.id);
    if (isConsecutiveLab) {
      skipCells.current.add(`${dayIdx}-${timeSlot.id + 1}`);
    }

    return (
      <div className={`p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors ${isConsecutiveLab ? 'min-h-[96px]' : ''}`}>
        {/* Subject Name - Bold and prominent */}
        <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
          {entry.subject?.name || 'Subject'}
        </div>
        
        {/* Room Number - with icon */}
        <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center mb-1">
          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
          🏢 {entry.room?.room_number || entry.room?.number || 'Room'}
        </div>
        
        {/* Batch/Division - with icon */}
        <div className="text-xs text-blue-700 dark:text-blue-300 flex items-center mb-1">
          <UserIcon className="h-3 w-3 mr-1" />
          👥 {isLecture ? divisionLabel : `${divisionLabel}${batchLabel}`}
        </div>
        
        {/* Teacher Name - with icon */}
        <div className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
          <UserIcon className="h-3 w-3 mr-1" />
          👨‍🏫 {entry.teacher?.name || entry.teacher?.full_name || 'Teacher'}
        </div>

        {(isAdmin() || isTeacher()) && (
          <div className="mt-2 text-right">
            <button
              className="text-xs text-primary-600 hover:underline"
              onClick={() => {
                setEditingEntry(entry);
                setEditForm({
                  teacher_id: entry.teacher?.id || '',
                  room_id: entry.room?.id || ''
                });
                setIsEditOpen(true);
              }}
            >
              Edit
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
          Error loading timetable
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.detail || 'Failed to load timetable data'}
        </p>
        <Button onClick={() => navigate('/timetables')} variant="secondary">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Timetables
        </Button>
      </div>
    );
  }

  if (!timetableData && !isLoading && !error) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
          Timetable not found
        </div>
        <Button onClick={() => navigate('/timetables')} variant="secondary">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Timetables
        </Button>
      </div>
    );
  }
  
  if (!id) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
          No timetable ID provided
        </div>
        <Button onClick={() => navigate('/timetables')} variant="secondary">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Timetables
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/timetables')} 
            variant="secondary"
            size="sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {timetableData.name}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                timetableData.is_published
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {timetableData.is_published ? (
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ClockIcon className="h-3 w-3 mr-1" />
                )}
                {timetableData.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-4">
              <div className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                Class: {timetableData.class?.name || 'N/A'}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Created: {timetableData.created_at ? new Date(timetableData.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="secondary" size="sm">
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Day Selector for mobile */}
      <div className="md:hidden">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Day
        </label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="input-field"
        >
          {weekDays.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Desktop view - Full week */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-full">
              {/* Header row */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="p-3 text-center font-semibold text-gray-900 dark:text-white">
                  Time
                </div>
                {weekDays.map(day => (
                  <div key={day} className="p-3 text-center font-semibold text-gray-900 dark:text-white">
                    {day}
                  </div>
                ))}
              </div>

              {/* Schedule rows */}
              {timeSlots.map(timeSlot => (
                <div key={timeSlot.id} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 text-center">
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {timeSlot.period}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {timeSlot.time}
                    </div>
                  </div>
                  {weekDays.map(day => (
                    <div key={`${day}-${timeSlot.id}`}>
                      {renderScheduleCell(day, timeSlot)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile view - Single day */}
          <div className="md:hidden space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {selectedDay}
            </h3>
            {timeSlots.map(timeSlot => (
              <div key={timeSlot.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {timeSlot.period}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {timeSlot.time}
                    </div>
                  </div>
                </div>
                {renderScheduleCell(selectedDay, timeSlot)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {timetableData.schedule_entries?.length || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <AcademicCapIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(timetableData.schedule_entries?.map(e => e.subject_id)).size || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subjects</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <UserIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(timetableData.schedule_entries?.map(e => e.teacher_id)).size || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Teachers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <BuildingOfficeIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(timetableData.schedule_entries?.map(e => e.room_id)).size || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rooms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Edit Modal */}
      {isEditOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Schedule Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Teacher ID</label>
                <input
                  className="input-field w-full"
                  type="number"
                  value={editForm.teacher_id}
                  onChange={(e) => setEditForm({ ...editForm, teacher_id: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Room ID</label>
                <input
                  className="input-field w-full"
                  type="number"
                  value={editForm.room_id}
                  onChange={(e) => setEditForm({ ...editForm, room_id: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="secondary" size="sm" onClick={() => { setIsEditOpen(false); setEditingEntry(null); }}>Cancel</Button>
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    // Build payload from existing entry
                    const payload = {
                      timetable_id: editingEntry.timetable_id || timetableData.id,
                      day_index: editingEntry.day_index,
                      period_index: editingEntry.period_index,
                      subject_id: editingEntry.subject?.id,
                      teacher_id: editForm.teacher_id,
                      room_id: editForm.room_id,
                      division_id: editingEntry.division?.id || null,
                      batch_id: editingEntry.subject?.type === 'lecture' ? null : (editingEntry.batch?.id || null)
                    };
                    await scheduleEntryService.update(editingEntry.id, payload);
                    // Refresh data
                    setIsEditOpen(false);
                    setEditingEntry(null);
                    // naive reload to refresh query
                    window.location.reload();
                  } catch (e) {
                    console.error(e);
                    alert(e?.detail || 'Failed to update entry');
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableView;
