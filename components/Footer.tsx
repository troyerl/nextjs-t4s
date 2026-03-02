import Link from "next/link";
import AddressLink from "@/components/AddressLink";
import { email } from "@/lib/constants";
import { routes } from "@/lib/routes";
import Image from "next/image";

const linkSections = [
  {
    title: "Tools-4-Schools",
    subLinks: [
      { label: "Contact Us", url: routes.unauth.contactUs.path },
      { label: "FAQs", url: routes.unauth.faqs.path },
    ],
  },
  {
    title: "Legal",
    subLinks: [{ label: "Privacy Policy", url: routes.unauth.faqs.path }],
  },
  {
    title: "Contact",
    subLinks: [{ label: email, url: `mailto:${email}` }],
  },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 px-4 pt-8 text-center text-sm text-gray-500">
      <div className="flex flex-col gap-10 lg:mx-35 lg:flex-row">
        <div className="flex w-full flex-col items-center gap-4 text-center lg:w-1/4 lg:items-start lg:text-left">
          <Image
            src={"/assets/img/logo.png"}
            alt={"Tools-4-Schools Logo"}
            width={60}
            height={60}
          />
          <p>
            Supporting local teachers with the tools to help children succeed in
            the classroom.
          </p>
        </div>

        <div className="flex grow">
          <div className="flex w-full flex-col justify-around gap-8 lg:flex-row">
            {linkSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h4 className="font-bold">{section.title}</h4>
                <div className="flex flex-col gap-4">
                  {section.subLinks.map((link) => (
                    <Link
                      key={link.url}
                      href={link.url}
                      className="hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {section.title === "Contact" ? (
                    <AddressLink className="hover:underline" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pb-4 pt-8">
        © {new Date().getFullYear()} All rights reserved
      </div>
    </footer>
  );
}
