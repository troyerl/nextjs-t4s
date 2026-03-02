import Link from "next/link";
export default function AdminDashboardPage() {
  return (
    <div>
      Admin Dashboard <Link href="/admin/calendar">Calendar</Link>
    </div>
  );
}
