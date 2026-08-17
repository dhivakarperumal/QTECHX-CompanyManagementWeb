import React from 'react';
import { Settings, CalendarDays, BriefcaseBusiness, ArrowRight, FileText } from 'lucide-react';
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
    {
      title: 'Services',
      description: 'Create and review all web and business service offerings.',
      icon: BriefcaseBusiness,
      path: '/admin/settings/services',
      accent: 'from-cyan-500/20 to-cyan-600/10',
    },
    {
      title: 'Pricing',
      description: 'Manage pricing plans and their included features.',
      icon: BriefcaseBusiness,
      path: '/admin/settings/pricing',
      accent: 'from-emerald-500/20 to-emerald-600/10',
    },
    {
      title: 'Reviews',
      description: 'Manage customer testimonials, ratings, status, and admin replies.',
      icon: BriefcaseBusiness,
      path: '/admin/settings/reviews',
      accent: 'from-violet-500/20 to-violet-600/10',
    },
    {
      title: 'Post Jobs',
      description: 'Create, update, publish, and manage recruitment job postings with application tracking.',
      icon: BriefcaseBusiness,
      path: '/admin/settings/jobs',
      accent: 'from-amber-500/20 to-orange-600/10',
    },
    {
      title: 'Job Applications',
      description: 'View and manage all job applications, change applicant status, and download resumes.',
      icon: FileText,
      path: '/admin/settings/job-applications',
      accent: 'from-blue-500/20 to-cyan-600/10',
    },
  ];

  return (
    <div className="space-y-6 pb-8 text-white min-h-screen">

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

     
    </div>
  );
};

export default AdminSettingsPage;
