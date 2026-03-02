"use client";

import { FormEvent, useState } from "react";
import { clientApiPost } from "@/lib/client-api";
import { useSnackbar } from "@/components/snackbar/SnackbarProvider";

interface ContactFormState {
  name: string;
  email: string;
  school: string;
  phone: string;
  message: string;
}

const initialState: ContactFormState = {
  name: "",
  email: "",
  school: "",
  phone: "",
  message: "",
};

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ContactUsForm() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name || !form.email || !form.school || !form.message) {
      enqueueSnackbar("Please complete all required fields.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }

    if (!isValidEmail(form.email)) {
      enqueueSnackbar("Please provide a valid email.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }

    if (form.phone && !isValidPhoneNumber(form.phone)) {
      enqueueSnackbar("Please enter a valid phone number.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }

    setSubmitting(true);
    try {
      await clientApiPost("/email/contact", form);
      enqueueSnackbar(
        <>
          Information has been sent.
          <br />
          We will get in contact with you as soon as we can!
        </>,
        {
          variant: "success",
          duration: 10000,
        },
      );
      setForm(initialState);
    } catch {
      enqueueSnackbar(
        "There was an error sending your message. Please try again later.",
        {
          variant: "error",
          duration: 5000,
        },
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-3" onSubmit={onSubmit}>
      <input
        className="w-full rounded-md border border-gray-300 p-3"
        placeholder="Name"
        value={form.name}
        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
      />
      <input
        className="w-full rounded-md border border-gray-300 p-3"
        placeholder="Email"
        value={form.email}
        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
      />
      <input
        className="w-full rounded-md border border-gray-300 p-3"
        placeholder="School"
        value={form.school}
        onChange={(event) => setForm((current) => ({ ...current, school: event.target.value }))}
      />
      <input
        className="w-full rounded-md border border-gray-300 p-3"
        placeholder="Phone (optional)"
        value={form.phone}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            phone: formatPhoneNumber(event.target.value),
          }))
        }
      />
      <textarea
        className="w-full rounded-md border border-gray-300 p-3"
        placeholder="Message"
        rows={4}
        value={form.message}
        onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
      />
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 font-semibold text-white"
        disabled={submitting}
      >
        {submitting ? "Sending..." : "Submit Now"}
      </button>
    </form>
  );
}
