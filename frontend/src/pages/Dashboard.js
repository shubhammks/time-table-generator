import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GenerateWizard from './GenerateWizard';
import { toast } from 'react-toastify';
import { 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School as SchoolIcon,
  Business as CollegeIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  departmentService, 
  classService, 
  teacherService, 
  subjectService, 
  timetableService
} from '../services/crudService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [mode, setMode] = useState(localStorage.getItem('timetable_mode') || '');
  const [config, setConfig] = useState(JSON.parse(localStorage.getItem('timetable_config') || '{}'));
  const [assignments, setAssignments] = useState(JSON.parse(localStorage.getItem('teacher_assignments') || '{}'));
  
  // Data states
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [scheduleEntries, setScheduleEntries] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState([]);
  
  // Dialog states
  const [viewTTOpen, setViewTTOpen] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    workingDays: 6,
    periodsPerDay: 8,
    periodDuration: 50,
    shortBreakDuration: 10,
    lunchBreakDuration: 50,
    startTime: '09:00',
    endTime: '17:00',
    allowSubjectTwiceInDay: false,
    balanceTeacherWorkload: true,
    minimizeGaps: true,
    ensureSameFloor: true,
    labConsecutivePeriods: true,
    maxDailyHours: 8,
    // Duration settings (hours)
    labDurationHours: 2,
    tutorialDurationHours: 1,
    lectureDurationHours: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, classRes, teacherRes, subjectRes, ttRes] = await Promise.all([
        departmentService.getAll(),
        classService.getAll(),
        teacherService.getAll(),
        subjectService.getAll(),
        timetableService.getAll()
      ]);
      
      setDepartments(deptRes || []);
      setClasses(classRes || []);
      setTeachers(teacherRes || []);
      setSubjects(subjectRes || []);
      
      // Group timetables by class and division
      const groupedTimetables = (ttRes || []).reduce((acc, timetable) => {
        const key = `${timetable.class_id}_${timetable.division_id || 'all'}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(timetable);
        return acc;
      }, {});
      
      setTimetables(groupedTimetables);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    localStorage.setItem('timetable_mode', selectedMode);
    setActiveTab(1); // Move to timetable setup tab
  };

  const handleConfigUpdate = (newConfig) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('timetable_config', JSON.stringify(updatedConfig));
  };

  const handleAssignmentUpdate = (newAssignments) => {
    setAssignments(newAssignments);
    localStorage.setItem('teacher_assignments', JSON.stringify(newAssignments));
  };

  const startGeneration = async () => {
    if (!mode || !config.classId) {
      alert('Please complete mode selection and timetable setup first');
      return;
    }

    setGenerating(true);
    setGenerationLogs([]);
    
    const addLog = (message, type = 'info') => {
      setGenerationLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
    };

    try {
      addLog('🚀 Starting timetable generation process...', 'info');
      addLog('⏱️ This may take up to 30 seconds...', 'info');
      
      // Prepare request data with enhanced subject assignments
      const classSubjects = subjects.filter(subject => subject.class_id === config.classId);
      const subjectAssignments = classSubjects.map(subject => {
        const assignment = assignments[subject.id];
        return {
          subject_id: subject.id,
          teacher_id: assignment?.teacherId,
          subject_type: subject.type,
          subject_name: subject.name,
          hours_per_week: subject.hours_per_week
        };
      }).filter(assignment => assignment.teacher_id); // Only include assigned subjects

      // Validate that all subjects have teachers assigned
      const unassignedSubjects = classSubjects.filter(subject => !assignments[subject.id]?.teacherId);
      if (unassignedSubjects.length > 0) {
        addLog('❌ Validation failed: Some subjects do not have teachers assigned', 'error');
        unassignedSubjects.forEach(subject => {
          addLog(`  - ${subject.name} (${subject.type})`, 'error');
        });
        return;
      }

        const requestData = {
          name: `Timetable - ${classes.find(c => c.id === config.classId)?.name || 'Unknown Class'}`,
          class_id: config.classId,
          department_id: config.departmentId,
          mode: mode,
          user_id: 1, // Assuming coordinator user
          subject_assignments: subjectAssignments,
          options: {
            balance_teacher_workload: settings.balanceTeacherWorkload,
            minimize_gaps: settings.minimizeGaps,
            allow_conflicts: false,
            ensure_same_floor: settings.ensureSameFloor,
            lab_consecutive_periods: settings.labConsecutivePeriods,
            max_daily_hours: settings.maxDailyHours,
            allow_subject_twice_in_day: settings.allowSubjectTwiceInDay,
            handle_subject_combinations: true, // New option for handling lecture+lab/tutorial
            // Duration settings
            lab_duration_hours: settings.labDurationHours,
            tutorial_duration_hours: settings.tutorialDurationHours,
            lecture_duration_hours: settings.lectureDurationHours,
          }
        };

      addLog('📋 Request data prepared', 'info');
      addLog(`Mode: ${mode}, Class ID: ${config.classId}`, 'info');
      addLog(`Subject assignments: ${subjectAssignments.length} subjects assigned`, 'info');
      
      // Log subject combinations
      const subjectGroups = {};
      classSubjects.forEach(subject => {
        const baseName = subject.name.replace(/\s+(Lab|Tutorial)$/i, '');
        if (!subjectGroups[baseName]) {
          subjectGroups[baseName] = [];
        }
        subjectGroups[baseName].push(subject);
      });
      
      Object.entries(subjectGroups).forEach(([baseName, subjectList]) => {
        if (subjectList.length > 1) {
          addLog(`📚 ${baseName}: ${subjectList.map(s => s.type).join(' + ')}`, 'info');
        }
      });
      
      // Call generation API
      addLog('🔄 Calling timetable generation API...', 'info');
      
      // Add timeout to the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Generation timeout - please try again')), 35000); // 35 seconds
      });
      
      const response = await Promise.race([
        timetableService.generateTimetable(requestData),
        timeoutPromise
      ]);
      
      if (response.success) {
        addLog('✅ Timetable generated successfully!', 'success');
        addLog(`Timetable ID: ${response.timetable_id}`, 'success');
        await loadData(); // Refresh data
      } else {
        addLog('❌ Generation failed: ' + response.message, 'error');
        if (response.diagnostics) {
          response.diagnostics.forEach(diag => {
            addLog(`  - ${diag.message}`, 'error');
          });
        }
      }
    } catch (error) {
      addLog('❌ Generation failed: ' + error.message, 'error');
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleViewTimetable = async (timetable) => {
    setSelectedTimetable(timetable);
      setLoading(true);
    try {
      const data = await timetableService.getWithSchedule(timetable.id);
      setScheduleEntries(data.schedule_entries || []);
      setViewTTOpen(true);
    } catch (error) {
      console.error('Error loading timetable:', error);
      toast.error('Failed to load timetable details');
    } finally {
      setLoading(false);
    }
  };

  const exportTimetable = (timetable) => {
    // Simple CSV export
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Day,Period,Subject,Teacher,Room,Division\n" +
      scheduleEntries.map(entry => 
        `${entry.day || 'N/A'},${entry.period || 'N/A'},${entry.subject_name || 'N/A'},${entry.teacher_name || 'N/A'},${entry.room_number || 'N/A'},${entry.division_name || 'N/A'}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timetable_${timetable.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteTimetable = async (timetableId) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      try {
        await timetableService.delete(timetableId);
        await loadData();
      } catch (error) {
        console.error('Error deleting timetable:', error);
      }
    }
  };

  const renderModeSelection = () => (
    <Card>
      <CardHeader title="Select Timetable Mode" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                border: mode === 'school' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                '&:hover': { border: '2px solid #1976d2' }
              }}
              onClick={() => handleModeSelection('school')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <SchoolIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                <Typography variant="h5" gutterBottom>School Mode</Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate timetables for school classes with fixed classrooms and subject-based scheduling.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                border: mode === 'college' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                '&:hover': { border: '2px solid #1976d2' }
              }}
              onClick={() => handleModeSelection('college')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CollegeIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                <Typography variant="h5" gutterBottom>College Mode</Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate timetables for college departments with flexible room allocation and lab scheduling.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {mode && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Selected mode: <strong>{mode.charAt(0).toUpperCase() + mode.slice(1)}</strong>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderTimetableSetup = () => {
    // Filter subjects by selected class
    const classSubjects = subjects.filter(subject => subject.class_id === config.classId);
    
    // Group subjects by base name (for lecture + lab/tutorial combinations)
    const subjectGroups = {};
    classSubjects.forEach(subject => {
      const baseName = subject.name.replace(/\s+(Lab|Tutorial)$/i, '');
      if (!subjectGroups[baseName]) {
        subjectGroups[baseName] = [];
      }
      subjectGroups[baseName].push(subject);
    });

  return (
      <Card>
        <CardHeader title="Timetable Setup" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={config.departmentId || ''}
                  onChange={(e) => handleConfigUpdate({ departmentId: e.target.value })}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={config.classId || ''}
                  onChange={(e) => {
                    handleConfigUpdate({ classId: e.target.value });
                    // Clear assignments when class changes
                    setAssignments({});
                  }}
                >
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {config.classId && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Teacher-Subject Assignments for {classes.find(c => c.id === config.classId)?.name}
                </Typography>
                
                {Object.entries(subjectGroups).map(([baseName, subjectList]) => {
                  const assignedCount = subjectList.filter(subject => assignments[subject.id]?.teacherId).length;
                  const totalCount = subjectList.length;
                  const isFullyAssigned = assignedCount === totalCount;
                  
          return (
                    <Box key={baseName} sx={{ 
                      mb: 3, 
                      p: 2, 
                      border: `1px solid ${isFullyAssigned ? '#4caf50' : '#e0e0e0'}`, 
                      borderRadius: 1,
                      backgroundColor: isFullyAssigned ? '#f1f8e9' : 'transparent'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          {baseName}
                        </Typography>
                        <Chip 
                          label={`${assignedCount}/${totalCount} assigned`}
                          color={isFullyAssigned ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    
                    {subjectList.map(subject => (
                      <Box key={subject.id} sx={{ mb: 2, ml: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {subject.name}
                              <Chip 
                                label={subject.type} 
                                size="small" 
                                color={subject.type === 'lecture' ? 'primary' : 
                                       subject.type === 'lab' ? 'secondary' : 'default'}
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Teacher</InputLabel>
                              <Select
                                value={assignments[subject.id]?.teacherId || ''}
                                onChange={(e) => handleAssignmentUpdate({
                                  ...assignments,
                                  [subject.id]: { 
                                    ...assignments[subject.id], 
                                    teacherId: e.target.value,
                                    subjectType: subject.type,
                                    subjectName: subject.name
                                  }
                                })}
                              >
                                {teachers.map(teacher => (
                                  <MenuItem key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              {subject.hours_per_week} hours/week
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    
                      {/* Show combination info */}
                      {subjectList.length > 1 && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          This subject has {subjectList.length} components: {subjectList.map(s => s.type).join(' + ')}
                        </Alert>
                      )}
                    </Box>
          );
        })}
                
                {Object.keys(subjectGroups).length === 0 && config.classId && (
                  <Alert severity="warning">
                    No subjects found for the selected class. Please add subjects first.
                  </Alert>
                )}
                
                {/* Assignment Summary */}
                {Object.keys(subjectGroups).length > 0 && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>Assignment Summary</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">
                          <strong>Total Subjects:</strong> {classSubjects.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">
                          <strong>Assigned:</strong> {classSubjects.filter(s => assignments[s.id]?.teacherId).length}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">
                          <strong>Remaining:</strong> {classSubjects.filter(s => !assignments[s.id]?.teacherId).length}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={startGeneration}
                disabled={generating || !mode || !config.classId || Object.keys(subjectGroups).length === 0}
                startIcon={generating ? <CircularProgress size={20} /> : <AddIcon />}
                fullWidth
              >
                {generating ? 'Generating...' : 'Generate Timetable'}
              </Button>
            </Grid>
          </Grid>
        
        {generationLogs.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Generation Logs</Typography>
            <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
              {generationLogs.map((log, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ 
                    color: log.type === 'error' ? 'error.main' : 
                          log.type === 'success' ? 'success.main' : 'text.primary',
                    fontFamily: 'monospace'
                  }}
                >
                  {log.timestamp} {log.message}
                </Typography>
              ))}
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
    );
  };

  const renderSettings = () => (
    <Card>
      <CardHeader 
        title="Settings" 
        action={
          <IconButton>
            <SettingsIcon />
          </IconButton>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Working Days"
              type="number"
              value={settings.workingDays}
              onChange={(e) => setSettings({...settings, workingDays: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Periods per Day"
              type="number"
              value={settings.periodsPerDay}
              onChange={(e) => setSettings({...settings, periodsPerDay: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Period Duration (minutes)"
              type="number"
              value={settings.periodDuration}
              onChange={(e) => setSettings({...settings, periodDuration: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={settings.startTime}
              onChange={(e) => setSettings({...settings, startTime: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowSubjectTwiceInDay}
                  onChange={(e) => setSettings({...settings, allowSubjectTwiceInDay: e.target.checked})}
                />
              }
              label="Allow subject twice in a day"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.balanceTeacherWorkload}
                  onChange={(e) => setSettings({...settings, balanceTeacherWorkload: e.target.checked})}
                />
              }
              label="Balance teacher workload"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.minimizeGaps}
                  onChange={(e) => setSettings({...settings, minimizeGaps: e.target.checked})}
                />
              }
              label="Minimize gaps between classes"
            />
          </Grid>
          
          {/* Duration Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Duration Settings (Hours)
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Lab Duration (hours)"
              type="number"
              value={settings.labDurationHours}
              onChange={(e) => setSettings({...settings, labDurationHours: parseInt(e.target.value)})}
              inputProps={{ min: 1, max: 4 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Tutorial Duration (hours)"
              type="number"
              value={settings.tutorialDurationHours}
              onChange={(e) => setSettings({...settings, tutorialDurationHours: parseInt(e.target.value)})}
              inputProps={{ min: 1, max: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Lecture Duration (hours)"
              type="number"
              value={settings.lectureDurationHours}
              onChange={(e) => setSettings({...settings, lectureDurationHours: parseInt(e.target.value)})}
              inputProps={{ min: 1, max: 2 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderViewTimetables = () => {
    // Flatten grouped timetables for display
    const allTimetables = Array.isArray(timetables) ? timetables : Object.values(timetables).flat();
    
    return (
      <Card>
        <CardHeader 
          title="View Timetables" 
          action={
            <Button startIcon={<RefreshIcon />} onClick={loadData}>
              Refresh
            </Button>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Division</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allTimetables.map(timetable => (
                  <TableRow key={timetable.id}>
                    <TableCell>{timetable.name}</TableCell>
                    <TableCell>
                      {classes.find(c => c.id === timetable.class_id)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {timetable.division?.name || 'All Divisions'}
                    </TableCell>
                    <TableCell>
                      {new Date(timetable.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={timetable.is_published ? 'Published' : 'Draft'} 
                        color={timetable.is_published ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Timetable">
                        <IconButton onClick={() => handleViewTimetable(timetable)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export CSV">
                        <IconButton onClick={() => exportTimetable(timetable)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => deleteTimetable(timetable.id)}>
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
    );
  };

  const renderTimetableViewDialog = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = [
      { id: 1, time: '09:00 - 09:45', period: '1st Period' },
      { id: 2, time: '09:45 - 10:30', period: '2nd Period' },
      { id: 3, time: '10:30 - 10:45', period: 'Break' },
      { id: 4, time: '10:45 - 11:30', period: '3rd Period' },
      { id: 5, time: '11:30 - 12:15', period: '4th Period' },
      { id: 6, time: '12:15 - 13:00', period: '5th Period' },
      { id: 7, time: '13:00 - 13:45', period: 'Lunch' },
      { id: 8, time: '13:45 - 14:30', period: '6th Period' },
      { id: 9, time: '14:30 - 15:15', period: '7th Period' },
      { id: 10, time: '15:15 - 16:00', period: '8th Period' }
    ];

    // Helper function to get schedule entries for a specific day and period (multiple entries possible)
    const getScheduleEntries = (day, periodId) => {
      if (!scheduleEntries) return [];
      const dayIndex = days.indexOf(day);
      return scheduleEntries.filter(entry => 
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
                    👥 {entry.division_name ? `Div ${entry.division_name}` : 'Batch'} {entry.batch_number ? `- Batch ${entry.batch_number}` : ''}
                  </Typography>
                  
                  {/* Teacher Name - with icon */}
                  <Typography variant="caption" sx={{ 
                    color: '#424242',
                    fontSize: '0.65rem',
                    display: 'block'
                  }}>
                    👨‍🏫 {entry.teacher_name || 'Teacher'}
                  </Typography>
                </Box>
          );
        })}
          </Box>
        </TableCell>
      );
    };

    return (
      <Dialog open={viewTTOpen} onClose={() => setViewTTOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Timetable: {selectedTimetable?.name}
          <IconButton
            onClick={() => setViewTTOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => exportTimetable(selectedTimetable)} startIcon={<DownloadIcon />}>
            Export CSV
          </Button>
          <Button onClick={() => setViewTTOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Timetable Wizard
      </Typography>
      <GenerateWizard />
    </Box>
  );
};

export default Dashboard;
