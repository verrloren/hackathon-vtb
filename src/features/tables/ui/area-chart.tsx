"use client";

import { CartesianGrid, XAxis, YAxis, AreaChart, Area } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { Version as VersionType } from "@/shared";

export const description = "Versions on X-axis, io_estimated on Y-axis (area)";

type ChartAreaGradientProps = {
  versions: VersionType[];
};

// Configure a single series for io_estimated with a CSS color variable
const chartConfig = {
  io: {
    label: "IO Estimated",
    color: "var(--chart-6)",
  },
} satisfies ChartConfig;

// function severityToScore(sev?: string | null): number {
//   const s = (sev ?? "").toString().toLowerCase().trim();
//   if (s === "error" || s === "ошибка" || s === "err") return 4;
//   if (s === "critical" || s === "критическая" || s === "критичный" || s === "crit") return 4;
//   if (s === "high" || s === "высокая" || s === "высокий") return 3;
//   if (s === "medium" || s === "moderate" || s === "средняя" || s === "средний") return 2;
//   if (s === "low" || s === "низкая" || s === "низкий") return 1;
//   const num = Number(s);
//   return Number.isFinite(num) ? (num as number) : 0;
// }

function versionLabel(v: VersionType): string {
  const label = v.commit_hash ? String(v.commit_hash).trim() : "";
  return label.length > 0 ? label : "Unnamed version";
}

export function ChartAreaGradient({ versions }: ChartAreaGradientProps) {
  // Filter to usable versions and order by creation date (left -> right)
  const filteredSorted = (versions ?? [])
    .filter((v) => {
      const hasMetrics = Array.isArray(v.metrics) && v.metrics.length > 0;
      const statusOk = (v.status || "") === "completed";
      return hasMetrics && statusOk;
    })
    .sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  // Build one row per version for X-axis and plot io_estimated on Y-axis
  const data = filteredSorted.map((v) => {
    const label = versionLabel(v);
    const m = Array.isArray(v.metrics) ? v.metrics[0] : undefined;
    return {
      label,
      io: Number(m?.io_estimated ?? 0),
    } as const;
  });

  return (
    <Card className="bg-neutral-950 h-auto border-none">
      <CardHeader>
        <CardTitle className="text-white">IO Estimated</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="rounded-4xl" config={chartConfig}>
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillIo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-io)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-io)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-800" />
            {/* X shows versions; Y shows io_estimated */}
            <XAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent className="!bg-neutral-950 !border-neutral-800 !text-neutral-50 [&_*]:!text-neutral-200" />
              }
            />
            <Area
              type="monotone"
              dataKey="io"
              name="IO Estimated"
              stroke="var(--color-io)"
              fillOpacity={1}
              fill="url(#fillIo)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium text-neutral-600">
          Versions on X; IO on Y <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
