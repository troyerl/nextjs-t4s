"use client";

import { PropsWithChildren, useMemo } from "react";
import { address, latLng } from "@/lib/constants";

interface AddressLinkProps extends PropsWithChildren {
  className?: string;
  id?: string;
}

export default function AddressLink({
  children,
  className,
  id,
}: AddressLinkProps) {
  const link = useMemo(() => {
    if (typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent;
      if (
        userAgent.includes("iPhone") ||
        userAgent.includes("iPad") ||
        userAgent.includes("iPod")
      ) {
        return `maps://maps.google.com/maps?daddr=${latLng.lat},${latLng.lng}&ll=`;
      }
    }

    return `https://www.google.com/maps/dir//${latLng.lat},${latLng.lng}/@${latLng.lat},${latLng.lng},12z`;
  }, []);

  return (
    <a
      id={id}
      href={link}
      className={className}
      aria-label="This link takes you to map directions"
      target="_blank"
      rel="noreferrer"
    >
      {address} {children}
    </a>
  );
}
