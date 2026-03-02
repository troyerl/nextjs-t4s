"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { address, grades } from "@/lib/constants";
import {
  clientApiGet,
  clientApiPost,
  clientApiPut,
  ClientApiError,
} from "@/lib/client-api";
import { useSnackbar } from "@/components/snackbar/SnackbarProvider";
import { IEvent, IGetShopperResponse, IShopper } from "@/lib/types";

interface ReservationWizardProps {
  event: IEvent;
}

interface ShopperFormState {
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  grade: string;
  classLoad: string;
}

const emptyForm: ShopperFormState = {
  firstName: "",
  lastName: "",
  email: "",
  school: "",
  grade: "",
  classLoad: "",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ReservationWizard({ event }: ReservationWizardProps) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"code" | "info">("code");
  const [code, setCode] = useState("");
  const [shopper, setShopper] = useState<IShopper | null>(null);
  const [shopperForm, setShopperForm] = useState<ShopperFormState>(emptyForm);
  const [schools, setSchools] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const availableTimes = useMemo(
    () => Object.keys(event.spotDetails?.availableSpots ?? {}),
    [event.spotDetails?.availableSpots],
  );
  const isExistingShopper = Boolean(shopper?.shopperId);

  useEffect(() => {
    if (mode !== "info") {
      return;
    }
    clientApiGet<string[]>("/school/list?distinct=name")
      .then((response) => setSchools(response))
      .catch(() =>
        enqueueSnackbar("Unable to load schools right now.", {
          variant: "error",
          duration: 5000,
        }),
      );
  }, [mode, enqueueSnackbar]);

  function hydrateShopperForm(nextShopper: IShopper) {
    setShopperForm({
      firstName: nextShopper.firstName,
      lastName: nextShopper.lastName,
      email: nextShopper.email,
      school: nextShopper.school,
      grade: nextShopper.grade,
      classLoad: String(nextShopper.classLoad ?? ""),
    });
  }

  async function lookupShopper() {
    if (code.length !== 4) {
      enqueueSnackbar("Please enter your 4-digit shopper code.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSubmitting(true);
    try {
      const response = await clientApiGet<IGetShopperResponse>(
        `/shopper/${code}?checkLastUpdated=true`,
      );
      if (response.needsUpdated) {
        setMode("info");
        setShopper(response.shopper);
        hydrateShopperForm(response.shopper);
        enqueueSnackbar("Please confirm your latest information.", {
          variant: "info",
          duration: 5000,
        });
      } else {
        setShopper(response.shopper);
        enqueueSnackbar(`Welcome back, ${response.shopper.firstName}!`, {
          variant: "success",
          duration: 4000,
        });
      }
    } catch (error) {
      if (error instanceof ClientApiError && error.status === 404) {
        enqueueSnackbar("Unable to find shopper with that code.", {
          variant: "error",
          duration: 5000,
        });
      } else {
        enqueueSnackbar("There was an error retrieving the shopper.", {
          variant: "error",
          duration: 5000,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function submitInfo(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    if (
      !shopperForm.firstName ||
      !shopperForm.lastName ||
      !shopperForm.email ||
      !shopperForm.school ||
      !shopperForm.grade ||
      !shopperForm.classLoad
    ) {
      enqueueSnackbar("Please complete all fields.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }

    if (!isValidEmail(shopperForm.email)) {
      enqueueSnackbar("Please provide a valid email address.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }

    if (Number(shopperForm.classLoad) <= 0) {
      enqueueSnackbar("Class load must be greater than 0.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }

    const payload = {
      shopperId: shopper?.shopperId ?? "",
      firstName: shopperForm.firstName,
      lastName: shopperForm.lastName,
      email: shopperForm.email,
      school: shopperForm.school,
      grade: shopperForm.grade,
      classLoad: Number(shopperForm.classLoad),
    };

    setSubmitting(true);
    try {
      const result = shopper?.shopperId
        ? await clientApiPut<IShopper>(`/shopper/${shopper.shopperId}`, {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            school: payload.school,
            grade: payload.grade,
            classLoad: payload.classLoad,
          })
        : await clientApiPost<IShopper>("/shopper", payload);
      setShopper(result);
      enqueueSnackbar("Shopper information saved.", {
        variant: "success",
        duration: 5000,
      });
      setMode("code");
    } catch {
      enqueueSnackbar("There was an error saving shopper information.", {
        variant: "error",
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReservation() {
    if (!shopper?.shopperId || !selectedTime) {
      enqueueSnackbar("Please select a shopper and reservation time.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }
    setSubmitting(true);
    try {
      await clientApiPost(`/event/${event._id}/reservation`, {
        time: selectedTime,
        shopperId: shopper.shopperId,
      });
      setStep(3);
      enqueueSnackbar("Reservation confirmed!", {
        variant: "success",
        duration: 6000,
      });
    } catch {
      enqueueSnackbar("There was an error creating your reservation.", {
        variant: "error",
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex gap-2 text-sm">
        {[
          { label: "Input Info" },
          { label: "Select a Time" },
          { label: "Confirm Reservation" },
          { label: "Reservation Complete", hideUntilComplete: true },
        ]
          .filter((item, index) => !(item.hideUntilComplete && step < index))
          .map((item, index) => (
            <div
              key={item.label}
              className={`rounded-full px-3 py-1 ${index <= step ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {item.label}
            </div>
          ))}
      </div>

      {step === 0 ? (
        <div>
          <h2 className="text-xl font-semibold">
            {mode === "code" ? "Welcome Back!" : "Welcome!"}
          </h2>
          <p className="mt-1 text-gray-600">
            {mode === "code"
              ? "Input your 4-digit shopping code below."
              : "Let us know about yourself below."}
          </p>

          {mode === "code" ? (
            <div className="mt-6 max-w-md">
              <input
                value={code}
                onChange={(eventValue) =>
                  setCode(eventValue.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="w-full rounded-md border border-gray-300 p-3 text-center text-xl tracking-[0.5em]"
                placeholder="0000"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={lookupShopper}
                disabled={submitting || code.length !== 4}
                className="mt-4 rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
              >
                {submitting ? "Retrieving..." : "Verify"}
              </button>

              {!shopper ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("info");
                    }}
                    className="text-primary underline"
                  >
                    Haven&apos;t shopped before or forgot your code?
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <form onSubmit={submitInfo} className="mt-6 grid max-w-2xl gap-3 md:grid-cols-2">
              <input
                value={shopperForm.firstName}
                onChange={(eventValue) =>
                  setShopperForm((current) => ({
                    ...current,
                    firstName: eventValue.target.value,
                  }))
                }
                placeholder="First Name"
                className="rounded-md border border-gray-300 p-3"
                disabled={isExistingShopper}
              />
              <input
                value={shopperForm.lastName}
                onChange={(eventValue) =>
                  setShopperForm((current) => ({
                    ...current,
                    lastName: eventValue.target.value,
                  }))
                }
                placeholder="Last Name"
                className="rounded-md border border-gray-300 p-3"
                disabled={isExistingShopper}
              />
              <input
                value={shopperForm.email}
                onChange={(eventValue) =>
                  setShopperForm((current) => ({
                    ...current,
                    email: eventValue.target.value,
                  }))
                }
                placeholder="Email"
                className="rounded-md border border-gray-300 p-3"
              />
              <select
                value={shopperForm.school}
                onChange={(eventValue) =>
                  setShopperForm((current) => ({
                    ...current,
                    school: eventValue.target.value,
                  }))
                }
                className="rounded-md border border-gray-300 p-3"
              >
                <option value="">Select School</option>
                {schools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
              <select
                value={shopperForm.grade}
                onChange={(eventValue) =>
                  setShopperForm((current) => ({
                    ...current,
                    grade: eventValue.target.value,
                  }))
                }
                className="rounded-md border border-gray-300 p-3"
              >
                <option value="">Select Grade</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
              <input
                value={shopperForm.classLoad}
                onChange={(eventValue) =>
                  setShopperForm((current) => ({
                    ...current,
                    classLoad: eventValue.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="Class Load"
                className="rounded-md border border-gray-300 p-3"
                inputMode="numeric"
              />
              <div className="md:col-span-2 flex gap-3">
                {isExistingShopper ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("code");
                    }}
                    className="rounded-md border border-gray-300 px-4 py-2 font-semibold"
                  >
                    Update Later
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("code");
                    }}
                    className="rounded-md border border-gray-300 px-4 py-2 font-semibold"
                  >
                    Input My Code
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
                >
                  {submitting ? "Saving..." : isExistingShopper ? "Looks Good!" : "Save Info"}
                </button>
              </div>
              {isExistingShopper ? (
                <p className="md:col-span-2 text-sm text-gray-600">
                  First and last name are locked for existing shoppers.
                </p>
              ) : null}
            </form>
          )}

          {shopper ? (
            <div className="mt-6 rounded-md bg-green-100 p-4 text-green-800">
              Ready as {shopper.firstName} {shopper.lastName}
            </div>
          ) : null}

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={!shopper}
              className="rounded-md bg-secondary px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <h2 className="text-xl font-semibold">Reserve a time</h2>
          <select
            value={selectedTime}
            onChange={(eventValue) => setSelectedTime(eventValue.target.value)}
            className="mt-4 w-full max-w-sm rounded-md border border-gray-300 p-3"
          >
            <option value="">Select a time</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="rounded-md border border-gray-300 px-4 py-2 font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!selectedTime}
              className="rounded-md bg-secondary px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              Confirm Reservation
            </button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h2 className="text-xl font-semibold">Confirm your reservation</h2>
          <div className="mt-4 space-y-2 text-gray-700">
            <p>
              <span className="font-semibold">Event:</span> {event.name}
            </p>
            <p>
              <span className="font-semibold">Time:</span> {selectedTime}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {address}
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-md border border-gray-300 px-4 py-2 font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={submitReservation}
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
            >
              {submitting ? "Reserving..." : "Reserve Spot"}
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✅
          </div>
          <h2 className="text-2xl font-semibold">Your reservation has been confirmed!</h2>
          <p className="mt-2 text-gray-600">
            You will receive an email confirmation shortly.
          </p>
        </div>
      ) : null}
    </div>
  );
}
