import type { Version, Metrics } from "@/shared/model/types";

export type VersionBarDatum = {
  id: string;
  label: string; // commit hash or date
  value: number; // metrics.total_cost
  fill: string; // css color var used by Recharts
};

// Map versions to vertical BarChart-friendly data using metrics.total_cost
export function mapVersionsToBarData(versions: Version[]): VersionBarDatum[] {
  const palette = [
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
  ];

  const items = (versions ?? []).map((v, i) => {
    const m = Array.isArray(v.metrics) ? v.metrics[0] : undefined;
    const value = Number(m?.total_cost ?? 0);
    const label = v.commit_hash || (v.created_at ? String(v.created_at).slice(0, 10) : v.id);
    return {
      id: v.id,
      label,
      value,
      fill: palette[i % palette.length],
    } satisfies VersionBarDatum;
  });
  return items;
}

// Same set of metric keys as used in pie mappers
type MetricKey = keyof Pick<
  Metrics,
  "total_cost" | "rows_estimated" | "io_estimated" | "cpu_estimated" | "memory_estimated" | "limit_value"
>;

// Map versions to BarChart data for a given metric, optionally sorting by creation date
export function mapVersionsToBarDataByMetric(
  versions: Version[],
  metric: MetricKey,
  options?: { sortByDate?: "asc" | "desc"; filterEmpty?: boolean }
): VersionBarDatum[] {
  const palette = [
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
  ];

  const filterEmpty = options?.filterEmpty ?? true;
  const sortOrder = options?.sortByDate ?? "asc";

  const base = (versions ?? []).filter((v) => {
    const m = Array.isArray(v.metrics) ? (v.metrics[0] as Partial<Metrics> | undefined) : undefined;
    const val = Number((m?.[metric] as number | undefined) ?? NaN);
    return filterEmpty ? Number.isFinite(val) : true;
  });

  base.sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    return sortOrder === "asc" ? ta - tb : tb - ta;
  });

  return base.map((v, i) => {
    const m = Array.isArray(v.metrics) ? (v.metrics[0] as Partial<Metrics> | undefined) : undefined;
    const value = Number((m?.[metric] as number | undefined) ?? 0);
    const label = v.commit_hash || (v.created_at ? String(v.created_at).slice(0, 10) : v.id);
    return {
      id: v.id,
      label,
      value,
      fill: palette[i % palette.length],
    } satisfies VersionBarDatum;
  });
}

export type VersionPieDatum = {
  label: string;
  value: number;
  fill: string;
};

export function mapVersionsToPieData(versions: Version[]): VersionPieDatum[] {
  const palette = [
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
    "var(--chart-9)",
    "var(--chart-10)",
  ];

  return (versions ?? []).map((v, i) => {
    const m = Array.isArray(v.metrics) ? v.metrics[0] : undefined;
    const value = Number(m?.total_cost ?? 0);
    const label = v.commit_hash || (v.created_at ? String(v.created_at).slice(0, 10) : v.id);
    return {
      label,
      value,
      fill: palette[i % palette.length],
    };
  });
}

// MetricKey used above

export function mapVersionsToPieDataByMetric(
  versions: Version[],
  metric: MetricKey
): VersionPieDatum[] {
  const palette = [
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
  ];

  return (versions ?? []).map((v, i) => {
    const m = Array.isArray(v.metrics) ? (v.metrics[0] as Partial<Metrics> | undefined) : undefined;
    const value = Number((m?.[metric] as number | undefined) ?? 0);
    const label = v.commit_hash || (v.created_at ? String(v.created_at).slice(0, 10) : v.id);
    return {
      label,
      value,
      fill: palette[i % palette.length],
    };
  });
}

// Optional: compute a normalized color intensity based on total_cost
export function mapVersionsToBarDataScaled(
  versions: Version[],
  options?: { minColor?: string; maxColor?: string }
): VersionBarDatum[] {
  const arr = mapVersionsToBarData(versions);
  const values = arr.map((d) => d.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = Math.max(max - min, 1);

  // If custom colors are provided, interpolate between them with CSS color-mix.
  // Otherwise, vary only the alpha of a fixed HSL color.
  const minColor = options?.minColor ?? "hsl(210deg 90% 60% / 30%)";
  const maxColor = options?.maxColor ?? "hsl(210deg 90% 60% / 100%)";
  const useColorMix = Boolean(options?.minColor || options?.maxColor);

  // Simple linear interpolation between two rgba/hsl strings is non-trivial without a color lib.
  // As a lightweight alternative, vary only the alpha channel from 0.3 -> 1.0 on a fixed hue.
  return arr.map((d) => {
    const tRaw = (d.value - min) / range; // 0..1
    const t = isFinite(tRaw) ? Math.min(1, Math.max(0, tRaw)) : 0;
    if (useColorMix) {
      const a = (100 * (1 - t)).toFixed(1);
      const b = (100 * t).toFixed(1);
      return {
        ...d,
        fill: `color-mix(in oklab, ${minColor} ${a}%, ${maxColor} ${b}%)`,
      };
    }
    const alpha = (0.3 + 0.7 * t).toFixed(3);
    return {
      ...d,
      fill: `hsl(210deg 90% 60% / ${alpha})`,
    };
  });
}
