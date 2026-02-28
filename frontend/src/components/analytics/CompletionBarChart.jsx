import { Bar } from "react-chartjs-2";

export default function CompletionBarChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "Completion %",
        data: data.map((item) => item.completionRate),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderRadius: 8,
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

  return <Bar data={chartData} options={options} />;
}