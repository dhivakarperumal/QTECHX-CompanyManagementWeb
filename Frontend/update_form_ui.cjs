const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'Admin', 'OfficeCalendar.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace assignedEmployees with participants logic
content = content.replace(
  /const handleEmployeeInput = \(event\) => \{[\s\S]*?\};/,
  `const handleArrayInput = (event, fieldName) => {
    const values = event.target.value.split(',').map((item) => item.trim()).filter(Boolean);
    setFormData((current) => ({ ...current, [fieldName]: values }));
  };`
);

// Form UI replacement
const formUI_replacement = `<form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Event Title *</span>
                <input required name="title" value={formData.title} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Enter event title" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Event Type *</span>
                <select required name="eventType" value={formData.eventType} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`}>
                  {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Priority</span>
                <select name="priority" value={formData.priority} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`}>
                  {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Description</span>
                <textarea name="description" value={formData.description} onChange={handleFieldChange} rows="3" className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Add short context for the event" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Start Date *</span>
                <input required type="date" name="startDate" value={formData.startDate} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">End Date *</span>
                <input required type="date" name="endDate" value={formData.endDate} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Start Time</span>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">End Time</span>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} />
              </label>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="checkbox" name="allDay" checked={formData.allDay} onChange={handleFieldChange} className="h-4 w-4 rounded border-slate-300" />
                <span>All Day Event</span>
              </label>

              {/* Advanced Tracking & Organization Details */}
              <div className="md:col-span-2 mt-4 mb-2">
                  <h4 className="font-semibold text-sky-400 border-b border-slate-800 pb-2">Participants & Departments</h4>
              </div>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Select Employees (Multi Select - comma separated)</span>
                <input value={(formData.participants || []).join(', ')} onChange={(e) => handleArrayInput(e, 'participants')} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="e.g. Asha, Milan, Priya" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Departments (comma separated)</span>
                <input value={(formData.departments || []).join(', ')} onChange={(e) => handleArrayInput(e, 'departments')} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="e.g. Sales, Marketing" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Teams (comma separated)</span>
                <input value={(formData.teams || []).join(', ')} onChange={(e) => handleArrayInput(e, 'teams')} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="e.g. Alpha, Beta" />
              </label>

              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="checkbox" name="externalGuests" checked={formData.externalGuests} onChange={handleFieldChange} className="h-4 w-4 rounded border-slate-300" />
                <span>External Guests Allowed</span>
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Guest Email Addresses (comma separated)</span>
                <input value={(formData.guestEmailAddresses || []).join(', ')} onChange={(e) => handleArrayInput(e, 'guestEmailAddresses')} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="guest1@example.com, guest2@example.com" />
              </label>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="checkbox" name="attendanceRequired" checked={formData.attendanceRequired} onChange={handleFieldChange} className="h-4 w-4 rounded border-slate-300" />
                <span>Attendance Required</span>
              </label>

              <div className="md:col-span-2 mt-4 mb-2">
                  <h4 className="font-semibold text-sky-400 border-b border-slate-800 pb-2">Organizer Details</h4>
              </div>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Organizer Name</span>
                <input name="organizerName" value={formData.organizerName || ''} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Organizer Name" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Organizer Department</span>
                <input name="organizerDepartment" value={formData.organizerDepartment || ''} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Department" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Created By</span>
                <input name="createdBy" value={formData.createdBy || ''} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Created By Name" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Contact Number</span>
                <input name="organizerContactNumber" value={formData.organizerContactNumber || ''} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Phone Number" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Email</span>
                <input name="organizerEmail" value={formData.organizerEmail || ''} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Email Address" />
              </label>
              
              <div className="md:col-span-2 mt-4 mb-2">
                  <h4 className="font-semibold text-sky-400 border-b border-slate-800 pb-2">Other Details</h4>
              </div>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Status</span>
                <select name="status" value={formData.status} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`}>
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Location</span>
                <input name="location" value={formData.location} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Room, Zoom, HQ" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Meeting Link</span>
                <input name="meetingLink" value={formData.meetingLink} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="https://" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Project</span>
                <input name="project" value={formData.project} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Optional project" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Reminder</span>
                <select name="reminder" value={formData.reminder} onChange={handleFieldChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`}>
                  {REMINDERS.map((reminder) => <option key={reminder} value={reminder}>{reminder}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Color</span>
                <input type="color" name="color" value={formData.color || '#3b82f6'} onChange={handleFieldChange} className={\`h-11 rounded-2xl border px-2 py-1 outline-none border-slate-800 bg-slate-800/50\`} />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Attachment Upload</span>
                <input type="file" multiple onChange={handleAttachmentChange} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} />
                {formData.attachments.length > 0 && <span className="text-xs text-slate-400">Selected: {formData.attachments.join(', ')}</span>}
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Notes</span>
                <textarea name="notes" value={formData.notes} onChange={handleFieldChange} rows="3" className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="Optional notes" />
              </label>

              <div className="flex items-center justify-end gap-2 md:col-span-2">
                <button type="button" onClick={() => setShowModal(false)} className={\`rounded-full border px-4 py-2 text-sm border-slate-800 bg-slate-800/50 hover:bg-slate-800\`}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
                  {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={15} /> Saving</span> : mode === 'edit' ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>`;

content = content.replace(/<form className="grid gap-4 md:grid-cols-2" onSubmit=\{handleSubmit\}>[\s\S]*?<\/form>/, formUI_replacement);

fs.writeFileSync(filePath, content, 'utf-8');
