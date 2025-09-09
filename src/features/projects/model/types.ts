import { Project } from "@/shared";

export type LoginResponse = {
  success: boolean;
} | {
  error: string;
};


export interface ProjectsResponse {
  response: Project[];
}

export interface UploadVariables {
  file: File;
  codelang_code: string;
}

