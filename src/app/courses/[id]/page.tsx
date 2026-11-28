// #32: a real page for each course at /courses/[id].
// This file runs on the server: it reads the course, its offerings and their
// materials from the database, then hands plain data to CourseDetail
// (src/components/CourseDetail.tsx), which draws the page. Same split as
// Search (server page) and CourseCard (client component).
import { notFound } from 'next/navigation';
import CourseDetail from '@/components/CourseDetail';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type CoursePageProps = {
  params: Promise<{ id: string }>;
};

/** The site part of a link, for example drive.google.com, shown next to each material. */
const linkHost = (link: string) => {
  try {
    return new URL(link).hostname;
  } catch {
    return '';
  }
};

const CoursePage = async ({ params }: CoursePageProps) => {
  const { id } = await params;
  const courseId = Number(id);

  // A missing or made-up id shows the not-found page instead of crashing.
  if (!Number.isInteger(courseId) || courseId <= 0) {
    notFound();
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      courseCode: true,
      courseName: true,
      rating: true,
      offerings: {
        select: {
          semester: true,
          instructor: { select: { name: true, userId: true } },
          materials: {
            // Hidden materials never show (#26).
            where: { hidden: false },
            select: {
              id: true,
              title: true,
              type: true,
              link: true,
              description: true,
              createdAt: true,
              outdatedNote: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Which materials the signed-in student has bookmarked (#36). Signed-out visitors see none.
  // The student comes from the session, never from the address.
  const session = await auth();
  const email = session?.user?.email;
  const materialIds = course.offerings.flatMap((offering) => offering.materials.map((material) => material.id));
  const bookmarks = email && materialIds.length > 0
    ? await prisma.bookmark.findMany({
      where: { user: { email }, materialId: { in: materialIds } },
      select: { materialId: true },
    })
    : [];
  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.materialId));

  // #38: who may mark materials outdated here. Admins may manage every material;
  // an instructor only the materials in offerings they teach (same rule as #35's
  // getMaterialManager, which checks again on the server when they click).
  const viewer = email
    ? await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
    : null;
  const canManage = (instructorUserId: number | null) => !!viewer && (
    viewer.role === 'ADMIN' || (viewer.role === 'INSTRUCTOR' && instructorUserId === viewer.id)
  );

  // Every material for this course, newest first, labelled with its offering.
  // Only plain values go to CourseDetail (no dates or Decimals).
  const materials = course.offerings
    .flatMap((offering) => offering.materials.map((material) => ({
      material,
      semester: offering.semester,
      instructor: offering.instructor.name,
      instructorUserId: offering.instructor.userId,
    })))
    .sort((a, b) => b.material.createdAt.getTime() - a.material.createdAt.getTime())
    .map(({ material, semester, instructor, instructorUserId }) => ({
      id: material.id,
      title: material.title,
      type: material.type,
      link: material.link,
      description: material.description,
      outdatedNote: material.outdatedNote,
      semester,
      instructor,
      host: linkHost(material.link),
      bookmarked: bookmarkedIds.has(material.id),
      canManage: canManage(instructorUserId),
    }));

  // Semester -> instructors, for the "Offered in" sidebar.
  const bySemester = new Map<string, string[]>();
  course.offerings.forEach((offering) => {
    bySemester.set(offering.semester, [...(bySemester.get(offering.semester) ?? []), offering.instructor.name]);
  });
  const offeredIn = [...bySemester.entries()].map(([semester, names]) => ({ semester, instructors: names }));

  return (
    <CourseDetail
      courseCode={course.courseCode}
      courseName={course.courseName}
      rating={Number(course.rating)}
      materials={materials}
      instructors={[...new Set(course.offerings.map((offering) => offering.instructor.name))].sort()}
      types={[...new Set(materials.map((material) => material.type))].sort()}
      offeredIn={offeredIn}
    />
  );
};

export default CoursePage;
