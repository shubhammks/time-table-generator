import React, { useEffect, useMemo, useState } from 'react';
import { timetableService, dataService } from '../services/timetableService';
import { toast } from 'react-toastify';

export default function EditTimetable() {
  const [timetables, setTimetables] = useState([]);
  const [ttId, setTtId] = useState('');
  const [grid, setGrid] = useState(null);
  const [days, setDays] = useState([]);
  const [periods, setPeriods] = useState([]);

  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [form, setForm] = useState({ day_index: 0, period_index: 0, division_id: null, subject_id: null, teacher_id: null, room_id: null, span: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [tts] = await Promise.all([
          timetableService.list(),
        ]);
        setTimetables(tts);
      } catch (e) {
        toast.error('Failed to load timetables');
      }
    })();
  }, []);

  const loadMeta = async (classId, departmentId) => {
    const [divs, subs, teach, rms] = await Promise.all([
      dataService.getDivisions({ class_id: classId }),
      dataService.getSubjects({ class_id: classId }),
      dataService.getTeachers({ department_id: departmentId }),
      dataService.getRooms({ department_id: departmentId }),
    ]);
    setDivisions(divs);
    setSubjects(subs);
    setTeachers(teach);
    setRooms(rms);
  };

  const loadGrid = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const g = await timetableService.grid(id);
      setGrid(g.grid);
      setDays(g.days);
      const p = Object.keys(g.grid[g.days[0]] || {}).map(k => Number(k)).sort((a,b)=>a-b);
      setPeriods(p);
    } catch (e) {
      toast.error('Failed to load grid');
    } finally {
      setLoading(false);
    }
  };

  const selectedTt = useMemo(() => timetables.find(t => t.id === Number(ttId)), [timetables, ttId]);

  useEffect(() => {
    if (selectedTt) {
      loadGrid(selectedTt.id);
      loadMeta(selectedTt.class_id, selectedTt.department_id);
    }
  }, [selectedTt]);

  const onPickCell = (dIdx, pIdx) => {
    setForm(f => ({ ...f, day_index: dIdx, period_index: pIdx }));
  };

  const save = async () => {
    if (!ttId) return;
    try {
      await timetableService.editSlot(ttId, form);
      toast.success('Saved');
      loadGrid(ttId);
    } catch (e) {
      toast.error(e?.detail || 'Save failed');
    }
  };

  const clear = async () => {
    if (!ttId) return;
    try {
      await timetableService.editSlot(ttId, { day_index: form.day_index, period_index: form.period_index, division_id: form.division_id, subject_id: null, span: form.span });
      toast.success('Cleared');
      loadGrid(ttId);
    } catch (e) {
      toast.error(e?.detail || 'Clear failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Timetable</h1>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm">Timetable</label>
          <select className="border rounded px-2 py-1" value={ttId} onChange={e => setTtId(Number(e.target.value))}>
            <option value="">Select</option>
            {timetables.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        {selectedTt && (
          <div className="text-sm text-gray-600">Class: {selectedTt.class_name} {selectedTt.division_name ? `- ${selectedTt.division_name}` : ''}</div>
        )}
      </div>

      {grid && (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 border">Time</th>
                {days.map(d => (
                  <th key={d} className="p-2 border">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(p => (
                <tr key={p}>
                  <td className="p-2 border">{p+1}th Period</td>
                  {days.map((d, di) => {
                    const cell = grid[d]?.[String(p)] || {};
                    const s = cell.subject?.name || '-';
                    const r = cell.room?.room_number || '-';
                    const t = cell.teacher?.name || '-';
                    return (
                      <td key={d+"-"+p} className={`p-2 border cursor-pointer hover:bg-yellow-50`} onClick={() => onPickCell(di, p)}>
                        <div className="font-medium">{s}</div>
                        <div className="text-xs text-gray-500">{t} • {r}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTt && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-sm">Division</label>
            <select className="border rounded px-2 py-1" value={form.division_id || ''} onChange={e => setForm(f=>({...f, division_id: Number(e.target.value)}))}>
              <option value="">Select</option>
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Subject</label>
            <select className="border rounded px-2 py-1" value={form.subject_id || ''} onChange={e => setForm(f=>({...f, subject_id: Number(e.target.value)}))}>
              <option value="">Select</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Teacher</label>
            <select className="border rounded px-2 py-1" value={form.teacher_id || ''} onChange={e => setForm(f=>({...f, teacher_id: Number(e.target.value)}))}>
              <option value="">Select</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Room</label>
            <select className="border rounded px-2 py-1" value={form.room_id || ''} onChange={e => setForm(f=>({...f, room_id: Number(e.target.value)}))}>
              <option value="">Select</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.room_number} ({r.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Span</label>
            <select className="border rounded px-2 py-1" value={form.span} onChange={e => setForm(f=>({...f, span: Number(e.target.value)}))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>
          <div className="md:col-span-6 flex gap-2">
            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={save}>Save Slot</button>
            <button className="px-3 py-2 bg-gray-200 rounded" onClick={clear}>Clear Slot</button>
            <div className="text-sm text-gray-600 ml-3">Editing: Day {form.day_index+1}, Period {form.period_index+1}</div>
          </div>
        </div>
      )}
    </div>
  );
}
