import { redirect } from 'next/navigation';

// #32: each course has its own page at /courses/[id] now (src/app/courses/[id]/page.tsx).
// Plain /courses has no course to show, so it sends visitors to Search to pick one.
// The M1 sample page with hard-coded materials used to live here.
const CoursesPage = () => {
  redirect('/search');
};

export default CoursesPage;