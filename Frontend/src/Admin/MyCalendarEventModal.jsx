import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Select from 'react-select';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused
        ? '#f97316'
        : 'rgba(255,255,255,0.1)'
      }`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',

    '&:hover': {
      border: '1px solid #f97316',
    },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: '0 12px',
    fontSize: '13px',
  }),

  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
  }),

  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255,255,255,.35)',
    fontSize: '13px',
  }),

  input: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
    margin: 0,
    padding: 0,
  }),

  menu: (provided) => ({
    ...provided,
    background: '#1a1d24',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '13px',
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',      // dropdown font size
    padding: '8px 14px',   // reduce option height
    backgroundColor: state.isSelected
      ? '#f97316'
      : state.isFocused
        ? 'rgba(249,115,22,.15)'
        : '#1a1d24',
    color: '#fff',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#ea580c',
    },
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#888',
    padding: '6px',
  }),
};

const FIELDS = [
  { name: 'planTitle', label: 'Plan Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'planDate', label: 'Plan Date', type: 'date', required: true },
  { name: 'startTime', label: 'Start Time', type: 'time', required: true },
  { name: 'endTime', label: 'End Time', type: 'time', required: true },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
  { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
  { name: 'checklistItems', label: 'Checklist Items', type: 'checklist' },
];

const normalizeChecklist = (value) => {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    return items.length > 0 ? items : [''];
  }

  if (typeof value === 'string') {
    const items = value
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length > 0 ? items : [''];
  }

  return [''];
};

const sanitizeChecklist = (value) =>
  normalizeChecklist(value)
    .map((item) => item.trim())
    .filter(Boolean);

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
  const [checklistItems, setChecklistItems] = useState(() => normalizeChecklist(initialData?.checklistItems));
  const [documentFile, setDocumentFile] = useState(null);

  const todayStr = dayjs().format('YYYY-MM-DD');
  const currentTimeStr = dayjs().format('HH:mm');
  const isToday = formData.planDate === todayStr;

  useEffect(() => {
    if (open) {
      const data = { ...(initialData || {}) };
      // Ensure planDate is not in the past
      if (data.planDate && dayjs(data.planDate).isBefore(dayjs().startOf('day'))) {
        data.planDate = todayStr;
      }
      setFormData(data);
      setChecklistItems(normalizeChecklist(initialData?.checklistItems));
    }
    if (!open) {
      setDocumentFile(null);
    }
  }, [open, initialData, todayStr]);

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // If date changed to today and startTime is earlier than current time, adjust
      if (name === 'planDate' && value === todayStr) {
        if (updated.startTime && updated.startTime < currentTimeStr) {
          updated.startTime = currentTimeStr;
        }
      }
      // If startTime is after endTime, update endTime
      if (name === 'startTime' && updated.endTime && updated.endTime < value) {
        updated.endTime = value;
      }
      return updated;
    });
  };

  const getMin = (field) => {
    if (field.name === 'planDate') {
      return todayStr;
    }
    if (field.name === 'startTime') {
      if (isToday) {
        return currentTimeStr;
      }
      return undefined;
    }
    if (field.name === 'endTime') {
      if (isToday) {
        return formData.startTime ? (formData.startTime > currentTimeStr ? formData.startTime : currentTimeStr) : currentTimeStr;
      }
      return formData.startTime || undefined;
    }
    return field.min;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.planDate && dayjs(formData.planDate).isBefore(dayjs().startOf('day'))) {
      toast.error('Plan date cannot be in the past');
      return;
    }

    if (formData.planDate === todayStr) {
      const curTime = dayjs().format('HH:mm');
      if (formData.startTime && formData.startTime < curTime) {
        toast.error('Start time cannot be in the past');
        return;
      }
    }

    if (formData.startTime && formData.endTime && formData.endTime < formData.startTime) {
      toast.error('End time must be after start time');
      return;
    }

    const submissionData = {
      ...formData,
      checklistItems: sanitizeChecklist(checklistItems),
    };
    if (onSave) onSave(submissionData, documentFile);
  };

  return (
    <Modal open={open} onClose={onClose} title="Plan My Day" subtitle="Fill fields and save to MySQL database">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((field) => {
            const placeholder = field.placeholder ?? `Enter ${field.label.toLowerCase()}`;
            return (
              <div key={field.name} className={field.type === 'checklist' ? 'flex flex-col gap-2 md:col-span-2' : 'flex flex-col gap-2'}>
                <label className="text-sm font-medium text-white/80">{field.label}{field.required ? ' *' : ''}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={field.rows || 3}
                    placeholder={placeholder}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                ) : field.type === 'checklist' ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="space-y-2">
                      {checklistItems.map((item, index) => (
                        <div key={`${field.name}-${index}`} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...checklistItems];
                              updated[index] = e.target.value;
                              setChecklistItems(updated);
                            }}
                            placeholder="Add checklist item"
                            className="flex-1 rounded-xl border border-white/10 bg-[#0d0d12] px-3 py-2 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = checklistItems.filter((_, i) => i !== index);
                              setChecklistItems(updated.length > 0 ? updated : ['']);
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setChecklistItems([...checklistItems, ''])}
                      className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
                    >
                      <Plus size={14} />
                      Add Item
                    </button>
                  </div>
                ) : field.type === 'select' ? (
                  <Select
                    styles={customSelectStyles}
                    value={formData[field.name] ? { value: formData[field.name], label: formData[field.name] } : null}
                    onChange={(option) => handleChange(field.name, option ? option.value : '')}
                    options={field.options.map((opt) => ({ value: opt, label: opt }))}
                    placeholder={`Select ${field.label}`}
                    isClearable
                  />
                ) : (
                  <input
                    type={field.type}
                    min={getMin(field)}
                    max={field.max}
                    step={field.step}
                    placeholder={placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all scheme-dark"
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
