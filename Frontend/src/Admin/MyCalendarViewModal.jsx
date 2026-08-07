import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CalendarDays, Clock, MapPin, AlignLeft, CheckSquare, 
  Target, AlertCircle, FileText, Battery, Flame, Zap
} from 'lucide-react';
import dayjs from 'dayjs';

const CATEGORY_COLORS = {
  'Meeting': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Client Call': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Training': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Deadline': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Birthday': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Holiday': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'Leave': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Other': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const Section = ({ title, icon: Icon, children }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={14} className="text-white/40" />
      <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      {children}
    </div>
  </div>
);

const Row = ({ label, value }) => {
  if (!value || value === '') return null;
  return (
    <div className="flex justify-between py-2 border-b border-white/[0.04] last:border-0 last:pb-0 first:pt-0 gap-4">
      <span className="text-[11px] text-white/40 font-medium shrink-0 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-white text-right break-words">{value}</span>
    </div>
  );
};

export default function MyCalendarViewModal({ open, onClose, event, onEdit }) {
  if (!open || !event) return null;

  const type = event.eventType || event.category || 'Other';
  const colorClass = CATEGORY_COLORS[type] || CATEGORY_COLORS['Other'];
  
  const dateStr = event.planDate || event.startDate || event.plan_date;
  
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div 
        className="relative w-full max-w-lg bg-[#0d0d12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ animation: 'zoomIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className={`inline-flex mb-3 items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${colorClass}`}>
                {type}
              </span>
              <h2 className="text-2xl font-bold text-white leading-tight break-words">
                {event.planTitle || event.title || 'Untitled Event'}
              </h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-2">
          
          <Section title="Basic Details" icon={CalendarDays}>
            <Row label="Date" value={dayjs(dateStr).format('dddd, MMMM D, YYYY')} />
            <Row label="Time" value={event.allDay ? 'All Day' : `${event.startTime || '--'} – ${event.endTime || '--'}`} />
            {event.estimatedDuration && <Row label="Duration" value={event.estimatedDuration} />}
            <Row label="Status" value={event.status} />
            <Row label="Priority" value={event.priority} />
          </Section>

          {(event.description || event.notes) && (
            <Section title="Information" icon={AlignLeft}>
              {event.description && (
                <div className="mb-3 last:mb-0">
                  <p className="text-[11px] text-white/40 font-medium uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
              {event.notes && (
                <div className="mb-3 last:mb-0">
                  <p className="text-[11px] text-white/40 font-medium uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{event.notes}</p>
                </div>
              )}
            </Section>
          )}

          {event.checklistItems && (
            <Section title="Checklist" icon={Target}>
              {event.checklistItems && (
                <div className="mb-3 last:mb-0">
                  <p className="text-[11px] text-white/40 font-medium uppercase tracking-wide mb-1">Checklist Items</p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {Array.isArray(event.checklistItems)
                      ? event.checklistItems.map((item, index) => (
                          <li key={`${item}-${index}`} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <span className="flex-1 whitespace-pre-wrap">{item}</span>
                          </li>
                        ))
                      : typeof event.checklistItems === 'string' && (
                          <li className="whitespace-pre-wrap">{event.checklistItems}</li>
                        )}
                  </ul>
                </div>
              )}
            </Section>
          )}

          {event.attachments && event.attachments.length > 0 && (
            <Section title="Attachments" icon={FileText}>
              <div className="space-y-2">
                {event.attachments.map((doc, idx) => {
                  const name = doc.document_name || (typeof doc === 'string' ? doc.split('/').pop() : 'Attachment');
                  const link = doc.file_path || (typeof doc === 'string' ? doc : null);
                  return (
                    <a key={idx} href={link ? (link.startsWith('http') || link.startsWith('/') ? link : `http://localhost:5000/${link}`) : '#'} target="_blank" rel="noreferrer" 
                       className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{name}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </Section>
          )}

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] shrink-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-colors shadow-sm">
            Close
          </button>
          {onEdit && (
            <button onClick={() => onEdit(event)} className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
              Edit Event
            </button>
          )}
        </div>

      </div>
      <style>{`
        @keyframes zoomIn {
          from { transform: scale(0.95) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}
