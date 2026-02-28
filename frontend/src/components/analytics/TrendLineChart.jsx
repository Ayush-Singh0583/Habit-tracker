import { Line } from "react-chartjs-2";

export default function TrendLineChart({ trendData }) {
  const chartData = {
    labels: trendData.map((d) => d.date),
    datasets: [
      {
        label: "Daily Intensity",
        data: trendData.map((d) => d.value),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
  },

  // 👇 ADD IT HERE
  scales: {
    x: {
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(148,163,184,0.1)" },
    },
    y: {
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(148,163,184,0.1)" },
    },
  },
};
  return <Line data={chartData} options={options} />;
}