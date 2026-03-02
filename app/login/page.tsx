import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { UnAuthNavbar } from "@/components/navbar/UnAuthNavbar";
import { routes } from "@/lib/routes";
import { isLoggedIn } from "@/lib/session";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login | T4S",
  description: "Tools-4-Schools admin login page",
};

export default async function LoginPage() {
  if (await isLoggedIn()) {
    redirect(routes.auth.base.path);
  }

  return (
    <div className="flex min-h-screen w-screen flex-col">
      <UnAuthNavbar />
      <div className="screen-width-border flex grow flex-col items-center justify-center py-10">
        <div className="w-full md:w-125">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                Sign in to Tools-4-Schools
              </h1>
              <h2 className="text-gray-600">Enter your credentials below.</h2>
            </div>
            <Image
              src={"/assets/img/logo.png"}
              alt={"Tools-4-Schools Logo"}
              width={60}
              height={60}
            />
          </div>

          <div className="flex flex-col gap-4">
            <LoginForm />
            <div className="mb-2 flex w-full flex-col justify-center gap-2">
              <p className="font-semibold">
                This is an admin sign in only, teachers do not have a sign in.
              </p>
              <p>
                If you are a teacher trying to create a reservation, please
                visit the{" "}
                <Link
                  className="font-semibold text-primary hover:underline"
                  href={routes.unauth.reservation.path}
                >
                  Reservation Page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
