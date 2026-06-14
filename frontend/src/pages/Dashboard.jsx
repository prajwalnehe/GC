import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import PersonalDashboardStats from '../components/dashboard/PersonalDashboardStats';
import { MonthlyLeadsChart, LeadSourceChart, ConversionRateChart } from '../components/dashboard/DashboardCharts';
import { CardSkeleton } from '../components/common/Skeleton';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../utils/helpers';
import { PageHeader } from '../components/common/PageElements';
import { TrendingUp, Users, CreditCard, UserCircle } from 'lucide-react';

const Dashboard = () => {
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [conversionData, setConversionData] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await dashboardAPI.getStats();
        setStats(statsRes.data);

        if (isAdmin) {
          const [monthlyRes, sourceRes, conversionRes, recentRes] = await Promise.all([
            dashboardAPI.getMonthlyLeads(),
            dashboardAPI.getLeadSources(),
            dashboardAPI.getConversionRate(),
            dashboardAPI.getRecentLeads(),
          ]);
          setMonthlyData(monthlyRes.data);
          setSourceData(sourceRes.data);
          setConversionData(conversionRes.data);
          setRecentLeads(recentRes.data);
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [isAdmin]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle={isAdmin ? 'Overview of your CRM performance' : `Welcome, ${user?.name || 'User'}`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: isAdmin ? 8 : user?.role === 'Lead Manager' ? 5 : 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const isLeadManager = user?.role === 'Lead Manager';

  if (!isAdmin) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          subtitle={`Welcome ${user?.name || ''} — ${isLeadManager ? 'your leads overview' : 'your assigned leads overview'}`}
        />

        <PersonalDashboardStats stats={stats} isLeadManager={isLeadManager} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your CRM performance" />

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-secondary-500">Conversion Rate</p>
            <p className="text-2xl font-bold">{stats?.conversionRate || 0}%</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <p className="text-sm text-secondary-500">Total Employees</p>
            <p className="text-2xl font-bold">{stats?.totalEmployees ?? 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-secondary-500">Total Clients</p>
            <p className="text-2xl font-bold">{stats?.totalClients || 0}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-secondary-500">Pending Payments</p>
            <p className="text-2xl font-bold">{stats?.pendingPayments || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <MonthlyLeadsChart data={monthlyData} />
        <LeadSourceChart data={sourceData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ConversionRateChart data={conversionData} />

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Leads</h3>
            <Link to="/leads" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <Link key={lead._id} to={`/leads/${lead._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors">
                <div>
                  <p className="font-medium text-sm">{lead.leadName}</p>
                  <p className="text-xs text-secondary-500">{lead.companyName} · {formatDate(lead.createdAt)}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={lead.status} />
                  <p className="text-xs text-secondary-500 mt-1">{formatCurrency(lead.budget)}</p>
                </div>
              </Link>
            ))}
            {recentLeads.length === 0 && (
              <p className="text-center text-secondary-500 py-8">No leads yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
