'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2 truncate max-w-[160px]">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500 dark:text-gray-400 capitalize">
            {entry.name}:
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

const COLORS = [
  '#2d5aff', '#8b5cf6', '#10b981', '#f59e0b',
  '#f43f5e', '#00d9ff', '#ec4899', '#14b8a6',
]

export default function ProjectVelocityChart({ data = [] }) {

  // Fallback demo data
  const chartData = data?.length
    ? data.map((item) => ({
        name:       item.name       || item.project || 'Project',
        completed:  item.completed  || 0,
        inProgress: item.inProgress || item.in_progress || 0,
        total:      item.total      || 0,
        velocity:   item.velocity   || item.completed || 0,
      }))
    : [
        { name: 'Website',    completed: 12, inProgress: 4, velocity: 12 },
        { name: 'Mobile App', completed: 8,  inProgress: 6, velocity: 8  },
        { name: 'Backend',    completed: 15, inProgress: 2, velocity: 15 },
        { name: 'Marketing',  completed: 5,  inProgress: 3, velocity: 5  },
        { name: 'Design',     completed: 9,  inProgress: 5, velocity: 9  },
      ]

  // Truncate long project names
  const formatted = chartData.map((item) => ({
    ...item,
    shortName: item.name.length > 12 ? item.name.slice(0, 12) + '…' : item.name,
  }))

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formatted}
          margin={{ top: 16, right: 5, left: -20, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
            vertical={false}
          />

          <XAxis
            dataKey="shortName"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,90,255,0.05)' }} />

          <Bar
            dataKey="velocity"
            name="Tasks completed"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          >
            {formatted.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.85}
              />
            ))}
            <LabelList
              dataKey="velocity"
              position="top"
              style={{ fontSize: '10px', fill: '#9ca3af', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}