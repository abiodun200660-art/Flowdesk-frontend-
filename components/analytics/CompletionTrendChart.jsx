'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatDate } from '@/lib/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500 dark:text-gray-400 capitalize">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function CompletionTrendChart({ data = [] }) {

  // Fallback demo data if no data provided
  const chartData = data?.length
    ? data.map((item) => ({
        ...item,
        date: item.date
          ? formatDate(item.date, 'MMM d')
          : item.label || '',
      }))
    : [
        { date: 'Mon', completed: 4,  created: 6  },
        { date: 'Tue', completed: 7,  created: 5  },
        { date: 'Wed', completed: 3,  created: 8  },
        { date: 'Thu', completed: 9,  created: 4  },
        { date: 'Fri', completed: 6,  created: 7  },
        { date: 'Sat', completed: 2,  created: 3  },
        { date: 'Sun', completed: 5,  created: 4  },
      ]

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2d5aff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2d5aff" stopOpacity={0}   />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
            vertical={false}
          />

          <XAxis
            dataKey="date"
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

          <Tooltip content={<CustomTooltip />} />

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          />

          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#completedGradient)"
            dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />

          <Area
            type="monotone"
            dataKey="created"
            name="Created"
            stroke="#2d5aff"
            strokeWidth={2}
            fill="url(#createdGradient)"
            dot={{ fill: '#2d5aff', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}