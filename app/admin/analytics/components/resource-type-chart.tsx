"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface ResourceTypeChartProps {
  data: {
    type: string
    count: number
    label: string
  }[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function ResourceTypeChart({ data }: ResourceTypeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        데이터가 없습니다
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.count,
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [
              `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
              "조회수",
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats List */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.type} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{item.label}</span>
            </div>
            <span className="font-medium">{item.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
