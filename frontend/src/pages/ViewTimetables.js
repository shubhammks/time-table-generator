import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timetableService, scheduleEntryService } from '../services/crudService';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const ViewTimetables = () => {
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAdmin, isTeacher } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({ teacher_id: '', room_id: '' });

  // Fetch timetables
  const { data: timetables, isLoading, error, refetch } = useQuery({
    queryKey: ['timetables'],
    queryFn: () => timetableService.getAll(),
    refetchOnWindowFocus: false,
  });

  const handleViewTimetable = async (timetable) => {
    setSelectedTimetable(timetable);
    setLoading(true);
    try {
      const data = await timetableService.getWithSchedule(timetable.id);
      setTimetableData(data);
      setViewDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load timetable details');
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTimetable = (timetable) => {
    if (!timetableData?.schedule_entries) return;
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Day,Period,Subject,Teacher,Room,Division\n" +
      timetableData.schedule_entries.map(entry => 
        `${entry.day || 'N/A'},${entry.period || 'N/A'},${entry.subject_name || 'N/A'},${entry.teacher_name || 'N/A'},${entry.room_number || 'N/A'},${entry.division_name || 'N/A'}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timetable_${timetable.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Timetable exported successfully');
  };

  const deleteTimetable = async (timetableId) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) return;
    
    try {
      await timetableService.delete(timetableId);
      toast.success('Timetable deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete timetable');
      console.error('Error deleting timetable:', error);
    }
  };

  const renderTimetableView = () => {
    if (!timetableData) return null;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = [
      { id: 0, time: '09:00 - 10:00', period: '1st Period' },
      { id: 1, time: '10:00 - 11:00', period: '2nd Period' },
      { id: 2, time: '11:00 - 12:00', period: '3rd Period' },
      { id: 3, time: '12:00 - 13:00', period: '4th Period' },
      { id: 4, time: '13:00 - 14:00', period: 'Lunch' },
      { id: 5, time: '14:00 - 15:00', period: '5th Period' },
      { id: 6, time: '15:00 - 16:00', period: '6th Period' },
      { id: 7, time: '16:00 - 17:00', period: '7th Period' }
    ];

        // Helper function to get schedule entries for a specific day and period (multiple entries possible)
        const getScheduleEntries = (day, periodId) => {
          if (!timetableData.schedule_entries) return [];
          const dayIndex = days.indexOf(day);
          return timetableData.schedule_entries.filter(entry => 
            entry.day_index === dayIndex && entry.period_index === periodId
          );
        };

        // Helper function to render a schedule cell
        const renderScheduleCell = (day, timeSlot) => {
          if (timeSlot.period === 'Break' || timeSlot.period === 'Lunch') {
            return (
              <TableCell 
                sx={{ 
                  backgroundColor: '#f5f5f5', 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#666'
                }}
              >
                {timeSlot.period}
              </TableCell>
            );
          }

          const entries = getScheduleEntries(day, timeSlot.id);
          
          if (!entries || entries.length === 0) {
            return (
              <TableCell 
                sx={{ 
                  backgroundColor: '#fafafa',
                  textAlign: 'center',
                  color: '#999',
                  fontStyle: 'italic'
                }}
              >
                Free
              </TableCell>
            );
          }

          return (
            <TableCell 
              sx={{ 
                backgroundColor: '#fff3e0',
                border: '1px solid #bbdefb',
                minWidth: 120,
                maxWidth: 120,
                verticalAlign: 'top'
              }}
            >
              <Box sx={{ p: 0.5 }}>
                {entries.map((entry, index) => {
                  // Check if this is a lab/tutorial with batch information
                  const isLabTutorial = entry.subject_name && (
                    entry.subject_name.includes('Lab') || 
                    entry.subject_name.includes('Tutorial') ||
                    entry.subject_name.includes('Batch')
                  );

                  return (
                    <Box key={index} sx={{ 
                      mb: index < entries.length - 1 ? 1 : 0,
                      p: 0.5,
                      backgroundColor: isLabTutorial ? '#fff8e1' : '#e3f2fd',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}>
                      {/* Subject Name - Bold and prominent */}
                      <Typography variant="caption" sx={{ 
                        fontWeight: 'bold', 
                        color: isLabTutorial ? '#f57c00' : '#1976d2',
                        fontSize: '0.7rem',
                        display: 'block',
                        mb: 0.5
                      }}>
                        {entry.subject_name || 'Subject'}
                      </Typography>
                      
                      {/* Room Number - with icon */}
                      <Typography variant="caption" sx={{ 
                        color: '#666',
                        fontSize: '0.65rem',
                        display: 'block',
                        mb: 0.5
                      }}>
                        🏢 {entry.room_number || 'Room'}
                      </Typography>
                      
                      {/* Batch/Division - with icon */}
                      <Typography variant="caption" sx={{ 
                        color: '#424242',
                        fontSize: '0.65rem',
                        display: 'block',
                        mb: 0.5
                      }}>
                        {(() => {
                          const type = entry.subject?.type || 'lecture';
                          const divisionLabel = entry.division_name ? `Div ${entry.division_name}` : '';
                          const batchLabel = entry.batch_number ? ` - Batch ${entry.batch_number}` : '';
                          return `👥 ${type === 'lecture' ? divisionLabel : divisionLabel + batchLabel}`;
                        })()}
                      </Typography>
                      
                      {/* Teacher Name - with icon */}
                      <Typography variant="caption" sx={{ 
                        color: '#424242',
                        fontSize: '0.65rem',
                        display: 'block'
                      }}>
                        👨‍🏫 {entry.teacher_name || 'Teacher'}
                      </Typography>

                      {(isAdmin() || isTeacher()) && (
                        <Box sx={{ textAlign: 'right', mt: 0.5 }}>
                          <Button 
                            size="small"
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
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </TableCell>
          );
        };

        return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {timetableData.name}
        </Typography>
        
        <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#1976d2', 
                    color: 'white', 
                    fontWeight: 'bold',
                    minWidth: 100,
                    position: 'sticky',
                    left: 0,
                    zIndex: 2
                  }}
                >
                  Time
                </TableCell>
                {days.map(day => (
                  <TableCell 
                    key={day}
                    sx={{ 
                      backgroundColor: '#1976d2', 
                      color: 'white', 
                      fontWeight: 'bold',
                      textAlign: 'center',
                      minWidth: 120
                    }}
                  >
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSlots.map(timeSlot => (
                <TableRow key={timeSlot.id}>
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      minWidth: 100
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {timeSlot.time}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {timeSlot.period}
                      </Typography>
                    </Box>
                  </TableCell>
                  {days.map(day => (
                    <React.Fragment key={`${timeSlot.id}-${day}`}>
                      {renderScheduleCell(day, timeSlot)}
                    </React.Fragment>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {(!timetableData.schedule_entries || timetableData.schedule_entries.length === 0) && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No schedule entries found for this timetable. The timetable may not have been generated properly.
          </Alert>
        )}
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load timetables: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
            View Timetables
        </Typography>
          <Button 
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          >
          Refresh
          </Button>
      </Box>

      {(!timetables || timetables.length === 0) ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Timetables Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate your first timetable from the Dashboard to view it here.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Generated Timetables" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timetables.map((timetable) => (
                    <TableRow key={timetable.id}>
                      <TableCell>{timetable.name}</TableCell>
                      <TableCell>
                        {timetable.class?.name || 'Unknown Class'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={timetable.is_published ? 'Published' : 'Draft'}
                          color={timetable.is_published ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(timetable.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Timetable">
                          <IconButton
                            onClick={() => handleViewTimetable(timetable)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Export CSV">
                          <IconButton
                            onClick={() => exportTimetable(timetable)}
                            color="secondary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Timetable">
                          <IconButton
                            onClick={() => deleteTimetable(timetable.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* View Timetable Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedTimetable?.name}
          {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </DialogTitle>
        <DialogContent>
          {renderTimetableView()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
                          </Button>
          {selectedTimetable && (
                <Button 
              onClick={() => exportTimetable(selectedTimetable)}
              startIcon={<DownloadIcon />}
              variant="contained"
                >
              Export CSV
                </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      {isEditOpen && editingEntry && (
        <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Schedule Entry</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Teacher ID</Typography>
              <input
                className="input-field"
                type="number"
                value={editForm.teacher_id}
                onChange={(e) => setEditForm({ ...editForm, teacher_id: Number(e.target.value) })}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Room ID</Typography>
              <input
                className="input-field"
                type="number"
                value={editForm.room_id}
                onChange={(e) => setEditForm({ ...editForm, room_id: Number(e.target.value) })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setIsEditOpen(false); setEditingEntry(null); }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  const payload = {
                    timetable_id: editingEntry.timetable_id || selectedTimetable?.id || timetableData?.id,
                    day_index: editingEntry.day_index,
                    period_index: editingEntry.period_index,
                    subject_id: editingEntry.subject?.id,
                    teacher_id: editForm.teacher_id,
                    room_id: editForm.room_id,
                    division_id: editingEntry.division?.id || null,
                    batch_id: (editingEntry.subject?.type === 'lecture') ? null : (editingEntry.batch?.id || null)
                  };
                  await scheduleEntryService.update(editingEntry.id, payload);
                  toast.success('Entry updated');
                  setIsEditOpen(false);
                  setEditingEntry(null);
                  // Refresh the current timetable view
                  if (selectedTimetable) {
                    const data = await timetableService.getWithSchedule(selectedTimetable.id);
                    setTimetableData(data);
                  }
                } catch (e) {
                  console.error(e);
                  toast.error(e?.detail || 'Failed to update entry');
                }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ViewTimetables;
