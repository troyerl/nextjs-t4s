import type { Metadata } from "next";
import AddressLink from "@/components/AddressLink";
import { UnAuthNavbar } from "@/components/navbar/UnAuthNavbar";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Tools-4-Schools",
  description: "Tools-4-Schools website",
};

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="flex flex-col items-center justify-center p-4 text-center text-base font-bold">
        <h3>We have exciting news! We have moved to a new location!</h3>
        <AddressLink className="text-primary underline">
          (Basement of Plymouth United Church of Christ)
        </AddressLink>
      </div>

      <div className="sm:bg-size-auto flex grow flex-col bg-[url(/assets/img/background.jpg)] bg-size-[260%] bg-top bg-no-repeat sm:bg-cover sm:bg-center">
        <UnAuthNavbar isDarkText={false} />
        <div className="flex grow items-center justify-center pt-10">
          <div className="flex h-full flex-col items-center">
            <Image
              src={"/assets/img/children.png"}
              alt={"Children playing"}
              className="h-[17vh] w-auto md:h-[25vh]"
              width={900}
              height={300}
            />
            <div className="flex flex-col gap-3 px-2 pt-2 pb-3 text-center text-white">
              <h1 className="text-4xl font-bold md:text-6xl">
                Tools-4-Schools
              </h1>
              <h2 className="text-lg md:text-xl">
                Supporting local teachers with the tools to help children
                succeed in the classroom.
              </h2>
            </div>
            <Image
              src={"/assets/img/logo.png"}
              alt={"Tools-4-Schools Logo"}
              className="h-[20vh] w-auto md:h-[30vh]"
              width={900}
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
