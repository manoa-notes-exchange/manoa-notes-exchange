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

const HomePage = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const currentUser = session.user.email;
  const savedUser = await prisma.user.findUnique({
    where: { email: currentUser },
    select: {
      saved: {
        orderBy: { courseCode: 'asc' },
        select: {
          id: true,
          courseCode: true,
          offerings: { select: { semester: true } },
        },
      },
    },
  });
  const savedCourses = savedUser?.saved.map((course) => ({
    id: course.id,
    course: course.courseCode,
    semester: [...new Set(course.offerings.map((offering) => offering.semester))].join(', ')
      || 'No offerings listed',
  })) ?? [];

  const user = await prisma.user.findUnique({
    where: {
      email: currentUser,
    },
    select: {
      bookmarks: {
        where: {
          material: {
            hidden: false,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          material: {
            select: {
              id: true,
              title: true,
              link: true,
              offering: {
                select: {
                  semester: true,
                  course: {
                    select: {
                      id: true,
                      courseCode: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const bookmarks = user?.bookmarks ?? [];

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
                    href={`/courses/${savedCourse.id}`}
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
              {bookmarks.length === 0 ? (
                <p className="text-muted p-3 mb-0">
                  You have not bookmarked any materials yet.
                </p>
              ) : (
                bookmarks.map((bookmark) => (
                  <div
                    className="border-bottom p-3"
                    data-testid="home-bookmark"
                    key={bookmark.id}
                  >
                    <a
                      className="text-success"
                      href={bookmark.material.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {bookmark.material.title}
                    </a>

                    <div className="small text-secondary mt-1">
                      {bookmark.material.offering.course.courseCode}
                      {' · '}
                      {bookmark.material.offering.semester}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
