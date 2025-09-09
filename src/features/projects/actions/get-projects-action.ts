'use server';

import { Project, Table, Version, Query, Metrics } from "@/shared";
import type { FormattedSql, QueryText, BodyQuery } from "@/shared/model/types";
import { getToken } from "@/features/auth";
import { projectsApi } from "@/features/projects";

type RawQuery = {
  id?: string;
  query_text?: string | { sql?: string | FormattedSql };
  query_fingerprint?: string | null;
  status?: string | null;
  reason?: string | null;
  explain_json?: unknown | null;
  suggested_query_text?: unknown[];
  version_id?: string;
  created_at?: string;
  updated_at?: string | null;
};

type RawVersion = {
  id: string;
  commit_hash: string;
  pr_number: number | null;
  queries?: RawQuery[];
  query?: RawQuery;
  metrics?: unknown; // can be array/object; we normalize later
  suggested_query_text?: unknown[] | null;
  analysis_text?: string | null;
  status?: "pending" | "processing" | "completed" | "error" | string;
  table_id: string;
  created_at: string;
  updated_at: string | null;
};

type RawTable = {
  id: string;
  name: string;
  schema: string;
  connection_string: string;
  default_limits: string | null;
  dump_db?: string;
  status: "pending" | "processing" | "processing" | "completed" | "error";
  versions?: RawVersion[];
  project_id: string;
  created_at: string;
  updated_at: string | null;
};

type RawProject = {
  id: string;
  name: string;
  tables?: RawTable[];
  user_id: string;
  created_at: string;
  updated_at: string | null;
};

function toQueryText(qt: RawQuery["query_text"]): QueryText {
  const empty: QueryText = { sql: { query: { body_query: [] } } } as QueryText;
  if (typeof qt === "string") {
    const rows = qt.split("\n").map((row, idx) => ({ row, row_number: idx + 1 }));
    return { sql: { query: { body_query: rows } } } as QueryText;
  }
  if (qt && typeof qt === "object" && "sql" in qt) {
    const val = (qt as { sql?: unknown }).sql;
    if (typeof val === "string") {
      const rows = val.split("\n").map((row, idx) => ({ row, row_number: idx + 1 }));
      return { sql: { query: { body_query: rows } } } as QueryText;
    }
    if (val && typeof val === "object") {
      return { sql: val as FormattedSql } as QueryText;
    }
  }
  return empty;
}

function toBodyQueryArray(input: unknown): BodyQuery[] {
  if (!Array.isArray(input)) return [];
  let counter = 1;
  return input.map((it) => {
    if (typeof it === "string") {
      return { row_number: counter++, row: it };
    }
    if (it && typeof it === "object") {
      const anyIt = it as Record<string, unknown>;
      const row = typeof anyIt.row === "string" ? anyIt.row : String(anyIt.row ?? "");
      const row_number =
        typeof anyIt.row_number === "number"
          ? anyIt.row_number
          : typeof anyIt.row_number === "string"
          ? Number(anyIt.row_number)
          : counter++;
      const type = typeof anyIt.type === "string" ? (anyIt.type as BodyQuery["type"]) : undefined;
      const message = typeof anyIt.message === "string" ? (anyIt.message as BodyQuery["message"]) : undefined;
      const analisys = typeof anyIt.analisys === "string" ? anyIt.analisys : undefined;
      return { row_number, row, type, message, analisys } as BodyQuery;
    }
    return { row_number: counter++, row: "" };
  });
}

function normalizeQuery(raw: RawQuery | undefined, fallbackVersionId: string): Query {
  return {
    id: String(raw?.id ?? fallbackVersionId),
    query_text: toQueryText(raw?.query_text),
    query_fingerprint: (raw?.query_fingerprint ?? null) as string | null,
    status: String(raw?.status ?? ""),
    reason: (raw?.reason ?? null) as string | null,
    explain_json: raw?.explain_json ?? null,
    suggested_query_text: toBodyQueryArray(raw?.suggested_query_text),
    version_id: String(raw?.version_id ?? fallbackVersionId),
    created_at: String(raw?.created_at ?? new Date().toISOString()),
    updated_at: (raw?.updated_at ?? null) as string | null,
  };
}

function normalizeMetricsArray(raw: unknown, version: RawVersion): Metrics[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((m) => normalizeMetricsObject(m, version));
  }
  // If a single object was returned
  return [normalizeMetricsObject(raw, version)];
}

function toNumOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeMetricsObject(m: unknown, version: RawVersion): Metrics {
  const anyM = (m ?? {}) as Record<string, unknown>;
  return {
    id: String(anyM.id ?? version.id),
    total_cost: toNumOrNull(anyM.total_cost),
    rows_estimated: toNumOrNull(anyM.rows_estimated),
    cpu_estimated: toNumOrNull(anyM.cpu_estimated),
    memory_estimated: toNumOrNull(anyM.memory_estimated),
    io_estimated: toNumOrNull(anyM.io_estimated),
    risk_flags: (anyM.risk_flags as string) ?? null,
    limit_value: toNumOrNull(anyM.limit_value),
    severity: (anyM.severity as string) ?? null,
    version_id: String(anyM.version_id ?? version.id),
    created_at: String(anyM.created_at ?? version.created_at),
    updated_at: (anyM.updated_at ?? null) as string | null,
  } as Metrics;
}

function normalizeVersion(v: RawVersion): Version {
  const queries: Query[] = Array.isArray(v.queries) && v.queries.length
    ? v.queries.map((rq) => normalizeQuery(rq, v.id))
    : v.query
    ? [normalizeQuery(v.query, v.id)]
    : [];

  const metrics = normalizeMetricsArray(v.metrics, v);

  return {
    id: v.id,
    commit_hash: v.commit_hash,
    pr_number: v.pr_number,
    queries,
    metrics,
    suggested_query_text: toBodyQueryArray(v.suggested_query_text ?? []),
    analysis_text: v.analysis_text ?? "",
    status: (v.status as Version["status"]) ?? "pending",
    table_id: v.table_id,
    created_at: v.created_at,
    updated_at: (v.updated_at ?? null) as string | null,
  };
}

function normalizeTable(t: RawTable): Table {
  const status = t.status === "processing" ? "processing" : t.status;
  return {
    id: t.id,
    name: t.name,
    schema: t.schema,
    connection_string: t.connection_string,
    default_limits: t.default_limits ?? null,
    dump_db: t.dump_db ?? "",
    status,
    versions: (t.versions ?? []).map(normalizeVersion),
    project_id: t.project_id,
    created_at: t.created_at,
    updated_at: (t.updated_at ?? null) as string | null,
  };
}

function normalizeProject(p: RawProject): Project {
  return {
    id: p.id,
    name: p.name,
    tables: (p.tables ?? []).map(normalizeTable),
    user_id: p.user_id,
    created_at: p.created_at,
    updated_at: (p.updated_at ?? null) as string | null,
  };
}

export const getProjectsAction = async (): Promise<Project[]> => {
  try {
    const { token } = await getToken();
    const projects = await projectsApi.getProjects(token);
    // Normalize backend payload to shared types shape
    const normalized = (projects as unknown as RawProject[]).map(normalizeProject);
    return normalized;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return []; // Return empty array to prevent retrying
  }
};
