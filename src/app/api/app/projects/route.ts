import { NextResponse } from "next/server";
import { getProjectsAction } from "@/features/projects";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getProjectsAction();
    return NextResponse.json(projects);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
