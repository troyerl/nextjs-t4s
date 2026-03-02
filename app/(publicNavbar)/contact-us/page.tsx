import type { Metadata } from "next";
import AddressLink from "@/components/AddressLink";
import ContactUsForm from "@/components/ContactUsForm";
import GoogleMap from "@/components/GoogleMap";
import { email } from "@/lib/constants";
import HeroSection, { StackedHeader } from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Contact Us | T4S",
  description: "Tools-4-Schools contact page",
};

export default function ContactUsPage() {
  return (
    <>
      <HeroSection
        header={<StackedHeader main="Where" subtext="can you find us?" />}
      >
        <div className="flex flex-col items-center text-base text-white lg:items-start">
          <AddressLink className="underline" id="address-link">
            <>
              <br className="lg:hidden" />
              <span className="text-primary"> (Click for directions)</span>
            </>
          </AddressLink>
          <p>{email}</p>
        </div>
      </HeroSection>

      <div className="screen-width-border screen-height-border mx-auto w-full max-w-6xl">
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold">Feel free to contact us.</h2>
            <p className="mt-2 text-gray-600">
              We&apos;ll be glad to hear from you.
            </p>
            <ContactUsForm />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold">Map</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <GoogleMap />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
