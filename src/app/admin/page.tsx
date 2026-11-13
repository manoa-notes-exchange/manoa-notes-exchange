import AdminDashboard from '@/components/AdminDashboard';
import { adminProtectedPage } from '@/lib/page-protection';
import { auth } from '@/lib/auth';

const AdminPage = async () => {
  const session = await auth();
  adminProtectedPage(
    session as {
      user: { email: string; id: string; name: string };
    } | null,
  );

  return (
    <main>
      <AdminDashboard />
    </main>
  );
};

export default AdminPage;
