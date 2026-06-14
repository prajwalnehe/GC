import { Users, Clock, ThumbsUp, ThumbsDown, CalendarCheck } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="card flex flex-col gap-2 min-w-0 hover:shadow-md transition-shadow p-3 sm:p-4">
    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 font-medium leading-tight">{title}</p>
      <p className="text-lg sm:text-3xl font-bold text-secondary-800 dark:text-secondary-100 mt-0.5">{value}</p>
      {subtitle && <p className="text-[10px] sm:text-xs text-secondary-400 mt-0.5 line-clamp-2">{subtitle}</p>}
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
    subtitle: 'Awaiting admin review',
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
    subtitle: 'Awaiting admin review',
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
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${isLeadManager ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-3'}`}>
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default PersonalDashboardStats;
