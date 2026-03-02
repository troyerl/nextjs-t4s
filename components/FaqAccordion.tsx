"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answers: string[];
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex((current) => (current === index ? null : index))}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-lg font-semibold">{item.question}</span>
              <span className="text-xl leading-none text-gray-500">{isOpen ? "-" : "+"}</span>
            </button>
            {isOpen ? (
              <ul className="list-disc space-y-1 px-8 pb-4 text-gray-700">
                {item.answers.map((answer) => (
                  <li key={answer}>{answer}</li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
