import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CourseModel } from './types/course.model';
import { mockCourse } from './types/course.mock';

@Component({
  selector: 'app-course',
  templateUrl: './course.html',
  styleUrls: ['./course.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Course {
  courseData = mockCourse;
  showCourseForm = false;

  loadCourse() {
    // Logic to load course details, e.g., from an API
  }

  enroll() {
    // Logic to enroll in the course
  }

  share() {
    // Logic to share the course, e.g., via social media
  }
}
