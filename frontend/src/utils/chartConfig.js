import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,      // 🔥 REQUIRED for Doughnut
  Tooltip,
  Legend,
  Title,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,      // 🔥 register it
  Tooltip,
  Legend,
  Title,
  Filler
);