import { Project } from "@/shared";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  projects: Project[];
}

export type UserDto = {
	id: string; 
	login: string; 
	password: string 
};
