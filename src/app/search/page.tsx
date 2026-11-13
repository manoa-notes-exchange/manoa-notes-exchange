import { prisma } from '@/lib/prisma';
import CourseCard from '@/components/CourseCard';
import { Search as SearchIcon } from 'react-bootstrap-icons';
import styles from './search.module.css';

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
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Search Courses</h1>

        <form action="/search" method="get" className={styles.searchForm}>
          <label className={styles.field}>
            <span>Department</span>
            <select name="department" defaultValue={department}>
              <option value="">All departments</option>
              {departments.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className={styles.field}>
            <span>Course number</span>
            <input
              type="search"
              name="courseNumber"
              placeholder="e.g. 314"
              defaultValue={selectedCourseNumber}
            />
          </label>

          <label className={styles.field}>
            <span>Offered in</span>
            <select name="semester" defaultValue={semester}>
              <option value="">Any semester</option>
              {semesters.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <button type="submit" className={styles.searchButton}>
            <SearchIcon aria-hidden="true" />
            Search
          </button>
        </form>

        <p className={styles.resultCount} aria-live="polite">
          Showing {filteredCourses.length}{department ? ` ${department}` : ''} {filteredCourses.length === 1 ? 'course' : 'courses'}
        </p>

        {filteredCourses.length > 0 ? (
          <div className={styles.courseGrid}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                courseCode={course.courseCode}
                courseName={course.courseName}
                rating={Number(course.rating)}
                semesters={course.semester}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>No courses match those filters. Try a different department, number, or semester.</p>
        )}
      </div>
    </main>
  );
};

export default Search;
