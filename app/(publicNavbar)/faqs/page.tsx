import type { Metadata } from "next";
import ContactUsForm from "@/components/ContactUsForm";
import FaqAccordion from "@/components/FaqAccordion";
import { apiGet } from "@/lib/api";
import HeroSection, {
  StackedHeader,
  BaseHeroSubHeader,
} from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "FAQs | T4S",
  description: "Tools-4-Schools frequently asked questions page",
};

const baseFaqs = [
  {
    question: "What is Tools-4-Schools?",
    answers: [
      "Started in 2002 by club member Dick Barnes.",
      "Program provides free supplies to teachers throughout the school year.",
      "Helps lessen the personal financial burden on teachers.",
      "A 501(c)(3) program.",
    ],
  },
  {
    question: "Where do we get our school supplies?",
    answers: [
      "Donations from members.",
      "Purchases from community and local businesses.",
      "Individual donations.",
    ],
  },
  {
    question: "What can you do to help?",
    answers: ["Continue support through donations.", "Financial support."],
  },
  {
    question: "What supplies are best to donate?",
    answers: [
      "Baggies (gallon zip lock)",
      "Clipboards",
      "Construction paper",
      "Crayons (24 count)",
      "Dry erase markers",
      "Folders",
      "Glue sticks",
      "Kleenex",
      "Rulers",
      "Scissors",
    ],
  },
];

async function getSchools() {
  return apiGet<string[]>("/school/list?distinct=name").catch(() => []);
}

export default async function FaqPage() {
  const schools = await getSchools();
  const faqs = [
    ...baseFaqs,
    {
      question: "What schools do we provide supplies to?",
      answers: schools.length
        ? schools
        : ["School list is currently unavailable."],
    },
    {
      question: "What if you do not carry an item I need in class?",
      answers: [
        "We will try our best to honor every request we can fulfill.",
        "If you are looking for a specific item, send us a message from the contact form.",
      ],
    },
  ];

  return (
    <>
      <HeroSection header={<StackedHeader main="How" subtext="can we help?" />}>
        <BaseHeroSubHeader text="Take a look at our frequently asked questions" />
      </HeroSection>
      <div className="screen-width-border screen-height-border mx-auto w-full max-w-6xl">
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-semibold">
              Frequently asked questions
            </h2>
            <FaqAccordion items={faqs} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold">
              Haven&apos;t found the right help?
            </h2>
            <p className="mt-2 text-gray-600">
              Send us a message and we will get back to you.
            </p>
            <ContactUsForm />
          </div>
        </div>
      </div>
    </>
  );
}
