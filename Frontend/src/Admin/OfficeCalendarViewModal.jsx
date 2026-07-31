import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CalendarDays, Clock, MapPin, AlignLeft, CheckSquare, 
  Target, AlertCircle, FileText, Battery, Flame, Zap, User, Users, Briefcase, Building2, Eye, Pencil, Trash2
} from 'lucide-react';
import dayjs from 'dayjs';

const EVENT_TYPE_COLORS = {
  Meeting: '#3b82f6', Holiday: '#22c55e', Leave: '#8b5cf6',
  Birthday: '#ec4899', Anniversary: '#d946ef', 'Client Meeting': '#6366f1',
  Training: '#10b981', 'Office Event': '#06b6d4', 'Project Deadline': '#ef4444',
  Reminder: '#f97316', Interview: '#1d4ed8', Other: '#64748b',
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

export default function OfficeCalendarViewModal({ open, onClose, event, onEdit, onDelete, canEdit }) {
  if (!open || !event) return null;

  const type = event.eventType || 'Other';
  const color = event.color || EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS['Other'];
  
  const dateStr = event.startDate;
  
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
              <span 
                className="inline-flex mb-3 items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border"
                style={{ background: `${color}22`, color: color, borderColor: `${color}55` }}
              >
                {type}
              </span>
              <h2 className="text-2xl font-bold text-white leading-tight break-words">
                {event.title || 'Untitled Event'}
              </h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-2">
          
          <Section title="Schedule & Location" icon={CalendarDays}>
            <Row label="Date" value={dayjs(dateStr).format('dddd, MMMM D, YYYY')} />
            <Row label="Time" value={event.allDay ? 'All Day' : `${event.startTime || '--'} – ${event.endTime || '--'}`} />
            <Row label="Location" value={event.location} />
            {event.meetingLink && (
               <div className="flex justify-between py-2 border-b border-white/[0.04] last:border-0 last:pb-0 first:pt-0 gap-4">
                 <span className="text-[11px] text-white/40 font-medium shrink-0 uppercase tracking-wide">Link</span>
                 <a href={event.meetingLink.startsWith('http') ? event.meetingLink : `https://${event.meetingLink}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline truncate">
                   {event.meetingLink}
                 </a>
               </div>
            )}
            <Row label="Status" value={event.status} />
            <Row label="Priority" value={event.priority} />
            <Row label="Reminder" value={event.reminder} />
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

          <Section title="Project & Organization" icon={Building2}>
            <Row label="Project" value={event.project} />
            {event.departments && event.departments.length > 0 && <Row label="Departments" value={event.departments.join(', ')} />}
            {event.teams && event.teams.length > 0 && <Row label="Teams" value={event.teams.join(', ')} />}
            <Row label="Organizer Name" value={event.organizerName} />
            <Row label="Organizer Dept" value={event.organizerDepartment} />
            <Row label="Organizer Email" value={event.organizerEmail} />
            <Row label="Organizer Contact" value={event.organizerContactNumber} />
          </Section>

          {event.participants && event.participants.length > 0 && (
            <Section title="Participants" icon={Users}>
              <div className="flex flex-wrap gap-2">
                {event.participants.map((p, idx) => {
                  const displayName = typeof p === 'object' ? p.name : p;
                  return (
                    <span key={idx} className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-white/80 font-medium">
                      {displayName}
                    </span>
                  );
                })}
              </div>
            </Section>
          )}
          
          {(event.externalGuests || (event.guestEmailAddresses && event.guestEmailAddresses.length > 0)) && (
            <Section title="Guests" icon={User}>
              <Row label="External Guests" value={event.externalGuests ? 'Allowed' : 'Not Allowed'} />
              {event.guestEmailAddresses && event.guestEmailAddresses.length > 0 && (
                <Row label="Guest Emails" value={event.guestEmailAddresses.join(', ')} />
              )}
            </Section>
          )}

          {event.attachments && event.attachments.length > 0 && (
            <Section title="Attachments" icon={FileText}>
              <div className="space-y-2">
                {event.attachments.map((doc, idx) => {
                  const name = typeof doc === 'string' ? doc.split('/').pop() : 'Attachment';
                  const link = typeof doc === 'string' ? doc : null;
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
          
          {event.activity && event.activity.length > 0 && (
            <Section title="Activity" icon={Eye}>
              <div className="space-y-2">
                {event.activity.map((item, idx) => (
                  <div key={idx} className="text-xs text-white/70 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                    {item}
                  </div>
                ))}
              </div>
            </Section>
          )}
          
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-4 text-center">
            Created: {event.createdDate ? dayjs(event.createdDate).format('MMM D, YYYY') : 'N/A'} {event.createdBy ? `by ${event.createdBy}` : ''} 
            {event.updatedDate && ` • Updated: ${dayjs(event.updatedDate).format('MMM D, YYYY')}`}
          </div>

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] shrink-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-colors shadow-sm">
            Close
          </button>
          {canEdit && (
            <>
              <button onClick={() => onDelete(event)} className="px-6 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm font-bold hover:bg-rose-500/25 transition-colors flex items-center gap-2">
                <Trash2 size={15} /> Delete
              </button>
              <button onClick={() => onEdit(event)} className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 flex items-center gap-2">
                <Pencil size={15} /> Edit
              </button>
            </>
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
