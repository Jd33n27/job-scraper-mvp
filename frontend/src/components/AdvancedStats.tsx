import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface GenericStat {
  name: string;
  count: number;
}

interface AdvancedStatsProps {
  bySource: GenericStat[];
  byLocation: GenericStat[];
}

const COLORS = ["#1A3026", "#C86A51", "#4A5F56", "#E8EFE9", "#DCD5CB"];

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ bySource, byLocation }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
      {/* Jobs by Source */}
      <div className="py-2">
        <h3 className="text-base font-serif font-black text-brand-forest mb-6">Jobs by Source</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySource} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#FAF7F2" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fontSize: 11, fontWeight: 600, fill: "#14221D" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(232, 239, 233, 0.3)" }}
                contentStyle={{ borderRadius: "12px", border: "1px solid #DCD5CB", backgroundColor: "#FAF7F2", boxShadow: "0 4px 15px rgba(26, 48, 38, 0.05)" }}
              />
              <Bar dataKey="count" fill="#C86A51" radius={[0, 4, 4, 0]} barSize={16}>
                {(bySource || []).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Jobs by Location Group */}
      <div className="py-2">
        <h3 className="text-base font-serif font-black text-brand-forest mb-6">Location Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byLocation}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {byLocation.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #DCD5CB", backgroundColor: "#FAF7F2", boxShadow: "0 4px 15px rgba(26, 48, 38, 0.05)" }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats;
