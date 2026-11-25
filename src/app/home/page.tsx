import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updates = [
  {
    id: 1,
    title: 'Midterm 1 review: JavaScript and ESLint',
    course: 'ICS 314',
    semester: 'Fall 2026',
    rating: '★★★★★',
    type: 'Study guide',
  },
  {
    id: 2,
    title: 'Dynamic programming worked examples',
    course: 'ICS 311',
    semester: 'Fall 2026',
    rating: '★★★★☆',
    type: 'Practice problems',
  },
  {
    id: 3,
    title: 'Lecture notes: SQL joins',
    course: 'ICS 321',
    semester: 'Fall 2026',
    rating: '★★★★☆',
    type: 'Notes',
  },
];

const bookmarks = [
  {
    id: 1,
    title: 'Git branching and pull request steps',
  },
  {
    id: 2,
    title: 'Big-O cheat sheet',
  },
];

const HomePage = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const currentUser = session.user.email;
  const user = await prisma.user.findUnique({
    where: { email: currentUser },
    select: {
      saved: {
        orderBy: { courseCode: 'asc' },
        select: {
          courseCode: true,
          offerings: { select: { semester: true } },
        },
      },
    },
  });
  const savedCourses = user?.saved.map((course) => ({
    course: course.courseCode,
    semester: [...new Set(course.offerings.map((offering) => offering.semester))].join(', ')
      || 'No offerings listed',
  })) ?? [];

  return (
    <div className="container py-4 flex-grow-1">
      <h1 className="display-5">
        Aloha, {currentUser}
      </h1>

      <p className="text-secondary fs-5 mb-4">
        Here&apos;s what&apos;s new in the courses you saved.
      </p>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">
              <strong>New in your saved courses</strong>
            </div>

            <div className="card-body p-0">
              {updates.map((update) => (
                <div
                  className="
                    d-flex
                    justify-content-between
                    align-items-start
                    border-bottom
                    p-3
                  "
                  key={update.id}
                >
                  <div className="me-3">
                    <h5 className="mb-1">
                      {update.title}
                    </h5>

                    <div className="text-secondary">
                      {update.course}
                      {' · '}
                      {update.semester}
                      {' · '}
                      <span className="text-warning">
                        {update.rating}
                      </span>
                    </div>
                  </div>

                  <span className="badge bg-success">
                    {update.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <strong>Saved courses</strong>
            </div>

            <div className="card-body p-0">
              {savedCourses.length > 0 ? savedCourses.map((savedCourse) => (
                <div
                  className="
                    d-flex
                    justify-content-between
                    align-items-center
                    border-bottom
                    p-3
                  "
                  key={savedCourse.course}
                >
                  <Link
                    className="text-success"
                    href="/courses"
                  >
                    {savedCourse.course}
                  </Link>

                  <span className="badge bg-light text-dark border">
                    {savedCourse.semester}
                  </span>
                </div>
              )) : (
                <p className="text-secondary p-3 mb-0">You have not saved any courses yet.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <strong>Bookmarks</strong>
            </div>

            <div className="card-body p-0">
              {bookmarks.map((bookmark) => (
                <div
                  className="border-bottom p-3"
                  key={bookmark.id}
                >
                  <Link
                    className="text-success"
                    href="/courses"
                  >
                    {bookmark.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;