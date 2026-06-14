import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const COLORS = ['#2563EB', '#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-secondary-800 p-3 rounded-lg shadow-lg border border-secondary-100 dark:border-secondary-700 text-sm">
      <p className="font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
      ))}
    </div>
  );
};

export const MonthlyLeadsChart = ({ data }) => (
  <div className="card">
    <h3 className="text-lg font-semibold mb-4 text-secondary-800 dark:text-secondary-100">Monthly Leads</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
        <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="leads" name="Total Leads" fill="#2563EB" radius={[4, 4, 0, 0]} />
        <Bar dataKey="won" name="Won" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const LeadSourceChart = ({ data }) => (
  <div className="card">
    <h3 className="text-lg font-semibold mb-4 text-secondary-800 dark:text-secondary-100">Lead Sources</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data?.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const ConversionRateChart = ({ data }) => (
  <div className="card">
    <h3 className="text-lg font-semibold mb-4 text-secondary-800 dark:text-secondary-100">Conversion Rate (%)</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
        <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="rate" name="Conversion %" stroke="#06B6D4" strokeWidth={3} dot={{ fill: '#06B6D4', r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
