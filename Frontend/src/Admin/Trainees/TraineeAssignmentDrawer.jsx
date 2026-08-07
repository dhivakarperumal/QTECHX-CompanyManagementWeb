import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Mail, Phone, Calendar, Clock, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import Select from 'react-select';
import api from '../../api';

// --- Custom Select Styles for dark theme ---
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#0e1118',
    border: `1px solid ${state.isFocused ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.1)'}`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',
    '&:hover': {
      border: '1px solid rgba(249,115,22,0.7)',
    },
  }),
  valueContainer: (provided) => ({ ...provided, padding: '0 12px', fontSize: '14px' }),
  singleValue: (provided) => ({ ...provided, color: '#fff', fontSize: '14px' }),
  placeholder: (provided) => ({ ...provided, color: 'rgba(255,255,255,.35)', fontSize: '14px' }),
  input: (provided) => ({ ...provided, color: '#fff', fontSize: '14px', margin: 0, padding: 0 }),
  menu: (provided) => ({ ...provided, background: '#0e1118', border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px', overflow: 'hidden', zIndex: 9999 }),
  menuList: (provided) => ({ ...provided, padding: 0, fontSize: '14px' }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '14px',
    padding: '8px 14px',
    backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? 'rgba(249,115,22,.15)' : '#0e1118',
    color: '#fff',
    cursor: 'pointer',
    ':active': { backgroundColor: '#ea580c' },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided) => ({ ...provided, color: '#888', padding: '6px' }),
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TraineeAssignmentDrawer = ({ trainee, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const person = selectedPerson || trainee;
  const traineeId = person?.uuid || person?.person_id || '';

  // Active Assignment from history
  const activeAssignment = history.find(h => String(h.status).toLowerCase() === 'active');

  useEffect(() => {
    setSelectedEmployeeId('');
    setAssignedDate(new Date().toISOString().split('T')[0]);
    setExpectedDate('');
    setPriority('Medium');
    setNotes('');
    setError('');
    fetchEmployees();
    fetchPeople();
    setSelectedPerson(trainee || null);
  }, [trainee]);

  useEffect(() => {
    if (selectedPerson?.uuid || selectedPerson?.person_id) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [selectedPerson]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const { data } = await api.get('/trainee-assignments/available-employees');
      if (data.success) {
        setEmployees(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchPeople = async () => {
    try {
      setLoadingPeople(true);
      const { data } = await api.get('/trainee-intern?limit=500&page=1');
      if (data.success) {
        setPeople(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch trainees/interns', err);
    } finally {
      setLoadingPeople(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const idToUse = traineeId;
      if (!idToUse) {
        setHistory([]);
        return;
      }
      const { data } = await api.get(`/trainee-assignments/history/${idToUse}`);
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPerson && !trainee) {
      setError('Please select a trainee or intern.');
      return;
    }
    if (!selectedEmployeeId) {
      setError('Please select an employee.');
      return;
    }
    if (!traineeId) {
      setError('Selected person identifier is missing.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const selectedEmp = employees.find(emp => emp.employee_id === selectedEmployeeId);
      
      const payload = {
        trainee_id: person?.uuid || person?.person_id || null,
        employee_id: selectedEmployeeId,
        trainee_name: person?.full_name || null,
        trainee_code: person?.person_id || person?.uuid || null,
        trainee_email: person?.email_address || null,
        trainee_phone: person?.mobile_number || null,
        trainee_department: person?.department || null,
        trainee_designation: person?.designation || null,
        trainee_course: person?.course || null,
        trainee_batch: person?.batch || null,
        trainee_joining_date: person?.created_at || person?.joining_date || null,
        person_type: person?.type || 'Trainee',
        person_name: person?.full_name || null,
        person_id: person?.person_id || person?.uuid || null,
        person_email: person?.email_address || null,
        person_phone: person?.mobile_number || null,
        department: person?.department || null,
        designation: person?.designation || null,
        course: person?.course || null,
        batch: person?.batch || null,
        joining_date: person?.created_at || person?.joining_date || null,
        employee_name: selectedEmp?.employee_name || null,
        employee_code: selectedEmp?.employee_id || null,
        employee_email: selectedEmp?.email || null,
        employee_phone: selectedEmp?.phone || null,
        employee_department: selectedEmp?.department || null,
        employee_designation: selectedEmp?.designation || null,
        assigned_date: assignedDate,
        expected_completion_date: expectedDate || null,
        priority,
        notes
      };

      const { data } = await api.post('/trainee-assignments', payload);
      if (data.success) {
        onSuccess(data.message || 'Employee assigned successfully.');
      } else {
        throw new Error(data.message || 'Assignment failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to assign employee.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[90%] sm:w-[450px] bg-[#111318] shadow-2xl z-[1000] flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#16181f]">
          <h2 className="text-white font-bold text-lg">Assign Employee</h2>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 rounded-xl transition">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5">
          <label className="block text-xs font-medium text-white/70 mb-1.5">Select Trainee / Intern *</label>
          {loadingPeople ? (
            <div className="h-[42px] bg-white/5 animate-pulse rounded-xl" />
          ) : (
            <Select
              options={people.map(p => ({
                value: p.uuid || p.person_id || '',
                label: `${p.full_name} (${p.person_id || p.uuid}) - ${p.type}`
              }))}
              value={person ? {
                value: person.uuid || person.person_id || '',
                label: `${person.full_name} (${person.person_id || person.uuid}) - ${person.type}`
              } : null}
              onChange={(option) => {
                const selected = people.find(p => (p.uuid || p.person_id || '') === option?.value);
                setSelectedPerson(selected || null);
              }}
              styles={customSelectStyles}
              placeholder="Search trainees or interns..."
              isClearable
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Trainee / Intern Details Card */}
          {person ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{person.type === 'Intern' ? 'Intern Details' : 'Trainee Details'}</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0">
                  {person.full_name?.substring(0, 1).toUpperCase()}
                </div>
                <div className="space-y-1 w-full">
                  <p className="text-white font-bold">{person.full_name}</p>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{person.person_id || person.uuid}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded-md">{person.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] text-white/50">
                    <div className="flex items-center gap-1.5"><Mail size={12}/> <span className="truncate">{person.email_address || '—'}</span></div>
                    <div className="flex items-center gap-1.5"><Phone size={12}/> <span>{person.mobile_number || '—'}</span></div>
                    <div className="flex items-center gap-1.5"><Briefcase size={12}/> <span className="truncate">{person.department || '—'}</span></div>
                    <div className="flex items-center gap-1.5"><Calendar size={12}/> <span>{formatDate(person.created_at || person.joining_date)}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-white/50">
                    <div className="flex items-center gap-1.5"><span className="font-semibold">Designation:</span> <span className="truncate">{person.designation || '—'}</span></div>
                    <div className="flex items-center gap-1.5"><span className="font-semibold">Course:</span> <span className="truncate">{person.course || '—'}</span></div>
                    <div className="flex items-center gap-1.5"><span className="font-semibold">Batch:</span> <span className="truncate">{person.batch || '—'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-white/40">
              Select a trainee or intern from the dropdown above to load details.
            </div>
          )}

          {/* Current Assignment Notice */}
          {activeAssignment && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-400 font-semibold mb-1">Active Assignment Exists</p>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Currently assigned to <span className="text-white font-medium">{activeAssignment.employee_name}</span> ({activeAssignment.employee_code}) since {formatDate(activeAssignment.assigned_date)}. 
                    Reassigning will mark the current assignment as Completed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Form */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">New Assignment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Select Employee *</label>
                {loadingEmployees ? (
                  <div className="h-[42px] bg-white/5 animate-pulse rounded-xl" />
                ) : (
                  <Select
                    options={employees.map(e => ({
                      value: e.employee_id,
                      label: `${e.employee_name} (${e.employee_id}) - Active Trainees: ${e.active_trainee_count}`
                    }))}
                    value={selectedEmployeeId ? {
                      value: selectedEmployeeId,
                      label: (() => {
                        const e = employees.find(x => x.employee_id === selectedEmployeeId);
                        return e ? `${e.employee_name} (${e.employee_id}) - Active Trainees: ${e.active_trainee_count}` : '';
                      })()
                    } : null}
                    onChange={v => setSelectedEmployeeId(v ? v.value : '')}
                    styles={customSelectStyles}
                    placeholder="Search employees..."
                    isClearable
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Assignment Date *</label>
                  <input 
                    type="date" 
                    value={assignedDate} 
                    onChange={e => setAssignedDate(e.target.value)}
                    required
                    className="w-full bg-[#0e1118] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Expected Completion</label>
                  <input 
                    type="date" 
                    value={expectedDate} 
                    onChange={e => setExpectedDate(e.target.value)}
                    min={assignedDate}
                    className="w-full bg-[#0e1118] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                        priority === p 
                        ? p === 'High' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                        : p === 'Medium' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows="2"
                  className="w-full bg-[#0e1118] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 resize-none"
                  placeholder="Any special instructions..."
                ></textarea>
              </div>

              {error && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Assignment History */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Assignment History</h3>
            {loadingHistory ? (
              <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-white/30" /></div>
            ) : history.length === 0 ? (
              <div className="text-center py-4 border border-white/5 rounded-xl bg-white/[0.02]">
                <p className="text-xs text-white/30">No previous assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((record, idx) => (
                  <div key={record.id} className="relative pl-6 pb-4 border-l border-white/10 last:border-transparent last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-[9px] h-[9px] rounded-full bg-[#111318] border-2 border-white/20">
                      {record.status === 'Active' && <div className="absolute inset-[-2px] rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                    </div>
                    
                    <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white text-sm font-semibold">{record.employee_name}</p>
                          <p className="text-[10px] text-white/50">{record.employee_code} • {record.employee_department}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          record.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                          record.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-white/40">
                        <span className="flex items-center gap-1"><Calendar size={10}/> Assigned: {formatDate(record.assigned_date)}</span>
                        {record.updated_at && record.status !== 'Active' && (
                          <span className="flex items-center gap-1"><Clock size={10}/> Completed: {formatDate(record.updated_at)}</span>
                        )}
                      </div>
                      {record.notes && (
                        <p className="mt-2 text-[11px] text-white/60 bg-white/5 p-1.5 rounded-lg border border-white/5">
                          "{record.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#16181f] flex gap-3 shrink-0">
          <button 
            onClick={onClose} 
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:text-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting || !selectedEmployeeId}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {activeAssignment ? 'Reassign Employee' : 'Assign Employee'}
          </button>
        </div>
      </div>
    </>
  );
};

export default TraineeAssignmentDrawer;
