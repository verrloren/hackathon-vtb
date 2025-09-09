"use client"

import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend } from "@/components/ui/chart"
import type { Version } from "@/shared"
import { mapVersionsToPieDataByMetric } from "@/shared"

export const description = "A pie chart with a legend"

const chartConfig = {
  value: {
    label: "CPU Estimated",
		color: "var(--chart-6)"
  },
} satisfies ChartConfig



export function ChartPieLegend({ versions }: { versions: Version[] }) {

  const chartData = mapVersionsToPieDataByMetric(versions, "cpu_estimated")

  return (
    <Card className="flex flex-col bg-neutral-950 border-none">
      <CardHeader className="items-center pb-0 text-white">
        <CardTitle>CPU Estimated</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square "
        >
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="label">
              {chartData.map((entry, index) => (
                <Cell key={`slice-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={(legendProps) => {
                const payload = (legendProps?.payload ?? []) as Array<
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  { color?: string; payload?: { label?: string } } & Record<string, any>
                >
                return (
                  <div className="-translate-y-2 flex flex-wrap gap-2 *:basis-1/4 *:justify-center text-neutral-400">
                    {payload.map((item, i) => {
                      const color = item.color as string | undefined
                      const label = item?.payload?.label ?? ""
                      return (
                        <div
                          key={`${label}-${i}`}
                          className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-neutral-500 dark:[&>svg]:text-neutral-400"
                        >
                          <div
                            className="h-2 w-2 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: color }}
                          />
                          <span>{label}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              }}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center text-neutral-400"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
