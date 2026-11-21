import { loggedInProtectedPage } from '@/lib/page-protection';
import UploadMaterialForm, { type OfferingChoice } from '@/components/UploadMaterialForm';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Upload Course Material page. Only logged in users can access it. */
const UploadPage = async () => {
  const session = await auth();
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; name: string };
    } | null,
  );

  // Every offering (one course, semester and instructor, from #25), so the form's choices
  // come from the database instead of sample lists (#26).
  const offerings = await prisma.offering.findMany({
    include: { course: true, instructor: true },
  });
  const choices: OfferingChoice[] = offerings.map((offering) => ({
    id: offering.id,
    course: offering.course.courseCode,
    semester: offering.semester,
    instructor: offering.instructor.name,
  }));

  return (
    <main>
      <UploadMaterialForm offerings={choices} />
    </main>
  );
};

export default UploadPage;
