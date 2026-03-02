import { IconProps } from ".";

export const HamburgerMenu = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    data-slot="icon"
    aria-hidden="true"
    className={props.class || "size-6"}
  >
    <path
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
