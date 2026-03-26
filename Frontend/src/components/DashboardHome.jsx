import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, UserCheck, UserX, Clock, Building } from "lucide-react";

const statsCards = [
  { label: "Total Employees", key: "totalEmployees", color: "#02f5a1" },
  { label: "Present Today", key: "presentToday", color: "#02f5a1" },
  { label: "Absent Today", key: "absentToday", color: "#ef4444" },
  { label: "Pending Leaves", key: "pendingLeaves", color: "#f59e0b" },
  { label: "Departments", key: "totalDepartments", color: "#3b82f6" },
];

const StatCard = ({ label, value, color }) => (
  <div 
    className="relative overflow-hidden rounded-2xl border p-4 shadow-lg"
    style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
  >
    <div 
      className="absolute inset-0 opacity-10"
      style={{ backgroundColor: color }}
    />
    <div className="relative flex flex-col gap-2">
      <p className="text-sm uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value || 0}</p>
    </div>
  </div>
);

const DashboardHome = ({ stats, loading }) => {
  const roleData = stats
    ? [
        { name: "Developers", value: stats.byRole?.developers || 0 },
        { name: "Team Leads", value: stats.byRole?.teamleads || 0 },
        { name: "Managers", value: stats.byRole?.managers || 0 },
        { name: "HR", value: stats.byRole?.hr || 0 },
      ]
    : [];

  const pieData = [
    { name: "Present", value: stats?.presentToday || 0, color: "#02f5a1" },
    { name: "Absent", value: stats?.absentToday || 0, color: "#ef4444" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            />
          ))}
        </div>
        <div className="h-80 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }} />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statsCards.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={stats?.[card.key]}
            color={card.color}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div 
          className="rounded-2xl border p-6 shadow-lg"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Employee Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#02f5a1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div 
          className="rounded-2xl border p-6 shadow-lg"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Today's Attendance</h3>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats?.presentToday || 0}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Present</span>
              </div>
            </div>
            <div className="ml-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#02f5a1' }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>Present: {stats?.presentToday || 0}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>Absent: {stats?.absentToday || 0}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>Total: {stats?.totalEmployees || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHome;
