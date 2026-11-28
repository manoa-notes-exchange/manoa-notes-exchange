import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  // #38: the newest real uploads across the student's saved courses, replacing the
  // M1 sample list. Five at most: My Home is a summary, each course page has them all.
  const savedCourseIds = savedCourses.map((course) => course.id);
  const newInSaved = savedCourseIds.length === 0 ? [] : await prisma.material.findMany({
    where: { hidden: false, offering: { courseId: { in: savedCourseIds } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      type: true,
      link: true,
      outdatedNote: true,
      offering: { select: { semester: true, course: { select: { id: true, courseCode: true } } } },
    },
  });

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
              {newInSaved.length === 0 ? (
                <p className="text-secondary p-3 mb-0">
                  {savedCourses.length === 0 ? 'Nothing new yet. ' : 'No uploads in your saved courses yet. '}
                  <Link className="text-success" href="/search">
                    {savedCourses.length === 0 ? 'Save a course on Search' : 'Find more courses on Search'}
                  </Link>
                  {savedCourses.length === 0 ? ' to see its newest uploads here.' : '.'}
                </p>
              ) : newInSaved.map((material) => (
                <div
                  className="d-flex justify-content-between align-items-start border-bottom p-3"
                  data-testid="home-new-material"
                  key={material.id}
                >
                  <div className="me-3">
                    <h5 className="mb-1">
                      {/* Opens in a new tab and passes nothing back to our page (#26 safety). */}
                      <a
                        className="text-success"
                        href={material.link}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        {material.title}
                      </a>
                    </h5>

                    <div className="text-secondary">
                      <Link className="text-secondary" href={`/courses/${material.offering.course.id}`}>
                        {material.offering.course.courseCode}
                      </Link>
                      {' · '}
                      {material.offering.semester}
                      {material.outdatedNote && (
                        <span className="badge bg-warning text-dark ms-2">Outdated</span>
                      )}
                    </div>
                  </div>

                  <span className="badge bg-success">
                    {material.type}
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
                      rel="noopener noreferrer nofollow"
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
