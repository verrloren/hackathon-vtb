"use client"

import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Version } from "@/shared"
import { mapVersionsToBarDataByMetric } from "@/shared"

export const description = "Versions vs memory_estimated (horizontal bars)"

const chartConfig = {
  value: {
    label: "Memory Est.",
  },
} satisfies ChartConfig

export function ChartBar({ versions }: { versions: Version[] }) {
  const chartData = mapVersionsToBarDataByMetric(versions, "memory_estimated", {
    sortByDate: "desc",
    filterEmpty: true,
  })
  return (
    <Card className="bg-neutral-950 border-none h-full ">
      <CardHeader>
        <CardTitle className="text-white">Total Cost</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical" // horizontal bars
            margin={{ left: 0 }}
          >
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis dataKey="value" type="number" />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent className="!bg-neutral-950 !border-neutral-800 !text-neutral-50 [&_*]:!text-neutral-200" />
              }
            />
            <Bar dataKey="value" layout="vertical" radius={5}>
              {chartData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
