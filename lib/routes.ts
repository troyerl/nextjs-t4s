export interface AppRoute {
  path: string;
  label: string;
  mobileOnly?: boolean;
  hiddenDisplay?: boolean;
}

export const routes = {
  unauth: {
    base: { path: "/", label: "Home" },
    inventory: { path: "/inventory", label: "Inventory" },
    shop: { path: "/shop", label: "Shop", mobileOnly: true },
    reservation: { path: "/reservation", label: "Reservation" },
    contactUs: { path: "/contact-us", label: "Contact" },
    faqs: { path: "/faqs", label: "FAQ" },
    login: { path: "/login", label: "Login" },
    shoppingSuccess: {
      path: "/shopping-success",
      label: "Shopping Success",
      hiddenDisplay: true,
    },
    reserve: { path: "/reserve", label: "Reserve", hiddenDisplay: true },
  },
  auth: {
    base: { path: "/admin", label: "Dashboard" },
    inventory: { path: "/admin/inventory", label: "Inventory" },
    calendar: { path: "/admin/calendar", label: "Calendar" },
    settings: { path: "/admin/settings", label: "Settings" },
    shoppers: { path: "/admin/shoppers", label: "Shoppers" },
    transactions: { path: "/admin/transactions", label: "Transactions" },
    transaction: { path: "/admin/transaction", label: "Transaction" },
    reservations: { path: "/admin/reservations", label: "Reservations" },
  },
} satisfies {
  unauth: Record<string, AppRoute>;
  auth: Record<string, AppRoute>;
};

export const unauthNavbarRoutes: AppRoute[] = Object.values(routes.unauth).filter(
  (route) =>
    route.path !== routes.unauth.login.path &&
    !("hiddenDisplay" in route && route.hiddenDisplay),
);
