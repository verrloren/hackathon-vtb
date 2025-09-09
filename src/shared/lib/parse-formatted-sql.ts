/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormattedSql } from "@/shared/model/types";
import type { BodyQuery } from "@/shared/model/types";

// A normalized line that preserves potential status metadata from backend
export type SuggestedSqlLine = {
  row_number: number;
  text: string;
  type?: BodyQuery["type"];
  message?: BodyQuery["message"];
  analysis?: BodyQuery["analisys"];
};

export type ParsedSuggestedSql = {
  lines: SuggestedSqlLine[];
};

export function parseFormattedSqlForSuggested(
  input: unknown
): ParsedSuggestedSql {
  const empty: ParsedSuggestedSql = { lines: [] };

  if (!input || typeof input !== "object") return empty;

  const maybeSql = (input as any).sql ?? input;
  let rows: unknown = (maybeSql as any)?.query?.suggested_query_text;
  if (!Array.isArray(rows)) {
    rows = (maybeSql as any)?.suggested_query_text;
  }
  if (!Array.isArray(rows) && Array.isArray(maybeSql)) {
    rows = maybeSql;
  }

  if (!Array.isArray(rows)) return empty;

  const lines: SuggestedSqlLine[] = rows.map((r: any, idx: number) => {
    if (typeof r === "string") {
      return { row_number: idx + 1, text: r };
    }
    const row = String(r?.row ?? "");
    const row_number = Number(r?.row_number ?? idx + 1);
    const type = (r?.type ?? undefined) as BodyQuery["type"] | undefined;
    const message = (r?.message ?? undefined) as BodyQuery["message"] | undefined;
    const analysis = (r?.analisys ?? r?.analysis ?? undefined) as BodyQuery["analisys"] | undefined;

    return { row_number, text: row, type, message, analysis };
  });

  return { lines };
}

// Optional helper: build a string if you need to feed Monaco's value,
// while still keeping the parsed structure for decorations.
export function toEditorValue(parsed: ParsedSuggestedSql): string {
  return parsed.lines.map((l) => l.text).join("\n");
}

export type LineSeverity = {
  lineNumber: number;
  severity: NonNullable<BodyQuery["type"]>;
  message?: string;
};

// Build a simple mapping usable to add Monaco markers/decorations
export function toLineSeverities(parsed: ParsedSuggestedSql): LineSeverity[] {
  const out: LineSeverity[] = [];
  for (const l of parsed.lines) {
    if (!l.type) continue;
    out.push({ lineNumber: l.row_number, severity: l.type, message: l.message });
  }
  return out;
}


export function buildSqlQuery(sql: string): FormattedSql {
  const normalized = sql.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  const body_query = lines.map((line, idx) => ({
    row: line,
    row_number: idx + 1,
  }));

  // Match shared/types.ts: FormattedSql = { query: { body_query: SqlRow[] } }
  return { query: { body_query } } as FormattedSql;
}
