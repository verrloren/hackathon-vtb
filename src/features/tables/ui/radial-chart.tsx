"use client"

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

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

export const description = "Versions and memory (stacked radial)"

type Props = { versions: Version[] }

const chartConfig = {
  versions: {
    label: "Versions",
    color: "var(--chart-4)",
  },
  memory: {
    label: "Memory Est.",
    color: "var(--chart-6)",
  },
} satisfies ChartConfig

export function ChartRadialStacked({ versions }: Props) {
  const versionsCount = versions.length
  const memoryTotal = versions.reduce((acc, v) => {
    const m = Array.isArray(v.metrics) ? v.metrics[0] : undefined;
    return acc + (m?.memory_estimated ?? 0);
  }, 0)

  const chartData = [{ key: "all", versions: versionsCount, memory: memoryTotal }]

  return (
    <Card className="bg-neutral-950 border-none h-full ">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-white">Versions × Memory</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="!bg-neutral-950 !border-neutral-800 !text-neutral-50 [&_*]:!text-neutral-200"
                />
              }
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                className="!text-white"
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" className="!text-white">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 18}
                          className="fill-foreground text-xl font-bold !text-white"
                        >
                          {versionsCount.toLocaleString()} versions
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 6}
                          className="fill-muted-foreground"
                        >
                          {memoryTotal.toLocaleString()} memory
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="versions"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-versions)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="memory"
              fill="var(--color-memory)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
