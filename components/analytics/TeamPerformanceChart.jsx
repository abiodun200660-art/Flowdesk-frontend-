'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getInitials, stringToColor } from '@/lib/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
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

const PriorityTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.payload.color }} />
        <span className="font-semibold text-gray-900 dark:text-white capitalize">
          {item.name}
        </span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mt-1">
        {item.value} tasks ({item.payload.percentage}%)
      </p>
    </div>
  )
}

// Priority breakdown chart
function PriorityChart({ data }) {
  const PRIORITY_COLORS = {
    critical: '#f43f5e',
    high:     '#f97316',
    medium:   '#f59e0b',
    low:      '#10b981',
  }

  const chartData = data?.length
    ? data.map((item) => ({
        name:       item.name || item.priority,
        value:      item.count || item.value || 0,
        color:      PRIORITY_COLORS[item.name?.toLowerCase()] || '#2d5aff',
        percentage: item.percentage || 0,
      }))
    : [
        { name: 'Critical', value: 5,  color: '#f43f5e', percentage: 14 },
        { name: 'High',     value: 10, color: '#f97316', percentage: 28 },
        { name: 'Medium',   value: 15, color: '#f59e0b', percentage: 42 },
        { name: 'Low',      value: 6,  color: '#10b981', percentage: 16 },
      ]

  const total = chartData.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="flex items-center gap-6">
      {/* Pie */}
      <div className="flex-shrink-0" style={{ width: 160, height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.9} />
              ))}
            </Pie>
            <Tooltip content={<PriorityTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-surface-700 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width:           `${(item.value / total) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-white w-6 text-right">
                {item.value}
              </span>
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-400 mt-1">Total: {total} tasks</p>
      </div>
    </div>
  )
}

// Team performance bar chart
function TeamChart({ data }) {
  const chartData = data?.length
    ? data.map((item) => ({
        name:       item.name?.split(' ')[0] || 'User',
        fullName:   item.name || 'User',
        completed:  item.completed  || 0,
        inProgress: item.inProgress || item.in_progress || 0,
        overdue:    item.overdue    || 0,
      }))
    : [
        { name: 'Alice',   fullName: 'Alice',   completed: 12, inProgress: 3, overdue: 1 },
        { name: 'Bob',     fullName: 'Bob',     completed: 8,  inProgress: 5, overdue: 2 },
        { name: 'Carol',   fullName: 'Carol',   completed: 15, inProgress: 2, overdue: 0 },
        { name: 'David',   fullName: 'David',   completed: 6,  inProgress: 4, overdue: 3 },
        { name: 'Eve',     fullName: 'Eve',     completed: 10, inProgress: 6, overdue: 1 },
      ]

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          barCategoryGap="25%"
          barGap={2}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
            vertical={false}
          />
          <XAxis
            dataKey="name"
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
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          />
          <Bar
            dataKey="completed"
            name="Completed"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={20}
            fillOpacity={0.9}
          />
          <Bar
            dataKey="inProgress"
            name="In Progress"
            fill="#2d5aff"
            radius={[4, 4, 0, 0]}
            maxBarSize={20}
            fillOpacity={0.9}
          />
          <Bar
            dataKey="overdue"
            name="Overdue"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
            maxBarSize={20}
            fillOpacity={0.9}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function TeamPerformanceChart({ data = [], type = 'team' }) {
  if (type === 'priority') {
    return <PriorityChart data={data} />
  }
  return <TeamChart data={data} />
}