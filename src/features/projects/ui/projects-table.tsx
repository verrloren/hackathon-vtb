/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Folder, Tree } from "@/components/magicui/file-tree";
import { GitCommit, Database, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/shared";
import { ViewGridIcon } from "@radix-ui/react-icons";
import { AiOutlinePlus } from "react-icons/ai";
import { CreateVersionDialog } from "@/features/versions/ui/create-version-dialog";
import { CreateTableDialog } from "@/features/tables/ui/create-table-dialog";
import { TrashIcon, Pencil2Icon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";
import { useDeleteTableMutation } from "@/features/tables/actions/use-delete-table";
import { RenameTableDialog } from "@/features/tables/ui/rename-table-dialog";
import { DeleteTableDialog } from "@/features/tables/ui/delete-table-dialog";
import { projectsApi, getProjectsAction } from "@/features/projects";
import { Project } from "@/shared";
import { ChartAreaGradient } from "@/features/tables/ui/area-chart";
import dynamic from "next/dynamic";
import type { BeforeMount } from "@monaco-editor/react";
import { DeleteVersionDialog } from "@/features/versions/ui/delete-version-dialog";
import { EditVersionDialog } from "@/features/versions/ui/edit-version-dialog";
import { useDeleteVersionMutation } from "@/features/versions/actions/use-delete-version";
import type { Table as TableType, Version as VersionType } from "@/shared";
import { ChartBar } from "@/features/tables/ui/char-bar";
import { ChartPieLegend } from "@/features/tables/ui/pie-chart";
import { BentoGrid } from "@/components/magicui/bento-grid";
import { ChartRadialSimple } from "@/features/tables/ui/radar-chart";
import { parseFormattedSqlForSuggested, toEditorValue } from "@/shared/lib/parse-formatted-sql";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
//

type Selection =
  | { type: "overview"; tableId: string }
  | { type: "version"; tableId: string; versionId: string };

export function ProjectsTable({
  tables,
  projectId,
}: {
  tables: TableType[];
  projectId: string;
}) {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: [projectsApi.baseKey],
    queryFn: getProjectsAction,
    refetchInterval: 10_000,
  });
	console.log('projects', projects)
  const project = projects.find((p) => String(p.id) === String(projectId));
  const tlist: TableType[] = (project?.tables ?? tables) as TableType[];
  const [selected, setSelected] = useState<Selection | null>(null);
  const { deleteTable } = useDeleteTableMutation(projectId);

  const sortedTables = useMemo(() => {
    return [...tlist].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [tlist]);

  useEffect(() => {
    if (!selected && sortedTables.length > 0) {
      setSelected({ type: "overview", tableId: sortedTables[0].id });
    }
  }, [sortedTables, selected]);

  const selectedKey = useMemo(() => {
    if (!selected) return undefined;
    if (selected.type === "overview") return `${selected.tableId}/overview`;
    if (selected.type === "version")
      return `${selected.tableId}/versions/${selected.versionId}`;
    return undefined;
  }, [selected]);

  const isSelected = (check: Selection): boolean => {
    if (!selected) return false;
    if (selected.type !== check.type) return false;
    if (selected.tableId !== check.tableId) return false;
    if (selected.type === "version") {
      return (
        selected.versionId ===
        (check as Extract<Selection, { type: "version" }>).versionId
      );
    }
    return true;
  };

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("transparent-vs-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#00000000",
        "editorGutter.background": "#00000000",
        "minimap.background": "#00000000",
        focusBorder: "#262626",
        "editorGroup.border": "#262626",
        "editorWidget.border": "#262626",
        "panel.border": "#262626",
      },
    });
  };

  // Dynamically import Monaco editor on client only to avoid SSR/Turbopack issues
  const Editor = useMemo(
    () =>
      dynamic(async () => (await import("@monaco-editor/react")).default, {
        ssr: false,
        // Keep it lightweight; Monaco can be heavy to load
        loading: () => <div className="h-40 w-full bg-black/30" />,
      }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
      className={`w-full min-h-80 `}
    >
      <SidebarProvider className={` w-full`}>
        <Sidebar
          variant="inset"
          collapsible="icon"
          className={` relative w-full`}
        >
          <SidebarSeparator />
          <SidebarContent
					// sidebar left panel bg
            className={`bg-black rounded-2xl py-4 w-full h-full`}
          >
            {tlist.length === 0 ? (
              <div className="p-4 text-neutral-500 ">No tables yet</div>
            ) : (
              <div className=" text-neutral-500 flex flex-col gap-y-4 px-4 w-full">
                <Tree
                  className="pt-2 w-full"
                  initialSelectedId={selectedKey}
                  initialExpandedItems={sortedTables.flatMap((t) => [
                    t.id,
                    `${t.id}/overview`,
                  ])}
                  openIcon={<></>}
                  closeIcon={<></>}
                >
                  {sortedTables.map((table) => (
                    <Folder
                      className="text-base w-full hover:text-white py-1"
                      key={table.id}
                      value={table.id}
                      isSelect={selected?.tableId === table.id}
                      element={
                        <div className="w-full flex items-center justify-between gap-x-2">
                          <div className="w-full flex items-center justify-between gap-x-2 group">
                            <div className="w-full inline-flex items-center gap-x-1">
                              <Database
                                size={18}
                                className="text-base flex justify-center items-center flex-row"
                              />
                              <span className="truncate">{table.name}</span>
                              {(() => {
                                const versions = table.versions ?? [];
                                const hasPending = versions.some(
                                  (v) => v.status === "pending" || v.status === "processing"
                                );
                                const hasError = versions.some((v) => v.status === "error");
                                if (hasPending) {
                                  return (
                                    <Loader2
                                      className="ml-1 size-3 animate-spin text-neutral-700"
                                      aria-label="Loading"
                                    />
                                  );
                                }
                                if (hasError) {
                                  return (
                                    <AlertCircle
                                      className="ml-1 size-3 text-red-500"
                                      aria-label="Error"
                                    />
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                          <RenameTableDialog
                            tableId={table.id}
                            currentName={table.name}
                            trigger={
                              <button
                                type="button"
                                className="text-neutral-700 hover:text-white bg-transparent p-0 m-0 h-4 w-4 transition-colors hidden group-hover:inline-flex"
                                aria-label="Rename table"
                              >
                                <Pencil2Icon className="h-4 w-4" />
                              </button>
                            }
                            projectId={""}
                          />
                          <DeleteTableDialog
                            tableId={table.id}
                            tableName={table.name}
                            onConfirm={async () => {
                              await deleteTable(table.id);
                              toast.success("Table deleted");
                            }}
                            trigger={
                              <button
                                type="button"
                                className="text-neutral-700 hover:text-white bg-transparent p-0 m-0 h-4 w-4 transition-colors hidden group-hover:inline-flex"
                                aria-label="Delete table"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            }
                          />
                        </div>
                      }
                    >
                      {/* VERSIONS */}
                      <Folder
                        className="text-base"
                        value={`${table.id}/overview`}
                        isSelect={isSelected({
                          type: "overview",
                          tableId: table.id,
                        })}
                        isSelectable={true}
                        preventToggle
                        element={
                          <div
                            className="inline-flex items-center gap-1"
                            onClick={() =>
                              setSelected({
                                type: "overview",
                                tableId: table.id,
                              })
                            }
                          >
                            <ViewGridIcon />
                            Overview
                          </div>
                        }
                      >

                        {(table.versions ?? []).length === 0 ? (
                          <span className="text-neutral-500 ml-2">
                            No versions
                          </span>
                        ) : (
                          (table.versions ?? []).map((v) => (
                            <VersionRow
                              key={v.id}
                              projectId={projectId}
                              tableId={table.id}
                              version={v}
                              isSelected={isSelected({
                                type: "version",
                                tableId: table.id,
                                versionId: v.id,
                              })}
                              onSelect={() =>
                                setSelected({
                                  type: "version",
                                  tableId: table.id,
                                  versionId: v.id,
                                })
                              }
                            />
                          ))
                        )}
                        <CreateVersionDialog
                          projectId={projectId}
                          tableId={table.id}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-neutral-500 hover:text-white"
                              aria-label="Create version"
                            >
                              <AiOutlinePlus />
                            </Button>
                          }
                        />
                      </Folder>
                      {/* <Folder
                        className="text-base"
                        value={`${table.id}/versions`}
                        isSelectable={true}
                      ></Folder> */}
                    </Folder>
                  ))}
                </Tree>
                <CreateTableDialog
                  projectId={projectId}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 text-neutral-500 hover:text-white "
                      // className="h-6 text-neutral-500 hover:text-white border w-full py-3 rounded-xl border-neutral-800"
                      aria-label="Create table"
                    >
                      <AiOutlinePlus />
                    </Button>
                  }
                />
              </div>
            )}
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        {/* SIDEBAR INSET */}
        <SidebarInset className={`rounded-2xl`}>
					{/* sidebar right panel bg */}
          <div className="p-6 text-neutral-200 min-h-80 bg-neutral-950 h-full">
            {sortedTables.length === 0 && (
              <>
                <p className="text-lg">No tables yet</p>

                <CreateTableDialog
                  projectId={projectId}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-neutral-500 hover:text-white"
                      aria-label="Create table"
                    >
                      <AiOutlinePlus />
                    </Button>
                  }
                />
              </>
            )}

            {sortedTables.length > 0 &&
              selected &&
              selected.type === "overview" && (
                <div className="flex flex-col gap-4 p-4">
                  {(() => {
                    const current = sortedTables.find(
                      (t) => String(t.id) === String(selected.tableId)
                    );
										if(!current) return <p className="text-neutral-500">No table found</p>
                    const versions = current?.versions ?? [];
                    if (versions.length === 0) {
                      return (
                        <div className="flex flex-col  gap-4 items-center">
													<p className="text-neutral-500">No versions yet</p>
													<CreateVersionDialog
														projectId={projectId}
														tableId={current.id}
														trigger={
															<Button
																size="icon"
																className="h-14 font-normal px-8 gap-x-4 w-fit"
																aria-label="Create version"
															>
																<AiOutlinePlus /> Create version
															</Button>
														}
													/>
												</div>

                      );
                    }
                    return (
                      <BentoGrid className="w-full grid-cols-1 md:grid-cols-3">
                        <div className="col-span-1 md:col-span-2">
                          <ChartAreaGradient versions={versions}  />
                        </div>
                        <div className="col-span-1 flex flex-col gap-y-4">
                          <ChartPieLegend versions={versions} />
                        </div>
                        <div className="col-span-1">
                          <ChartRadialSimple versions={versions} />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <ChartBar versions={versions} />
                        </div>
                      </BentoGrid>
                    );
                  })()}
                </div>
              )}

            {sortedTables.length > 0 &&
              selected &&
              selected.type === "version" &&
              (() => {
                const currentTable = sortedTables.find(
                  (t) => String(t.id) === String(selected.tableId)
                );
                const currentVersion = (currentTable?.versions ?? []).find(
                  (v) => String(v.id) === String(selected.versionId)
                ) as VersionType | undefined;

                // Build the editor value from version.queries[].query_text.sql.query.body_query
                const sqlValue: string = (() => {
                  const qs = currentVersion?.queries ?? [];
                  if (!qs.length) return "";
                  try {
                    const parts = qs.map((q) => {
                      const rows = (q?.query_text as any)?.sql?.query?.body_query;
                      if (!Array.isArray(rows)) return "";
                      return rows.map((r: any) => String(r?.row ?? "")).join("\n");
                    });
                    return parts.filter(Boolean).join("\n");
                  } catch {
                    return "";
                  }
                })();
                // Parse suggested SQL lines from either version- or query-level arrays
                const parsedSuggested = parseFormattedSqlForSuggested(
                  currentVersion ?? {}
                );
                const suggestedSqlValue: string = toEditorValue(parsedSuggested);
                const analysisText: string =
                  currentVersion?.analysis_text ?? "";

                return (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col xl:flex-row items-center justify-between w-full gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                        className="w-full"
                      >
                        <Card
                          className="group relative flex flex-col gap-4 p-4 w-full border-none bg-transparent backdrop-blur-sm transition-colors "
                        >
                        <CardHeader>
                          <CardTitle className="text-white tracking-tight">
                            Your query
                          </CardTitle>
                        </CardHeader>
                        <CardContent
                          className="rounded-xl overflow-hidden border border-neutral-900/60 bg-neutral-950/40 transition-colors group-hover:border-neutral-800"
                        >
                          <Editor
                            theme="transparent-vs-dark"
                            height="50vh"
                            defaultLanguage="sql"
                            value={sqlValue}
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                            }}
                            beforeMount={handleBeforeMount}
                          />
                        </CardContent>
                      </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.06 }}
                        whileHover={{ y: -2 }}
                        className="w-full"
                      >
                        <Card
                          className="group relative flex flex-col gap-4 p-4 w-full border-none bg-transparent backdrop-blur-sm transition-colors "
                        >
                        <CardHeader>
                          <CardTitle className="text-white tracking-tight">
                            Suggested query
                          </CardTitle>
                        </CardHeader>

                        <CardContent
                          className="rounded-xl overflow-hidden border border-neutral-900/60 bg-neutral-950/40 transition-colors group-hover:border-neutral-800"
                        >
                          <Editor
                            theme="transparent-vs-dark"
                            height="50vh"
                            defaultLanguage="sql"
                            value={suggestedSqlValue}
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                            }}
                            beforeMount={handleBeforeMount}
                          />
                        </CardContent>
                      </Card>
                      </motion.div>
                    </div>

                    {analysisText && (
                      <div className="px-4 pb-4">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-xl font-semibold">Analysis</h3>
                          <p className="text-neutral-300 whitespace-pre-wrap leading-6 ">
														{analysisText}
													</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </motion.div>
  );
}

function VersionRow({
  projectId,
  tableId,
  version,
  isSelected,
  onSelect,
}: {
  projectId: string;
  tableId: string;
  version: VersionType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { deleteVersion } = useDeleteVersionMutation(projectId, tableId);

  return (
    <Folder
      className="text-base hover:text-white"
      value={`${tableId}/versions/${version.id}`}
      isSelectable={true}
      isSelect={isSelected}
      preventToggle
      element={
        <div
          className="inline-flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <GitCommit className="size-4" />
          {version.commit_hash && String(version.commit_hash).trim().length > 0
            ? String(version.commit_hash)
            : "Unnamed version"}
          {(() => {
            const s = (version.status || "") as string;
            if (s === "pending" || s === "processing") {
              return (
                <Loader2
                  className="ml-1 size-3 animate-spin text-neutral-700"
                  aria-label="Loading"
                />
              );
            }
            if (s === "error") {
              return (
                <AlertCircle
                  className="ml-1 size-3 text-red-500"
                  aria-label="Error"
                />
              );
            }
            // Treat both 'completed' and 'success' as success (no icon)
            return null;
          })()}
        </div>
      }
      actions={
        <div className="inline-flex items-center gap-1 pr-1">
          <EditVersionDialog
            projectId={projectId}
            tableId={tableId}
            versionId={version.id}
            currentCommitHash={version.commit_hash}
            currentPrNumber={version.pr_number}
            trigger={
              <button
                type="button"
                className="text-neutral-700 hover:text-white bg-transparent p-0 m-0 h-4 w-4 transition-colors"
                aria-label="Edit version"
                onClick={(e) => e.stopPropagation()}
              >
                <Pencil2Icon className="h-4 w-4" />
              </button>
            }
          />
          <DeleteVersionDialog
            versionId={version.id}
            label={version.commit_hash}
            onConfirm={async () => {
              await deleteVersion(version.id);
              toast.success("Version deleted");
            }}
            trigger={
              <button
                type="button"
                className="text-neutral-700 hover:text-white bg-transparent p-0 m-0 h-4 w-4 transition-colors"
                aria-label="Delete version"
                onClick={(e) => e.stopPropagation()}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            }
          />
        </div>
      }
    />
  );
}
