import AdminGuard from '@/components/auth/AdminGuard';

export default function AdminAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard requiredRole="admin" fallbackUrl="/dashboard">
      {children}
    </AdminGuard>
  );
}