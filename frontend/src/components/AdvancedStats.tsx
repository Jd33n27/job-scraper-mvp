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

const COLORS = ["#22d3ee", "#8b5cf6", "#10b981", "#3b82f6", "#f43f5e"];

const AdvancedStats: React.FC<AdvancedStatsProps> = ({
  bySource,
  byLocation,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-6">
          Jobs by Source
        </h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={bySource} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
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

      <div>
        <h3 className="text-base font-bold text-slate-100 mb-6">
          Location Breakdown
        </h3>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={byLocation}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                stroke="none"
              >
                {byLocation.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "#0f172a",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats;
