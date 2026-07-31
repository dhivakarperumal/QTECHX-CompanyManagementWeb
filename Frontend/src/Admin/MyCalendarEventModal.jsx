import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const FIELDS = [
  { name: 'planTitle', label: 'Plan Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'planDate', label: 'Plan Date', type: 'date', required: true },
  { name: 'startTime', label: 'Start Time', type: 'time', required: true },
  { name: 'endTime', label: 'End Time', type: 'time', required: true },
  { name: 'estimatedDuration', label: 'Estimated Duration', type: 'text' },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
  { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
  { name: 'project', label: 'Project', type: 'text' },
  { name: 'module', label: 'Module', type: 'text' },
  { name: 'task', label: 'Task', type: 'text' },
  { name: 'dailyGoal', label: 'Daily Goal', type: 'textarea' },
  { name: 'expectedOutcome', label: 'Expected Outcome', type: 'textarea' },
  { name: 'checklistItems', label: 'Checklist Items', type: 'textarea' },
  { name: 'reminderDate', label: 'Reminder Date', type: 'date' },
  { name: 'reminderTime', label: 'Reminder Time', type: 'time' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'meetingLink', label: 'Meeting Link', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
  { name: 'tags', label: 'Tags', type: 'text' },
  { name: 'progress', label: 'Progress (%)', type: 'number', min: 0, max: 100 },
  { name: 'plannedHours', label: 'Planned Hours', type: 'number', step: '0.25' },
  { name: 'workedHours', label: 'Worked Hours', type: 'number', step: '0.25' },
  { name: 'breakStartTime', label: 'Break Start Time', type: 'time' },
  { name: 'breakEndTime', label: 'Break End Time', type: 'time' },
  { name: 'energyLevel', label: 'Energy Level', type: 'select', options: ['High', 'Medium', 'Low'] },
  { name: 'todaysAchievement', label: "Today's Achievement", type: 'textarea' },
  { name: 'challenges', label: 'Challenges', type: 'textarea' },
  { name: 'tomorrowsPlan', label: "Tomorrow's Plan", type: 'textarea' },
];

function Modal({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden overflow-y-auto rounded-3xl bg-[#0d0d12] shadow-2xl border border-white/10 p-6 backdrop-saturate-150">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function MyCalendarEventModal({ open, onClose, initialData, onSave, onDelete }) {
  const [formData, setFormData] = useState(initialData || {});
  const [documentFile, setDocumentFile] = useState(null);

  useEffect(() => {
    if (!open) {
      setDocumentFile(null);
    }
  }, [open]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSave) onSave(formData, documentFile);
  };

  return (
    <Modal open={open} onClose={onClose} title="Plan My Day" subtitle="Fill fields and save to MySQL database">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((field) => {
            const placeholder = field.placeholder ?? `Enter ${field.label.toLowerCase()}`;
            return (
              <div key={field.name} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">{field.label}{field.required ? ' *' : ''}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={field.rows || 3}
                    placeholder={placeholder}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    placeholder={placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm font-medium text-white/80">Upload Document (optional)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.rar"
            onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-primary/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/30"
          />
          {documentFile && <p className="mt-2 text-xs text-slate-400">Selected: {documentFile.name}</p>}
        </div>

        <div className="flex items-end justify-end flex-wrap gap-3 pt-3">
          <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition">Save</button>
          <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
