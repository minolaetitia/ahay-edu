export interface CourseModel {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string; // e.g., "10 hours"
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnailUrl: string;
}
