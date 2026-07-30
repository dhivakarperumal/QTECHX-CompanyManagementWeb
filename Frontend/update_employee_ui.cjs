const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'Admin', 'OfficeCalendar.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add allEmployees state
if (!content.includes('const [allEmployees, setAllEmployees]')) {
    content = content.replace(
        'const [events, setEvents] = useState([]);',
        'const [events, setEvents] = useState([]);\n  const [allEmployees, setAllEmployees] = useState([]);'
    );
}

// Add fetchEmployees logic
const fetchEmployeesCode = `  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/employees');
      setAllEmployees(res.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };`;

if (!content.includes('const fetchEmployees =')) {
    content = content.replace(
        'const fetchEvents = async () => {',
        fetchEmployeesCode + '\n\n  const fetchEvents = async () => {'
    );
}

// Update useEffect to call fetchEmployees
if (!content.includes('fetchEmployees();')) {
    content = content.replace(
        'fetchEvents();',
        'fetchEvents();\n    fetchEmployees();'
    );
}

// Update handleParticipantToggle logic
const checkboxLogic = `  const handleParticipantToggle = (empName) => {
    setFormData((current) => {
      const exists = (current.participants || []).includes(empName);
      if (exists) {
        return { ...current, participants: (current.participants || []).filter(p => p !== empName) };
      } else {
        return { ...current, participants: [...(current.participants || []), empName] };
      }
    });
  };`;

if (!content.includes('const handleParticipantToggle')) {
    content = content.replace(
        'const handleArrayInput = (event, fieldName) => {',
        checkboxLogic + '\n\n  const handleArrayInput = (event, fieldName) => {'
    );
}

// Update UI
const oldUI = `<label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Select Employees (Multi Select - comma separated)</span>
                <input value={(formData.participants || []).join(', ')} onChange={(e) => handleArrayInput(e, 'participants')} className={\`rounded-2xl border px-3 py-2 outline-none border-slate-800 bg-slate-800/50 text-white\`} placeholder="e.g. Asha, Milan, Priya" />
              </label>`;

const newUI = `<div className="flex flex-col gap-2 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Select Employees</span>
                <div className="max-h-32 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-800/50 p-2 grid grid-cols-2 gap-2">
                  {allEmployees.length === 0 ? <p className="text-slate-400 text-xs">No employees found.</p> : 
                    allEmployees.map(emp => (
                      <label key={emp._id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={(formData.participants || []).includes(emp.name)} onChange={() => handleParticipantToggle(emp.name)} className="h-4 w-4 rounded border-slate-300" />
                        <span className="text-slate-200 truncate">{emp.name}</span>
                      </label>
                    ))
                  }
                </div>
              </div>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(filePath, content, 'utf-8');
