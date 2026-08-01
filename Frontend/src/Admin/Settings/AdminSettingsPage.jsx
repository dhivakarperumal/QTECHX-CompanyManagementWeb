import React from 'react';
import { Settings, CalendarDays, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminSettingsPage = () => {
  const cards = [
    {
      title: 'Leave Settings',
      description: 'Manage leave types and the maximum days employees can apply for.',
      icon: CalendarDays,
      path: '/admin/settings/leave',
      accent: 'from-orange-500/20 to-orange-600/10',
    },
  ];

  return (
    <div className="space-y-6 pb-8 text-white min-h-screen">
      <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-6 shadow-2xl shadow-black/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <Settings className="text-orange-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
            <p className="text-sm text-white/40">Choose a settings area to continue.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.path}
              className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-6 shadow-2xl shadow-black/20 transition hover:border-orange-500/30 hover:bg-[#151722]"
            >
              <div className={`inline-flex rounded-2xl bg-gradient-to-br ${card.accent} p-3`}>
                <Icon size={20} className="text-orange-400" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm text-white/40">{card.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-400">
                Open <ArrowRight size={16} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={20} className="text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Quick note</h3>
        </div>
        <p className="text-sm text-white/55">You can add more cards here later. For now, leave settings is available as its own page.</p>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
