import { loggedInProtectedPage } from '@/lib/page-protection';
import UploadMaterialForm from '@/components/UploadMaterialForm';
import { auth } from '@/lib/auth';

/** Upload Course Material page. Only logged in users can access it. */
const UploadPage = async () => {
  const session = await auth();
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; name: string };
    } | null,
  );
  return (
    <main>
      <UploadMaterialForm />
    </main>
  );
};

export default UploadPage;
