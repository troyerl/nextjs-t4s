import type { Metadata } from "next";
import AddressLink from "@/components/AddressLink";
import ContactUsForm from "@/components/ContactUsForm";
import GoogleMap from "@/components/GoogleMap";
import { email } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us | T4S",
  description: "Tools-4-Schools contact page",
};

export default function ContactUsPage() {
  return (
    <div className="screen-width-border screen-height-border mx-auto w-full max-w-6xl">
      <h1 className="text-center text-4xl font-semibold text-secondary">Where</h1>
      <h2 className="text-center text-3xl font-semibold text-primary">can you find us?</h2>
      <div className="mt-3 text-center">
        <AddressLink className="text-primary underline">
          <span className="text-primary"> (Click for directions)</span>
        </AddressLink>
        <p className="mt-2 text-gray-700">{email}</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-2xl font-semibold">Feel free to contact us.</h2>
          <p className="mt-2 text-gray-600">We&apos;ll be glad to hear from you.</p>
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
  );
}
