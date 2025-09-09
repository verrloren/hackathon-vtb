export interface ResponseDto {
  success: boolean;
  response: string;
}

export type UUID = string;
export type TimestampISO = string;

export type SqlRow = { row: string; row_number: number };
export type FormattedSql = { query: { body_query: SqlRow[] } };

// Shape stored in queries.query_text (as returned by backend)
export interface QueryText {
  sql: FormattedSql;
}

export interface User {
  id: UUID;
  username: string;
  email: string;
  password: string;
  role: string;
  projects: Project[];
}

export interface Project {
  id: UUID;
  name: string;
  tables: Table[];
  user_id: UUID;
  created_at: TimestampISO;
  updated_at: TimestampISO | null;
}

export interface Table {
  id: UUID;
  name: string;
  schema: string;
  connection_string: string;
  default_limits: string | null;
  dump_db: string;
  status: "pending" | "processing" | "completed" | "error";
  versions: Version[];
  project_id: UUID;
  created_at: TimestampISO;
  updated_at: TimestampISO | null;
}

export interface Version {
  id: UUID;
  commit_hash: string;
  pr_number: number | null;
  queries: Query[];
  metrics: Metrics[];
  suggested_query_text: BodyQuery[];
  analysis_text: string;
  status: "pending" | "processing" | "completed" | "error";
  table_id: UUID;
  created_at: TimestampISO;
  updated_at: TimestampISO | null;
}

export interface Query {
  id: UUID;
  query_text: QueryText;
  query_fingerprint: string | null;
  status: string;
  reason: string | null;
  explain_json: unknown | null;
  suggested_query_text: BodyQuery[];
  version_id: UUID;
  created_at: TimestampISO;
  updated_at: TimestampISO | null;
}

export interface BodyQuery {
  row_number: number;
  row: string;
  type?: "error" | "warning" | "good";
  message?: "most_expensive" | "n+1";
  analisys?: string;
}

export interface Metrics {
  id: UUID;
  total_cost: number | null;
  rows_estimated: number | null;
  cpu_estimated: number | null;
  memory_estimated: number | null;
  io_estimated: number | null;
  risk_flags: string | null;
  limit_value: number | null;
  severity: string | null;
  version_id: UUID;
  created_at: TimestampISO;
  updated_at: TimestampISO | null;
}