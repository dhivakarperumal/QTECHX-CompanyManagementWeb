import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    CalendarDays,
    Save,
    Plus,
    Loader2,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const emptyForm = {
    leave_type: '',
    max_days: 0,
    description: '',
    is_active: 1,
};

const AdminLeaveSettingsPage = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newLeave, setNewLeave] = useState(emptyForm);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leave-settings');
            setSettings(res.data?.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to load leave settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSetting = (id, field, value) => {
        setSettings((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = settings.map(({ id, created_at, updated_at, ...rest }) => ({
                ...rest,
                max_days: Number(rest.max_days || 0),
                is_active: Number(rest.is_active ?? 1),
            }));

            await api.post('/leave-settings', payload);
            toast.success('Leave settings updated successfully');
            await fetchSettings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save leave settings');
        } finally {
            setSaving(false);
        }
    };

    const addNewLeave = async () => {
        const leaveType = newLeave.leave_type.trim();
        if (!leaveType) {
            toast.error('Please enter a leave type');
            return;
        }

        if (settings.some((item) => item.leave_type.toLowerCase() === leaveType.toLowerCase())) {
            toast.error('This leave type already exists');
            return;
        }

        const payload = {
            leave_type: leaveType,
            max_days: Number(newLeave.max_days || 0),
            description: newLeave.description.trim(),
            is_active: Number(newLeave.is_active ?? 1),
        };

        try {
            const res = await api.post('/leave-settings', [payload]);
            const updated = [...settings, ...(res.data?.data || [payload])];
            setSettings(updated);
            setNewLeave(emptyForm);
            toast.success('New leave type added');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add leave type');
        }
    };

    return (
        <div className="space-y-6 pb-8 text-white min-h-screen">
            <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-6 shadow-2xl shadow-black/30">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/admin/settings")}
                            className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
                        >
                            <ArrowLeft size={18} className="text-white" />
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/15 flex items-center justify-center">
                            <Settings className="text-orange-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">Leave Settings</h1>
                            <p className="text-sm text-white/40">Manage leave types and the number of days each employee can apply for.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save changes
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-6 shadow-2xl shadow-black/20">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Leave limits</h2>
                            <p className="text-sm text-white/40">Set the maximum number of days each employee can apply for per leave type.</p>
                        </div>
                        <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                            Active rules
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-10 text-white/40">
                            <Loader2 size={18} className="mr-2 animate-spin" />
                            Loading leave settings...
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-white/10">
                            <div className="grid grid-cols-[1.3fr_0.7fr_0.8fr] gap-3 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                                <span>Leave Type</span>
                                <span>Max Days</span>
                                <span>Status</span>
                            </div>
                            <div className="divide-y divide-white/10 bg-[#0f1117]">
                                {settings.map((item) => (
                                    <div key={item.id || item.leave_type} className="grid grid-cols-[1.3fr_0.7fr_0.8fr] gap-3 px-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{item.leave_type}</p>
                                            {item.description ? <p className="text-xs text-white/35">{item.description}</p> : null}
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.max_days ?? 0}
                                            onChange={(e) => updateSetting(item.id, 'max_days', e.target.value)}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50"
                                        />
                                        <label className="flex items-center gap-2 text-sm text-white/70">
                                            <input
                                                type="checkbox"
                                                checked={Number(item.is_active ?? 1) === 1}
                                                onChange={(e) => updateSetting(item.id, 'is_active', e.target.checked ? 1 : 0)}
                                                className="h-4 w-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                                            />
                                            Active
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-6 shadow-2xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                                <CalendarDays size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Add new leave type</h3>
                                <p className="text-sm text-white/40">Create a new leave category with a limit.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm text-white/60">Leave Type</label>
                                <input
                                    value={newLeave.leave_type}
                                    onChange={(e) => setNewLeave((prev) => ({ ...prev, leave_type: e.target.value }))}
                                    placeholder="Example: Bereavement Leave"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-white/60">Maximum Days</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newLeave.max_days}
                                    onChange={(e) => setNewLeave((prev) => ({ ...prev, max_days: e.target.value }))}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-white/60">Description</label>
                                <input
                                    value={newLeave.description}
                                    onChange={(e) => setNewLeave((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Optional note"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <button
                                onClick={addNewLeave}
                                className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/20"
                            >
                                <Plus size={16} /> Add leave type
                            </button>
                        </div>
                    </div>

                    <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-6 shadow-2xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck size={20} className="text-emerald-400" />
                            <h3 className="text-lg font-semibold text-white">How it works</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-white/55">
                            <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-0.5 text-orange-400" /> Employees can apply only up to the configured maximum days for each leave type.</li>
                            <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-0.5 text-orange-400" /> Set a limit to 0 for unlimited days, or enter a value such as 5 for Casual Leave.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLeaveSettingsPage;
