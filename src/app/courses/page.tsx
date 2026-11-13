import { prisma } from '@/lib/prisma';
import CourseCard from '@/components/CourseCard';
import CourseSearchForm from '@/components/CourseSearchForm';
import { Alert, Col, Container, Row } from 'react-bootstrap';
// import styles from './search.module.css';

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

const Search = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  const [params, courses] = await Promise.all([
    searchParams,
    prisma.course.findMany({ orderBy: { id: 'asc' } }),
  ]);
  const departments = [...new Set(courses.map((course) => courseDepartment(course.courseCode)))].sort();
  const departmentParam = firstValue(params.department);
  const department = departmentParam === undefined ? (departments[0] ?? '') : departmentParam;
  const selectedCourseNumber = firstValue(params.courseNumber)?.trim() ?? '';
  const semester = firstValue(params.semester) ?? '';
  const semesters = [...new Set(courses.flatMap((course) => course.semester))].sort();

  const filteredCourses = courses.filter((course) => (
    (department === '' || courseDepartment(course.courseCode) === department)
      && (selectedCourseNumber === ''
        || courseNumber(course.courseCode).toLowerCase().includes(selectedCourseNumber.toLowerCase()))
      && (semester === '' || course.semester.includes(semester))
  ));

  return (
    <main className='py-3'>
      <Container>
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
                  courseCode={course.courseCode}
                  courseName={course.courseName}
                  rating={Number(course.rating)}
                  semesters={course.semester}
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
