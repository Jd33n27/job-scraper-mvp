import React, { useState, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import SalaryDashboard from "../components/SalaryDashboard";
import { BarChart3, TrendingUp } from "lucide-react";
import { API_BASE_URL } from "../config";

const MatchAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/stats/matching`,
        );
        const matchData = await response.json();

        // Fetch general stats for salary info
        await fetch(`${API_BASE_URL}/stats`);

        // Fetch recommended jobs for scatter data
        const jobsResponse = await fetch(
          `${API_BASE_URL}/jobs/recommended`,
        );
        const jobs = await jobsResponse.json();

        if (jobsResponse.status === 404 || jobs.error) {
          setData({
            distribution: matchData.score_distribution,
            scatter: [],
            averageSalary: 0,
            medianSalary: 0,
            salaryData: [],
          });
          return;
        }

        const scatterData = jobs
          .filter((j: any) => j.salary_min && j.match.score > 0)
          .map((j: any) => ({
            name: j.title,
            score: j.match.score,
            salary: j.salary_min / 1000,
            company: j.company,
          }));

        setData({
          distribution: matchData.score_distribution,
          scatter: scatterData,
          averageSalary: 85000, // Mocked for demo
          medianSalary: 78000, // Mocked for demo
          salaryData: [
            { range: "<40k", count: 5 },
            { range: "40-70k", count: 15 },
            { range: "70-100k", count: 25 },
            { range: "100-130k", count: 10 },
            { range: ">130k", count: 4 },
          ],
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !data) return null;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Intelligence Dashboard
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Detailed analysis of market alignment and job matching scores.
        </p>
      </div>

      {/* Salary Overview */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Market Salary Insights
          </h2>
        </div>
        <SalaryDashboard
          data={data.salaryData}
          average={data.averageSalary}
          median={data.medianSalary}
        />
      </section>

      {/* Scatter Chart: Score vs Salary */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Salary vs. Match Score
          </h2>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  type="number"
                  dataKey="score"
                  name="Match Score"
                  unit="%"
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Match Score (%)",
                    position: "bottom",
                    offset: 0,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="salary"
                  name="Salary"
                  unit="k"
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Salary ($k)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <ZAxis type="number" range={[100, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.company}
                          </p>
                          <div className="flex justify-between gap-8 text-sm">
                            <span>
                              Score:{" "}
                              <span className="font-bold text-blue-600">
                                {item.score}%
                              </span>
                            </span>
                            <span>
                              Salary:{" "}
                              <span className="font-bold text-green-600">
                                ${item.salary}k
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Jobs" data={data.scatter} fill="#3b82f6">
                  {data.scatter.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score > 70 ? "#10b981" : "#3b82f6"}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MatchAnalytics;
