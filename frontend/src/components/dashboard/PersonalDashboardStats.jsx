import { Users, Clock, ThumbsUp, ThumbsDown, CalendarCheck } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="card flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm text-secondary-500 dark:text-secondary-400 font-medium">{title}</p>
      <p className="text-3xl font-bold text-secondary-800 dark:text-secondary-100 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-secondary-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const employeeCards = (stats) => [
  {
    title: 'My Total Leads',
    value: stats?.totalLeads || 0,
    icon: Users,
    color: 'bg-primary',
    subtitle: 'Assigned to you',
  },
  {
    title: 'Pending Leads',
    value: stats?.pendingLeads || 0,
    icon: Clock,
    color: 'bg-yellow-500',
    subtitle: 'Leads shown on Leads page',
  },
  {
    title: 'Follow-ups Taken',
    value: stats?.followUpsTaken || 0,
    icon: CalendarCheck,
    color: 'bg-emerald-500',
    subtitle: 'Interested + Not Interested',
  },
];

const leadManagerCards = (stats) => [
  {
    title: 'All Leads',
    value: stats?.totalLeads || 0,
    icon: Users,
    color: 'bg-primary',
    subtitle: 'Total leads in system',
  },
  {
    title: 'Pending Leads',
    value: stats?.pendingLeads || 0,
    icon: Clock,
    color: 'bg-yellow-500',
    subtitle: 'Leads shown on Leads page',
  },
  {
    title: 'Follow-ups Taken',
    value: stats?.followUpsTaken || 0,
    icon: CalendarCheck,
    color: 'bg-cyan-500',
    subtitle: 'Interested + Not Interested leads',
  },
  {
    title: 'Interested',
    value: stats?.interestedLeads || 0,
    icon: ThumbsUp,
    color: 'bg-emerald-500',
    subtitle: 'Interested leads',
  },
  {
    title: 'Not Interested',
    value: stats?.notInterestedLeads || 0,
    icon: ThumbsDown,
    color: 'bg-red-500',
    subtitle: 'Not interested leads',
  },
];

const PersonalDashboardStats = ({ stats, isLeadManager }) => {
  const cards = isLeadManager ? leadManagerCards(stats) : employeeCards(stats);

  return (
    <div className={`grid grid-cols-1 gap-4 ${isLeadManager ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-3'}`}>
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default PersonalDashboardStats;
