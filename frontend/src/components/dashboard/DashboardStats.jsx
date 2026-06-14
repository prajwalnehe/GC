import {
  Users, UserPlus, Phone, Calendar, FileText, Trophy, XCircle, IndianRupee,
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="card flex flex-col gap-2 min-w-0 hover:shadow-md transition-shadow p-3 sm:p-4">
    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 font-medium leading-tight">{title}</p>
      <p className="text-lg sm:text-2xl font-bold text-secondary-800 dark:text-secondary-100 mt-0.5 truncate">{value}</p>
      {subtitle && <p className="text-[10px] sm:text-xs text-secondary-400 mt-0.5 line-clamp-2">{subtitle}</p>}
    </div>
  </div>
);

const DashboardStats = ({ stats }) => {
  const cards = [
    { title: 'Total Leads', value: stats?.totalLeads || 0, icon: Users, color: 'bg-primary' },
    { title: 'New Leads', value: stats?.newLeads || 0, icon: UserPlus, color: 'bg-accent' },
    { title: 'Contacted', value: stats?.contactedLeads || 0, icon: Phone, color: 'bg-indigo-500' },
    { title: 'Follow-ups', value: stats?.followUpLeads || 0, icon: Calendar, color: 'bg-yellow-500' },
    { title: 'Proposal Sent', value: stats?.proposalSent || 0, icon: FileText, color: 'bg-cyan-500' },
    { title: 'Won Leads', value: stats?.wonLeads || 0, icon: Trophy, color: 'bg-green-500' },
    { title: 'Lost Leads', value: stats?.lostLeads || 0, icon: XCircle, color: 'bg-red-500' },
    { title: 'Revenue', value: formatCurrency(stats?.revenue), icon: IndianRupee, color: 'bg-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default DashboardStats;
