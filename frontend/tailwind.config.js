/** Masar design tokens → Tailwind. Colors are CSS variables (see src/index.css) so light/dark switch instantly. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'var(--navy)',
        'navy-ink': 'var(--navy-ink)',
        steel: 'var(--steel)',
        accent: 'var(--accent)',
        'on-accent': 'var(--on-accent)',
        canvas: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--border)',
        'line-soft': 'var(--border-soft)',
        ink: 'var(--text)',
        'ink-soft': 'var(--text-soft)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        heading: 'var(--heading)',
        'on-navy': 'var(--on-navy)',
        'on-navy-soft': 'var(--on-navy-soft)',
        good: 'var(--good)', 'good-soft': 'var(--good-soft)',
        warn: 'var(--warn)', 'warn-soft': 'var(--warn-soft)',
        bad: 'var(--bad)', 'bad-soft': 'var(--bad-soft)',
        info: 'var(--info)', 'info-soft': 'var(--info-soft)',
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['"Public Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { card: '18px' },
      boxShadow: { card: 'var(--shadow-card)', pop: 'var(--shadow-pop)' },
    },
  },
  plugins: [],
};
