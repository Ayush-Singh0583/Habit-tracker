import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const quotes = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "All big things come from small beginnings.", author: "James Clear" },
  { text: "The chains of habit are too weak to be felt until they are too strong to be broken.", author: "Samuel Johnson" },
  { text: "Make it easy, make it obvious, make it attractive, make it satisfying.", author: "James Clear" }
];

export default function MotivationalQuote() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const storedIdx = parseInt(localStorage.getItem('quoteIdx') || '0');
    const lastDate = localStorage.getItem('quoteDate');
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      const newIdx = (storedIdx + 1) % quotes.length;
      setIdx(newIdx);
      localStorage.setItem('quoteIdx', newIdx);
      localStorage.setItem('quoteDate', today);
    } else {
      setIdx(storedIdx);
    }
  }, []);

  const quote = quotes[idx];

  return (
    <motion.div
      className="card relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
        <Quote size={96} />
      </div>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Quote size={14} className="text-accent" />
        </div>
        <div>
          <p className="text-white/80 text-sm leading-relaxed font-body italic mb-1.5">"{quote.text}"</p>
          <p className="text-white/30 text-xs font-display">— {quote.author}</p>
        </div>
      </div>
    </motion.div>
  );
}
