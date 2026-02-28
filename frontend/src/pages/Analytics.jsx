import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { analyticsAPI } from "../services/api";
import { pageTransition, staggerItem } from "../animations/variants";
import Heatmap from "../components/analytics/Heatmap";
import { SkeletonCard } from "../components/ui/Skeleton";

/* Doughnut chart styling */
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "70%",
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "rgba(255,255,255,0.6)",
        padding: 16,
      },
    },
  },
};

/* Bar chart styling */
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      ticks: { color: "rgba(255,255,255,0.6)" },
      grid: { display: false },
    },
    y: {
      ticks: { color: "rgba(255,255,255,0.6)" },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
  },
};

/* Line chart styling */
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "rgba(255,255,255,0.4)" },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "rgba(255,255,255,0.4)" },
    },
  },
};

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitDetails, setHabitDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmapWeeks, setHeatmapWeeks] = useState(13);

  useEffect(() => {
    analyticsAPI
      .getAll()
      .then(({ data }) => {
        setAnalyticsData(data.analytics || []);
        if (data.analytics?.length > 0)
          setSelectedHabit(data.analytics[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedHabit) return;

    analyticsAPI
      .getHabit(selectedHabit.habitId, { weeks: heatmapWeeks })
      .then(({ data }) => setHabitDetails(data.analytics));
  }, [selectedHabit, heatmapWeeks]);

  /* Sort habits by completionRate descending */
  const sortedData = [...analyticsData].sort(
    (a, b) => b.completionRate - a.completionRate
  );

  /* Doughnut Data (Distribution by completion rate) */
  const pieData =
    sortedData.length > 0
      ? {
          labels: sortedData.map((a) => a.name),
          datasets: [
            {
              data: sortedData.map((a) => a.completionRate),
              backgroundColor: sortedData.map((a) => a.color),
              borderColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              hoverOffset: 8,
            },
          ],
        }
      : null;

  /* Bar Data (Comparison side-by-side) */
  const barData =
    sortedData.length > 0
      ? {
          labels: sortedData.map((a) => a.name),
          datasets: [
            {
              label: "Completion %",
              data: sortedData.map((a) => a.completionRate),
              backgroundColor: sortedData.map((a) => a.color + "cc"),
              borderRadius: 6,
            },
          ],
        }
      : null;

  /* Line Chart Data */
  const lineData =
    habitDetails?.weeklyTrend
      ? {
          labels: habitDetails.weeklyTrend.map((w) =>
            w.week.slice(5)
          ),
          datasets: [
            {
              label: "Completion %",
              data: habitDetails.weeklyTrend.map((w) => w.rate),
              borderColor: selectedHabit?.color || "#818cf8",
              backgroundColor:
                (selectedHabit?.color || "#818cf8") + "20",
              borderWidth: 2,
              pointRadius: 4,
              fill: true,
              tension: 0.4,
            },
          ],
        }
      : null;

  return (
    <motion.div {...pageTransition} className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Analytics
        </h1>
        <p className="text-white/40 text-sm">
          Track your progress over time
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : analyticsData.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-semibold text-white mb-1">
            No data yet
          </h3>
          <p className="text-white/40 text-sm">
            Start logging habits to see analytics
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Doughnut Distribution */}
          <motion.div {...staggerItem} className="card">
            <h2 className="font-semibold text-white mb-6">
              Completion Distribution
            </h2>
            {pieData && (
              <div className="h-64">
                <Doughnut data={pieData} options={doughnutOptions} />
              </div>
            )}
          </motion.div>

          {/* Bar Comparison */}
          <motion.div {...staggerItem} className="card">
            <h2 className="font-semibold text-white mb-6">
              Completion Comparison
            </h2>
            {barData && (
              <div className="h-64">
                <Bar data={barData} options={barOptions} />
              </div>
            )}
          </motion.div>

          {/* Weekly Trend */}
          {selectedHabit && lineData && (
            <div className="card">
              <h3 className="font-semibold text-white mb-4">
                Weekly Trend
              </h3>
              <div className="h-40">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          )}

          {/* Heatmap */}
          {selectedHabit && (
            <div className="card">
              <Heatmap
                data={habitDetails?.heatmapData || {}}
                color={selectedHabit.color}
                weeks={heatmapWeeks}
              />
            </div>
          )}

        </div>
      )}
    </motion.div>
  );
}