import Link from 'next/link'
import { Zap, Users, BarChart3, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-powered tasks',
    desc: 'Describe a goal and AI breaks it into actionable subtasks instantly.',
  },
  {
    icon: Users,
    title: 'Real-time collaboration',
    desc: 'See your team\'s updates live — no refresh needed.',
  },
  {
    icon: BarChart3,
    title: 'Professional analytics',
    desc: 'Completion trends, team performance, and heatmaps built in.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'FlowDesk cut our project handoff time in half.',
    name: 'Sarah K.',
    role: 'Engineering Lead',
    initials: 'SK',
    color: 'bg-emerald-500',
  },
  {
    quote: 'The AI task generator alone is worth switching for.',
    name: 'Marcus T.',
    role: 'Product Manager',
    initials: 'MT',
    color: 'bg-violet-500',
  },
]

const STATS = [
  { value: '10k+', label: 'Teams' },
  { value: '2M+',  label: 'Tasks completed' },
  { value: '99.9%', label: 'Uptime' },
]

export default function AuthLayout({ children }) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen flex bg-white dark:bg-surface-900">

      {/* ── Left branding panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] xl:w-2/5 bg-gradient-to-br from-brand-900 via-brand-950 to-surface-950 p-12 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-brand-400/5 blur-2xl" />
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-sm">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">FlowDesk</span>
        </Link>

        {/* Main content */}
        <div className="relative z-10 space-y-10">

          {/* Headline */}
          <div>
            <h2 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Your team&apos;s work,
              <br />
              <span className="text-brand-300">all in one place.</span>
            </h2>
            <p className="text-brand-200 text-base leading-relaxed max-w-sm">
              AI-powered tasks, real-time collaboration, and professional analytics — built for ambitious teams.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} className="text-brand-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-brand-300 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="text-brand-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="space-y-3">
            {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
              <div
                key={name}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
              >
                <p className="text-brand-100 text-sm leading-relaxed mb-3">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{name}</p>
                    <p className="text-brand-400 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <p className="text-brand-500 text-xs relative z-10">
          © {currentYear} FlowDesk. All rights reserved.
        </p>

      </div>

      {/* ── Right form area ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo — hidden on desktop since panel shows it */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-sm">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-gray-900 dark:text-white">
              FlowDesk
            </span>
          </Link>

          {/* Page content */}
          {children}

          {/* Mobile footer */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-10 lg:hidden">
            © {currentYear} FlowDesk. All rights reserved.
          </p>

        </div>
      </div>

    </div>
  )
}