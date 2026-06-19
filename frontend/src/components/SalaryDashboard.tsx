import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SalaryStat {
  range: string;
  count: number;
}

interface SalaryDashboardProps {
  data: SalaryStat[];
  average: number;
  median: number;
}

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

const SalaryDashboard: React.FC<SalaryDashboardProps> = ({ data, average, median }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Metrics */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Average Salary</p>
          <h3 className="text-3xl font-bold text-gray-900">${(average / 1000).toFixed(1)}k</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Median Salary</p>
          <h3 className="text-3xl font-bold text-gray-900">${(median / 1000).toFixed(1)}k</h3>
        </div>
      </div>

      {/* Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Salary Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalaryDashboard;
