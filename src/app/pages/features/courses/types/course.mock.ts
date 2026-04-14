import { CourseModel } from './course.model';

export const mockCourse: CourseModel[] = [
  {
    id: 'course-001',
    title: 'Introduction to Angular',
    description:
      'Learn the basics of Angular, a popular front-end framework for building web applications.',
    instructor: 'John Doe',
    duration: '10 hours',
    level: 'Beginner',
    thumbnailUrl: 'https://angular.dev/assets/images/ng-image.jpg',
  },

  {
    id: 'course-002',
    title: 'Advanced TypeScript',
    description:
      'Master TypeScript, a powerful superset of JavaScript that adds static typing and advanced features.',
    instructor: 'Jane Smith',
    duration: '15 hours',
    level: 'Advanced',
    thumbnailUrl:
      'https://repository-images.githubusercontent.com/596005045/eaf5da3e-3712-4c98-8b2a-a8a0738cb06a',
  },

  {
    id: 'course-003',
    title: 'Reactive Programming with RxJS',
    description:
      'Learn how to use RxJS for reactive programming in JavaScript and Angular applications.',
    instructor: 'Emily Johnson',
    duration: '12 hours',
    level: 'Intermediate',
    thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1358/1*Sfy9QOnV5ZRXdxdc_2fNag.png',
  },
];
