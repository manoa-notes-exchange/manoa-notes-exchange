import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import CourseCard from '@/components/CourseCard';
import CourseSearchForm from '@/components/CourseSearchForm';
import { Alert, Col, Container, Row } from 'react-bootstrap';

type SearchParams = {
  department?: string | string[];
  courseNumber?: string | string[];
  semester?: string | string[];
};

const firstValue = (value: string | string[] | undefined) => (
  Array.isArray(value) ? value[0] : value
);

const courseDepartment = (courseCode: string) => courseCode.trim().split(/\s+/)[0] ?? '';

const courseNumber = (courseCode: string) => courseCode.trim().split(/\s+/).slice(1).join(' ');

// Puts semesters in calendar order: "Spring 2027" comes after "Fall 2026",
// even though it sorts first alphabetically. Unknown terms go last in a year.
const TERM_ORDER = ['Spring', 'Summer', 'Fall'];
const semesterKey = (semester: string) => {
  const [term = '', year = '0'] = semester.split(' ');
  const termIndex = TERM_ORDER.indexOf(term);
  return Number(year) * 10 + (termIndex === -1 ? TERM_ORDER.length : termIndex);
};
const sortSemesters = (semesters: string[]) => [...semesters].sort((a, b) => semesterKey(a) - semesterKey(b));

const Search = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  const [params, courses, session] = await Promise.all([
    searchParams,
    // Semesters come from offerings since #25. `select` names only the
    // columns Search needs, so Course's old `instructor` and `semester`
    // lists can be dropped later without breaking this page.
    prisma.course.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        courseCode: true,
        courseName: true,
        rating: true,
        offerings: { select: { semester: true } },
      },
    }),
    auth(),
  ]);
  const savedCourses = session?.user?.email
    ? await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { saved: { select: { courseCode: true } } },
    })
    : null;
  const savedCourseCodes = new Set(savedCourses?.saved.map((course) => course.courseCode) ?? []);
  const semestersOf = (course: (typeof courses)[number]) => sortSemesters(
    [...new Set(course.offerings.map((offering) => offering.semester))],
  );
  const departments = [...new Set(courses.map((course) => courseDepartment(course.courseCode)))].sort();
  const departmentParam = firstValue(params.department);
  const department = departmentParam === undefined ? (departments[0] ?? '') : departmentParam;
  const selectedCourseNumber = firstValue(params.courseNumber)?.trim() ?? '';
  const semester = firstValue(params.semester) ?? '';
  const semesters = sortSemesters([...new Set(courses.flatMap(semestersOf))]);

  const filteredCourses = courses.filter((course) => (
    (department === '' || courseDepartment(course.courseCode) === department)
      && (selectedCourseNumber === ''
        || courseNumber(course.courseCode).toLowerCase().includes(selectedCourseNumber.toLowerCase()))
      && (semester === '' || semestersOf(course).includes(semester))
  ));

  return (
    <main>
      <Container className='my-4'>
        <h1 className='my-3'>Search Courses</h1>

        <CourseSearchForm
          departments={departments}
          department={department}
          courseNumber={selectedCourseNumber}
          semesters={semesters}
          semester={semester}
        />

        <p className='my-3' aria-live="polite">
          Showing {filteredCourses.length}{department ? ` ${department}` : ''} {filteredCourses.length === 1 ? 'course' : 'courses'}
        </p>

        {filteredCourses.length > 0 ? (
          <Row xs={1} md={2} lg={3} className="g-3">
            {filteredCourses.map((course) => (
              <Col key={course.id}>
                <CourseCard
                  courseId={course.id}
                  courseCode={course.courseCode}
                  courseName={course.courseName}
                  rating={Number(course.rating)}
                  semesters={semestersOf(course)}
                  isSaved={savedCourseCodes.has(course.courseCode)}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Alert variant="light" className="border text-center text-muted">
            No courses match those filters. Try a different department, number, or semester.
          </Alert>
        )}
      </Container>
    </main>
  );
};

export default Search;
