import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Users,
  FolderKanban,
  DollarSign,
  CalendarCheck2,
  ArrowUpRight,
  TrendingUp,
  CircleDollarSign,
  ReceiptText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import api from '../api';

const numberFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const getArrayData = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.expenses)) return payload.expenses;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const normalizeStatus = (value) => {
  if (!value) return 'Unknown';
  const normalized = String(value).trim();
  if (normalized.toLowerCase() === 'in progress') return 'In Progress';
  return normalized;
};

const StatCard = ({ icon: Icon, label, value, hint, tone }) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur-xl">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">{label}</p>
        <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
        {hint && <p className="mt-2 text-xs text-white/50">{hint}</p>}
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError('');

      try {
        const [employeesRes, projectsRes, expensesRes, salariesRes, clientsRes] = await Promise.allSettled([
          api.get('/employees'),
          api.get('/projects'),
          api.get('/expenses'),
          api.get('/salary/history'),
          api.get('/clients'),
        ]);

        const parsedEmployees = getArrayData(employeesRes.status === 'fulfilled' ? employeesRes.value?.data : null, 'data');
        const parsedProjects = getArrayData(projectsRes.status === 'fulfilled' ? projectsRes.value?.data : null, 'data');
        const parsedExpenses = getArrayData(expensesRes.status === 'fulfilled' ? expensesRes.value?.expenses : null, 'expenses');
        const parsedSalaries = getArrayData(salariesRes.status === 'fulfilled' ? salariesRes.value?.data : null, 'data');
        const parsedClients = getArrayData(clientsRes.status === 'fulfilled' ? clientsRes.value?.data : null, 'data');

        setEmployees(parsedEmployees);
        setProjects(parsedProjects);
        setExpenses(parsedExpenses);
        setSalaryHistory(parsedSalaries);
        setClients(parsedClients);

        if ([employeesRes, projectsRes, expensesRes, salariesRes, clientsRes].every((result) => result.status === 'rejected')) {
          setError('Live data is temporarily unavailable. Showing the dashboard shell instead.');
        }
      } catch (err) {
        setError('Unable to load the reports data right now.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const summaryCards = useMemo(() => {
    const activeProjects = projects.filter((project) => {
      const status = String(project.current_status || '').trim();
      return ['In Progress', 'Planning', 'Testing', 'On Hold', 'Live'].includes(status);
    }).length;
    const completedProjects = projects.filter((project) => String(project.current_status || '').trim() === 'Completed').length;
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const totalPayroll = salaryHistory.reduce((sum, payment) => sum + Number(payment.total_salary || payment.amount || 0), 0);
    const pendingFollowUps = clients.filter((client) => String(client.follow_up_status || '').toLowerCase() === 'pending').length;

    return [
      {
        label: 'Active team',
        value: numberFormatter.format(employees.length || 0),
        hint: 'Employees on record',
        tone: 'bg-blue-500/15 text-blue-300',
        icon: Users,
      },
      {
        label: 'Projects running',
        value: numberFormatter.format(activeProjects),
        hint: `${completedProjects} completed`,
        tone: 'bg-primary/15 text-primary',
        icon: FolderKanban,
      },
      {
        label: 'Monthly spend',
        value: currencyFormatter.format(totalExpenses),
        hint: `${currencyFormatter.format(totalPayroll)} payroll`,
        tone: 'bg-amber-500/15 text-amber-300',
        icon: DollarSign,
      },
      {
        label: 'Follow-ups pending',
        value: numberFormatter.format(pendingFollowUps),
        hint: 'Client follow-up queue',
        tone: 'bg-violet-500/15 text-violet-300',
        icon: AlertTriangle,
      },
    ];
  }, [clients, employees.length, expenses, projects, salaryHistory]);

  const projectStatusBreakdown = useMemo(() => {
    const statusMap = projects.reduce((acc, project) => {
      const status = normalizeStatus(project.current_status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const expenseBreakdown = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const label = String(expense.expense_type || expense.payment_type || 'Other').trim() || 'Other';
      acc[label] = (acc[label] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, amount]) => ({ name, amount }));
  }, [expenses]);

  const recentActivity = useMemo(() => {
    const expensesActivity = expenses
      .slice()
      .sort((a, b) => new Date(b.date_of_payment || b.created_at || 0) - new Date(a.date_of_payment || a.created_at || 0))
      .slice(0, 5)
      .map((expense) => ({
        title: expense.description || expense.expense_type || 'Expense entry',
        meta: expense.paid_to || expense.expense_type || 'Expense',
        amount: currencyFormatter.format(Number(expense.amount || 0)),
      }));

    const salaryActivity = salaryHistory
      .slice()
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5)
      .map((payment) => ({
        title: `Salary ${payment.employee_code || payment.employee_id || 'processed'}`,
        meta: payment.first_name ? `${payment.first_name} ${payment.last_name || ''}`.trim() : 'Payroll',
        amount: currencyFormatter.format(Number(payment.total_salary || payment.amount || 0)),
      }));

    return [...expensesActivity, ...salaryActivity].slice(0, 6);
  }, [expenses, salaryHistory]);

  return (
    <div className="space-y-6 pb-6 text-white">
      <div className="rounded-[2rem] border border-white/10 bg-[#12131a]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              <BarChart3 size={14} />
              Admin reporting center
            </div>
            <h1 className="text-3xl font-semibold text-white">Operational performance and business health.</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/60">
              This view now pulls live admin data for employees, projects, attendance, expenses and payroll so you can review the business at a glance.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" />
              <span>Updated from the live admin modules</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return <StatCard key={card.label} icon={Icon} {...card} />;
          })}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">


        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Project mix</p>
              <h2 className="text-lg font-semibold text-white">Status distribution</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">{projects.length} projects</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectStatusBreakdown} dataKey="value" innerRadius={58} outerRadius={90} paddingAngle={2}>
                  {projectStatusBreakdown.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={['#f97316', '#38bdf8', '#34d399', '#a78bfa', '#fb7185', '#64748b'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Financial performance</p>
              <h2 className="text-lg font-semibold text-white">Expense breakdown by category</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">{currencyFormatter.format(expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0))}</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expenseBreakdown}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="amount" stroke="#fb923c" strokeWidth={3} dot={{ r: 4, fill: '#fb923c' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Latest activity</p>
              <h2 className="text-lg font-semibold text-white">Recent expenses and payroll</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">Live feed</div>
          </div>
          <div className="space-y-3">
            {recentActivity.length ? recentActivity.map((item, index) => (
              <div key={`${item.title}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f1117]/70 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-white/45">{item.meta}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <span>{item.amount}</span>
                  <ArrowUpRight size={16} />
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-white/50">
                No recent activity to show yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
