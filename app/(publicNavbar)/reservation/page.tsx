import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { formatDateWithOrdinal, formatTimeRange } from "@/lib/date";
import { routes } from "@/lib/routes";
import { IEvent } from "@/lib/types";

export const metadata: Metadata = {
  title: "Reservation | T4S",
  description: "Tools-4-Schools reservation page",
};

async function getEvents() {
  const events = await apiGet<IEvent[]>("/event/list").catch(() => []);
  return [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
}

export default async function ReservationPage() {
  const events = await getEvents();

  return (
    <div className="screen-width-border screen-height-border mx-auto w-full max-w-7xl">
      <h1 className="text-center text-4xl font-semibold text-secondary">When</h1>
      <h2 className="text-center text-3xl font-semibold text-primary">can you come?</h2>
      <p className="mt-3 text-center text-gray-600">
        Currently we are only allowing 10 people every 30 minutes, so make sure to
        reserve a spot.
      </p>

      {events.length === 0 ? (
        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          No events scheduled at this time.
        </div>
      ) : (
        <div className="animate-slide-in-from-bottom mt-10 text-center">
          <h2 className="mb-8 text-3xl font-semibold text-gray-900">Upcoming Events</h2>
          <ul className="flex flex-col gap-4 md:flex-row md:justify-center">
            {events.map((event) => (
              <li
                key={event._id}
                className="flex w-full flex-col rounded-xl border border-gray-200 bg-white p-6 text-center shadow-md transition duration-200 ease-in-out hover:scale-[1.01] hover:shadow-lg md:max-w-[500px]"
              >
                <div className="flex grow flex-col">
                  <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                  <p className="mt-2 text-gray-700">{formatDateWithOrdinal(event.start)}</p>
                  <p className="text-sm text-gray-600">
                    {formatTimeRange(event.start, event.end)}
                  </p>
                  {event.description ? (
                    <p className="mt-3 grow text-sm text-gray-700">{event.description}</p>
                  ) : (
                    <div className="grow" />
                  )}
                </div>
                <div className="mt-5">
                  <Link
                    href={`${routes.unauth.reserve.path}/${event._id}`}
                    className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
                  >
                    Reserve
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
