"use client";


import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DotsVerticalIcon } from "@radix-ui/react-icons";

import { CardBody, CardContainer, CardItem } from "./3d-card";
import styles from "@/features/projects/ui/project-card.module.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  spinTransition,
} from "@/shared";
import { EditProjectSheet, DeleteProjectDialog, useProjectsStore } from "@/features/projects";
import { Project, Table, Version, Metrics } from "@/shared";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, Database, AlertTriangle, CalendarDays } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  status: Table["status"] | "completed"; // derived from tables
}

export function ProjectCard({ project, status }: ProjectCardProps) {
  const selectProject = useProjectsStore((state) => state.setSelectedProject);

  // Lock the card only when pending; show inline spinner for processing
  const isBusy = status === "pending";
  const isError = status === "error";
  const tablesCount = project.tables?.length ?? 0;
  const versionsCount = (project.tables ?? []).reduce(
    (acc, t) => acc + (t.versions?.length ?? 0),
    0
  );
  const hasProcessing = (project.tables ?? []).some(
    (t) => t.status === "processing" || (t.versions ?? []).some((v) => v.status === "processing")
  );

  // Helpers
  const parseDate = (d?: string | null) => (d ? new Date(d) : undefined);
  const latestVersionForTable = (t?: Table): Version | undefined => {
    const vs = t?.versions ?? [];
    if (!vs.length) return undefined;
    const sorted = [...vs].sort((a, b) => {
      const ad = parseDate(a.updated_at) ?? parseDate(a.created_at) ?? new Date(0);
      const bd = parseDate(b.updated_at) ?? parseDate(b.created_at) ?? new Date(0);
      return bd.getTime() - ad.getTime();
    });
    const hasUsefulMetrics = (v: Version) => {
      const arr = Array.isArray(v.metrics) ? v.metrics : [];
      return arr.some((m) => {
        const rows = Number(m?.rows_estimated ?? NaN);
        const io = Number(m?.io_estimated ?? NaN);
        return Number.isFinite(rows) || Number.isFinite(io);
      });
    };
    return sorted.find(hasUsefulMetrics) ?? sorted[0];
  };
  const latestMetrics: Metrics[] = (project.tables ?? [])
    .map((t) => latestVersionForTable(t))
    .filter(Boolean)
    .flatMap((v) => (Array.isArray(v!.metrics) ? (v!.metrics as Metrics[]) : []));

  // 2) Average and max total_cost (last versions only)
  const costs = latestMetrics
    .map((m) => Number(m.total_cost ?? 0))
    .filter((n) => Number.isFinite(n));
  const maxCost = costs.length ? Math.max(...costs) : 0;
  const avgCost = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;
  const avgPct = maxCost > 0 ? Math.min(100, Math.max(0, (avgCost / maxCost) * 100)) : 0;

  // 3) Risks and warnings: unique risk_flags + severity
  const riskTokens = new Set<string>();
  const severityTokens = new Set<string>();
  latestMetrics.forEach((m) => {
    const rf = (m.risk_flags ?? "").toString();
    // split on comma/space/semicolon
    rf
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((tok) => riskTokens.add(tok));
    const sev = (m.severity ?? "").toString().trim();
    if (sev) severityTokens.add(sev);
  });

  // 4) Data volume: sum rows_estimated + io_estimated (last versions)
  const sumRows = latestMetrics
    .map((m) => Number(m.rows_estimated ?? 0))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => a + b, 0);
  const sumIO = latestMetrics
    .map((m) => Number(m.io_estimated ?? 0))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => a + b, 0);
  // Preserve visibility for tiny non-zero shares: don't round down to 0%
  const ioSharePctRaw = sumRows + sumIO > 0 ? (sumIO / (sumRows + sumIO)) * 100 : 0;
  const ioSharePct = ioSharePctRaw > 0 && ioSharePctRaw < 1 ? 1 : Math.round(ioSharePctRaw);

  // 5) Activity: latest updated_at and changes in last X days
  const WINDOW_DAYS = 7;
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const dates: Date[] = [];
  const pushDate = (d?: string | null) => {
    const dt = parseDate(d);
    if (dt) dates.push(dt);
  };
  pushDate(project.updated_at);
  (project.tables ?? []).forEach((t) => {
    pushDate(t.updated_at);
    (t.versions ?? []).forEach((v) => {
      pushDate(v.updated_at);
    });
  });
  const lastUpdated = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined;
  const changesInWindow = (project.tables ?? []).reduce((acc, t) => {
    const countV = (t.versions ?? []).filter((v) => {
      const d = parseDate(v.updated_at) ?? parseDate(v.created_at);
      return d ? d >= since : false;
    }).length;
    return acc + countV;
  }, 0);

  const fmtNumber = (n: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n);
  const fmtDate = (d?: Date) => (d ? d.toLocaleDateString() : "–");

  // Map various severity tokens (en/ru/numeric) to a pretty label + colors
  function prettySeverity(raw?: string) {
    const s = (raw ?? "").toString().trim().toLowerCase();
    // Normalize common variants
    const isError = ["error", "ошибка", "err"].includes(s);
    const isCritical = ["critical", "критическая", "критичный", "crit", "4"].includes(s);
    const isHigh = ["high", "высокая", "высокий", "3"].includes(s);
    const isMedium = ["medium", "moderate", "средняя", "средний", "2"].includes(s);
    const isLow = ["low", "низкая", "низкий", "1"].includes(s);

    if (isError)
      return {
        label: "Severity Error",
        className: "bg-red-500/10 text-red-300 border-red-500/30",
      } as const;
    if (isCritical)
      return {
        label: "Severity Critical",
        className:
          "bg-red-500/10 text-red-300 border-red-500/30",
      } as const;
    if (isHigh)
      return {
        label: "Severity High",
        className:
          "bg-orange-500/10 text-orange-300 border-orange-500/30",
      } as const;
    if (isMedium)
      return {
        label: "Severity Medium",
        className:
          "bg-amber-500/10 text-amber-300 border-amber-500/30",
      } as const;
    if (isLow)
      return {
        label: "Severity Low",
        className:
          "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      } as const;

    // Fallback: show as-is, neutral chip
    return {
      label: raw ? `Severity ${raw}` : "–",
      className: "bg-neutral-800 text-neutral-300 border-neutral-700",
    } as const;
  }

  return (
    <CardContainer className="inter-var w-full" containerClassName="py-0 my-0">
      <CardBody
        className={`relative group/card w-full h-full rounded-2xl px-8 py-8 ${styles.glass}`}>
        {isBusy ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-row items-center gap-x-3">
              <span className={`text-lg lg:text-lg text-neutral-600 ${isError ? "text-red-500" : ""}`}>
                {project.name}
              </span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={spinTransition}
                className="w-3 h-3 mt-[7px] rounded-full border-2 border-neutral-600 border-t-transparent"
              />
            </div>
          </div>
        ) : (
          <>
            <CardItem translateZ={50} className="flex flex-row items-center justify-between w-full gap-x-3 px-4">
              <div className="flex flex-row items-center gap-x-4">
								<Link
									href={`/${project.id}`}
									onClick={(e) => {
										if (isBusy) {
											e.preventDefault();
											return;
										}
										selectProject(project);
									}}
									className={`text-3xl 2xl:text-4xl ${
										isBusy ? "hover:no-underline cursor-default" : "hover:underline cursor-pointer text-white"
									} ${isError ? "text-red-500" : ""}`}
								>
									{project.name}
								</Link>

								{hasProcessing && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={spinTransition}
                  className="w-3 h-3 mt-[7px] rounded-full border-2 border-neutral-600 border-t-transparent"
                />
              )}
															{isError && (
									<div className="w-2 h-2 mt-[7px] rounded-full bg-red-600" />
								)}
              </div>

							<div className="pt-2 flex flex-row items-start gap-x-4">
                <p className="flex items-center gap-x-2 text-sm text-neutral-500">
                  {tablesCount} {tablesCount === 1 ? "table" : "tables"}
                </p>
                <p className="flex items-center gap-x-2 text-sm text-neutral-500">
                  {versionsCount} {versionsCount === 1 ? "version" : "versions"}
                </p>
              </div>


              {/* Status label removed to avoid redundant check in non-busy state */}
            </CardItem>

            <CardItem translateZ={30} className="w-full flex items-start gap-x-8 mt-8">

              {/* Metrics summary row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 w-full">
                {/* 2. Cost */}
                <div className="rounded-xl px-3 py-3 border border-neutral-800/70 bg-neutral-900/30 text-neutral-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wide text-neutral-400">Cost</span>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                            <Zap className="w-3.5 h-3.5 text-yellow-400" /> {fmtNumber(maxCost)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Max total_cost across last versions</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-yellow-400"
                      style={{ width: `${avgPct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                    <span>avg {fmtNumber(avgCost)}</span>
                    <span className="flex items-center gap-1">
                      ⚡<span>{fmtNumber(maxCost)}</span>
                    </span>
                  </div>
                </div>

                {/* 3. Risks */}
                <div className="rounded-xl px-3 py-3 border border-neutral-800/70 bg-neutral-900/30 text-neutral-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wide text-neutral-400">Risks</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {Array.from(riskTokens).slice(0, 3).map((r) => (
                      <span
                        key={r}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700"
                        title={r}
                      >
                        {r}
                      </span>
                    ))}
                    {riskTokens.size > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                        +{riskTokens.size - 3}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {Array.from(severityTokens).length ? (
                      Array.from(severityTokens).map((sev) => {
                        const p = prettySeverity(sev);
                        return (
                          <span
                            key={sev}
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${p.className}`}
                            title={String(sev)}
                          >
                            {p.label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[11px] text-neutral-400">–</span>
                    )}
                  </div>
                </div>

                {/* 4. Data volume */}
                <div className="rounded-xl px-3 py-3 border border-neutral-800/70 bg-neutral-900/30 text-neutral-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wide text-neutral-400">Data</span>
                    <Database className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-400"
                      style={{ width: `${ioSharePct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                    <span>rows {fmtNumber(sumRows)}</span>
                    <span>io {fmtNumber(sumIO)}</span>
                  </div>
                </div>

                {/* 5. Activity */}
                <div className="rounded-xl px-3 py-3 border border-neutral-800/70 bg-neutral-900/30 text-neutral-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wide text-neutral-400">Activity</span>
                    <CalendarDays className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="text-xs text-neutral-300">updated {fmtDate(lastUpdated)}</div>
                  <div className="mt-2 text-xs text-neutral-400">changes in {WINDOW_DAYS}d: {changesInWindow}</div>
                </div>
              </div>
            </CardItem>

            <CardItem translateZ={40} className="absolute top-6 right-4">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  <DotsVerticalIcon
                    width={18}
                    height={18}
                    className="text-neutral-400 hover:text-white transition-colors"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent className={`${styles.glassDarker} w-full border bg-transparent border-neutral-800 rounded-xl`}>
                  <DropdownMenuItem className="bg-transparent" onSelect={(e) => e.preventDefault()}>
                    <EditProjectSheet
                      projectId={project.id}
                      projectName={project.name}
                      border="none"
                      wfull="wfull"
                      text="Edit"
                      rounded="md"
											glassy={true}                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-none" onSelect={(e) => e.preventDefault()}>
                    <DeleteProjectDialog
                      projectId={project.id}
                      border="none"
											bg="transparent"
                      wfull="wfull"
                      text="Delete"
                      rounded="md"
											glassy={true}
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardItem>
          </>
        )}
      </CardBody>
    </CardContainer>
  );
}
