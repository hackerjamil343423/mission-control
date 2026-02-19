export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  assignee: string;
  priority: "low" | "medium" | "high" | null;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: number;
  title: string;
  stage: string;
  script: string | null;
  thumbnail_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  scheduled_at: string;
  type: string;
  completed: boolean;
  created_at: string;
}

export interface Memory {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  status: string;
  avatar: string | null;
  description: string | null;
}
