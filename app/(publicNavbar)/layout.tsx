import Footer from "@/components/Footer";
import { UnAuthNavbar } from "@/components/navbar/UnAuthNavbar";

export default function PublicNavbarLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <UnAuthNavbar />
      {children}
      <Footer />
    </>
  );
}
