import AdminDashboard from '@/components/AdminDashboard';
import { adminProtectedPage } from '@/lib/page-protection';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const AdminPage = async () => {
  const session = await auth();
  adminProtectedPage(
    session as {
      user: { email: string; id: string; name: string };
    } | null,
  );

  const [courses, instructors] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, courseCode: true, courseName: true },
      orderBy: { courseCode: 'asc' },
    }),
    prisma.instructor.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <main>
      <AdminDashboard courses={courses} instructors={instructors} />
    </main>
  );
};

export default AdminPage;
