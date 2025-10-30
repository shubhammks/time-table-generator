import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { departmentService, teacherService, classService, divisionService, subjectService, roomService, timetableService } from '../services/crudService';

const GenerateWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('school'); // school | college
  const [timeConfig, setTimeConfig] = useState({
    workingDays: 6,
    periodsPerDay: 8,
    startTime: '09:00',
    lectureMinutes: 60,
    labMinutes: 120,
  });

  // For immediate generation
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [generating, setGenerating] = useState(false);

  // School allocation using existing data
  const [schoolClass, setSchoolClass] = useState({ id: '', divisions: 1 });
  const [existingTeachers, setExistingTeachers] = useState([]);
  const [existingSubjects, setExistingSubjects] = useState([]);
  const [schoolAssignments, setSchoolAssignments] = useState({}); // subjectId -> { [divIndex]: teacherId }
  // College allocation using existing data
  const [collegeYear, setCollegeYear] = useState({ id: '', divisions: 1 });
  const [collegeAssignments, setCollegeAssignments] = useState({}); // subjectId -> { [divIndex]: teacherId }

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => Math.max(1, s - 1));

const saveTimeSettings = async () => {
    try {
      // Persist time settings to backend
      const payload = {
        working_days: timeConfig.workingDays,
        periods_per_day: timeConfig.periodsPerDay,
        start_time: timeConfig.startTime,
        lecture_minutes: timeConfig.lectureMinutes,
        lab_minutes: timeConfig.labMinutes,
      };
      await api.post('/time-config', payload);
      next();
    } catch (e) {
      toast.error('Failed to save time settings');
    }
  };

  // Load departments/classes for generation
  React.useEffect(() => {
    (async () => {
      try {
        const depts = await departmentService.getAll();
        setDepartments(depts || []);
        const cls = await classService.getAll();
        setClasses(cls || []);
        const teachers = await teacherService.getAll();
        setExistingTeachers(teachers || []);
      } catch {}
    })();
  }, []);

  // Load subjects and divisions when class/year changes
  React.useEffect(() => {
    (async () => {
      try {
        if (schoolClass.id) {
          const subs = await subjectService.getAll({ class_id: schoolClass.id });
          setExistingSubjects(subs || []);
          const selectedCls = classes.find(c => c.id === Number(schoolClass.id));
          if (selectedCls) setSchoolClass(prev => ({ ...prev, divisions: selectedCls.number_of_divisions || prev.divisions }));
        }
        if (collegeYear.id) {
          const subs = await subjectService.getAll({ class_id: collegeYear.id });
          setExistingSubjects(subs || []);
          const selectedCls = classes.find(c => c.id === Number(collegeYear.id));
          if (selectedCls) setCollegeYear(prev => ({ ...prev, divisions: selectedCls.number_of_divisions || prev.divisions }));
        }
      } catch {}
    })();
  }, [schoolClass.id, collegeYear.id, classes]);

  const generateFromSaved = async () => {
    try {
      setGenerating(true);
      const classId = mode === 'school' ? Number(schoolClass.id) : Number(collegeYear.id);
      if (!classId) {
        toast.error('Select class/year before generating');
        setGenerating(false);
        return;
      }
      const cls = classes.find(c => c.id === classId);
      const deptId = cls?.department_id || departments?.[0]?.id;
      if (!deptId) {
        toast.error('No department found');
        setGenerating(false);
        return;
      }
      const requestData = {
        name: `Timetable - ${cls?.name || 'Class'}`,
        class_id: classId,
        department_id: deptId,
        mode,
        subject_assignments: [],
        options: {
          lab_consecutive_periods: true,
          allow_subject_twice_in_day: false
        }
      };
      const res = await timetableService.generateTimetable(requestData);
      if (res?.success) {
        toast.success('Timetable generated');
      } else {
        toast.error(res?.message || 'Generation failed');
      }
    } catch (e) {
      toast.error(e?.detail || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const startGeneration = async () => {
    try {
      // Use first department
      const departments = await departmentService.getAll();
      const departmentId = departments?.[0]?.id;
      if (!departmentId) {
        toast.error('Create a department first in Departments page');
        return;
      }

      if (mode === 'school') {
        if (!schoolClass.id) { toast.error('Select class'); return; }
        // Validate assignments
        const missing = [];
        for (const subject of existingSubjects) {
          const perDiv = schoolAssignments[subject.id] || {};
          for (let i = 0; i < (schoolClass.divisions || 1); i++) {
            if (!perDiv[i]) missing.push(`${subject.name} (Div ${i + 1})`);
          }
        }
        if (missing.length) {
          toast.error(`Assign teachers for: ${missing.slice(0,3).join(', ')}${missing.length>3?'...':''}`);
          return;
        }
        const divs = await divisionService.getAll({ class_id: schoolClass.id });
        for (const subject of existingSubjects) {
          const perDiv = schoolAssignments[subject.id] || {};
          for (let i = 0; i < (schoolClass.divisions || 1); i++) {
            const teacherId = perDiv[i];
            if (divs[i] && teacherId) {
              try {
                // Check if any assignment already exists for subject+division
                const existing = await api.get('/subject-teachers', { params: { subject_id: subject.id, division_id: divs[i].id } });
                const exists = Array.isArray(existing.data) && existing.data.length > 0;
                if (!exists) {
                  await api.post('/subject-teachers', { subject_id: subject.id, teacher_id: teacherId, division_id: divs[i].id });
                }
              } catch (ignore) {
                // On error (e.g., duplicate), continue
              }
            }
          }
        }
      } else {
        if (!collegeYear.id) { toast.error('Select year'); return; }
        const missing = [];
        for (const subject of existingSubjects) {
          const perDiv = collegeAssignments[subject.id] || {};
          for (let i = 0; i < (collegeYear.divisions || 1); i++) {
            if (!perDiv[i]) missing.push(`${subject.name} (Div ${i + 1})`);
          }
        }
        if (missing.length) {
          toast.error(`Assign teachers for: ${missing.slice(0,3).join(', ')}${missing.length>3?'...':''}`);
          return;
        }
        const divs = await divisionService.getAll({ class_id: collegeYear.id });
        for (const subject of existingSubjects) {
          const perDiv = collegeAssignments[subject.id] || {};
          for (let i = 0; i < (collegeYear.divisions || 1); i++) {
            const teacherId = perDiv[i];
            if (divs[i] && teacherId) {
              try {
                const existing = await api.get('/subject-teachers', { params: { subject_id: subject.id, division_id: divs[i].id } });
                const exists = Array.isArray(existing.data) && existing.data.length > 0;
                if (!exists) {
                  await api.post('/subject-teachers', { subject_id: subject.id, teacher_id: teacherId, division_id: divs[i].id });
                }
              } catch (ignore) {
                // ignore duplicates
              }
            }
          }
        }
      }
      // After saving allocations, generate using saved selections
      await generateFromSaved();
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Setup failed';
      toast.error(msg);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Generate Timetable</h1>

      <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 1: Select Mode</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input type="radio" name="mode" checked={mode === 'school'} onChange={() => setMode('school')} />
                <span>School</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="mode" checked={mode === 'college'} onChange={() => setMode('college')} />
                <span>College</span>
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="btn-primary" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 2: Time Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Working Days (per week)</label>
                <input className="input-field w-full" type="number" min={5} max={6}
                       value={timeConfig.workingDays}
                       onChange={e => setTimeConfig({ ...timeConfig, workingDays: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm mb-1">Periods Per Day</label>
                <input className="input-field w-full" type="number" min={6} max={10}
                       value={timeConfig.periodsPerDay}
                       onChange={e => setTimeConfig({ ...timeConfig, periodsPerDay: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm mb-1">Start Time</label>
                <input className="input-field w-full" type="time"
                       value={timeConfig.startTime}
                       onChange={e => setTimeConfig({ ...timeConfig, startTime: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-1">Lecture/Tutorial Minutes</label>
                <input className="input-field w-full" type="number" min={45} max={90}
                       value={timeConfig.lectureMinutes}
                       onChange={e => setTimeConfig({ ...timeConfig, lectureMinutes: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm mb-1">Lab Minutes</label>
                <input className="input-field w-full" type="number" min={90} max={180}
                       value={timeConfig.labMinutes}
                       onChange={e => setTimeConfig({ ...timeConfig, labMinutes: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={prev}>Back</button>
              <button className="btn-primary" onClick={saveTimeSettings}>Save & Next</button>
            </div>
          </div>
        )}

        {step === 3 && mode === 'school' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 3: School Setup</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Class</label>
                <select className="input-field w-full" value={schoolClass.id} onChange={e => setSchoolClass({ ...schoolClass, id: e.target.value })}>
                  <option value="">Select Class</option>
                  {classes.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Divisions</label>
                <input className="input-field w-full" type="number" min={1} value={schoolClass.divisions} onChange={e => setSchoolClass({ ...schoolClass, divisions: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Allocate Teachers to Existing Subjects (per division)</h3>
              {existingSubjects.map((s, sidx) => (
                <div key={sidx} className="p-2 border rounded">
                  <div className="grid grid-cols-4 gap-2">
                    <input className="input-field" value={s.name} readOnly />
                    <input className="input-field" value={s.type} readOnly />
                    <input className="input-field" value={s.hours_per_week} readOnly />
                    <div/>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {Array.from({ length: schoolClass.divisions || 1 }).map((_, divIdx) => (
                      <select key={divIdx} className="input-field" value={(schoolAssignments[s.id]||{})[divIdx] || ''} onChange={e => {
                        setSchoolAssignments(prev => ({ ...prev, [s.id]: { ...(prev[s.id]||{}), [divIdx]: Number(e.target.value) } }));
                      }}>
                        <option value="">Teacher for Div {divIdx + 1}</option>
                        {existingTeachers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={prev}>Back</button>
              <button className="btn-primary" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && mode === 'college' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 3: College Setup</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Year</label>
                <select className="input-field w-full" value={collegeYear.id} onChange={e => setCollegeYear({ ...collegeYear, id: e.target.value })}>
                  <option value="">Select Year</option>
                  {classes.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Divisions</label>
                <input className="input-field w-full" type="number" min={1} value={collegeYear.divisions} onChange={e => setCollegeYear({ ...collegeYear, divisions: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Allocate Teachers to Existing Subjects (per division)</h3>
              {existingSubjects.map((s, sidx) => (
                <div key={sidx} className="p-2 border rounded">
                  <div className="grid grid-cols-4 gap-2">
                    <input className="input-field" value={s.name} readOnly />
                    <input className="input-field" value={s.type} readOnly />
                    <input className="input-field" value={s.hours_per_week} readOnly />
                    <div/>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {Array.from({ length: collegeYear.divisions || 1 }).map((_, divIdx) => (
                      <select key={divIdx} className="input-field" value={(collegeAssignments[s.id]||{})[divIdx] || ''} onChange={e => {
                        setCollegeAssignments(prev => ({ ...prev, [s.id]: { ...(prev[s.id]||{}), [divIdx]: Number(e.target.value) } }));
                      }}>
                        <option value="">Teacher for Div {divIdx + 1}</option>
                        {existingTeachers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={prev}>Back</button>
              <button className="btn-primary" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 4: Generate</h2>
            <p className="text-sm text-gray-600">Proceed to generate the timetable using saved selections from Steps 1-3.</p>
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={prev}>Back</button>
              <button className="btn-primary" onClick={startGeneration} disabled={generating}>{generating ? 'Generating...' : 'Generate Timetable'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateWizard;
