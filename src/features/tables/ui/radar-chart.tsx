"use client"

import { RadialBar, RadialBarChart } from "recharts"

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
  ChartLegend,
} from "@/components/ui/chart"
import type { Version } from "@/shared"
import { mapVersionsToPieDataByMetric } from "@/shared"

export const description = "Memory estimated by version (radial)"

type SimpleProps = { versions: Version[] }

const chartConfig = {
  value: {
    label: "Memory Est.",
		color: "var(--chart-6)",
  },
} satisfies ChartConfig

export function ChartRadialSimple({ versions }: SimpleProps) {
  // Sort ascending so smaller memory sits on inner rings
  const chartData = mapVersionsToPieDataByMetric(versions, "memory_estimated")
    .slice()
    .sort((a, b) => a.value - b.value)

  return (
    <Card className="bg-neutral-950 h-auto border-none">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-white">Memory Estimated</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square rounded-4xl"
        >
          <RadialBarChart data={chartData} innerRadius={30} outerRadius={110}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="label" />}
            />
            <RadialBar
              dataKey="value"
              background={{ fill: "rgb(23 23 23)" }}
            />
            <ChartLegend
              content={(legendProps) => {
                const payload = (legendProps?.payload ?? []) as Array<
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  { color?: string; payload?: { label?: string } } & Record<string, any>
                >
                return (
                  <div className="mt-2 flex flex-wrap gap-2 *:basis-1/4 *:justify-center text-neutral-400">
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
              className="mt-2 flex-wrap gap-2 *:basis-1/4 *:justify-center text-neutral-400"
              verticalAlign="bottom"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
