import { apiGet } from "@/lib/api";
import ReservationWizard from "@/components/reservation/ReservationWizard";
import { formatDateWithOrdinal, formatTimeRange } from "@/lib/date";
import Link from "next/link";
import type { Metadata } from "next";
import { IEvent } from "@/lib/types";

interface ReservePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ReservePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Reserve | T4S`,
    description: `Reserve your spot for event ${id}.`,
  };
}

export default async function ReserveEventPage({ params }: ReservePageProps) {
  const { id } = await params;
  const event = await apiGet<IEvent>(`/event/${id}?showSpots=true`).catch(
    () => null,
  );

  return (
    <div className="screen-width-border screen-height-border mx-auto w-full max-w-4xl">
      <div className="mb-8 rounded-xl bg-secondary px-6 py-8 text-white">
        <h1 className="text-4xl font-semibold">Reserve</h1>
        <h2 className="text-2xl font-semibold text-primary">a spot!</h2>
        {event ? (
          <p className="mt-4 text-sm md:text-base">
            {event.name}
            <br />
            {formatDateWithOrdinal(event.start)} {formatTimeRange(event.start, event.end)}
            {event.description ? (
              <>
                <br />
                Description: {event.description}
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="mb-5">
        <Link
          href="/reservation"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-secondary"
        >
          Back To Events
        </Link>
      </div>
      {!event ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Event was not found or is not available.
        </div>
      ) : (
        <div className="flex w-full justify-center">
          <div className="w-full md:w-3/4">
            <ReservationWizard event={event} />
          </div>
        </div>
      )}
    </div>
  );
}
