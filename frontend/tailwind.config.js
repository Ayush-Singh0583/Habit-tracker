/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        surface: {
          0: '#08090e',
          1: '#0e0f17',
          2: '#13141f',
          3: '#191b28',
          4: '#20223a'
        },
        border: 'rgba(255,255,255,0.07)',
        accent: {
          DEFAULT: '#818cf8',
          dim: '#4f46e5',
          glow: 'rgba(129,140,248,0.15)'
        }
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'radial-accent': 'radial-gradient(ellipse at top, rgba(99,102,241,0.15) 0%, transparent 70%)'
      },
      boxShadow: {
        'glass': '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.4)',
        'glow': '0 0 20px rgba(129,140,248,0.3)',
        'glow-sm': '0 0 10px rgba(129,140,248,0.2)'
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: []
};
