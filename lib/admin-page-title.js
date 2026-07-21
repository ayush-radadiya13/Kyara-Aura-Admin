const ADMIN_PAGE_TITLES = [
  { match: /^\/dashboard/, title: "Dashboard" },
  { match: /^\/sub-category/, title: "Sub Category" },
  { match: /^\/category/, title: "Main Category" },
  { match: /^\/product/, title: "Products" },
  { match: /^\/orders/, title: "Orders" },
  { match: /^\/mobile-orders\/[^/]+$/, title: "Order Details" },
  { match: /^\/mobile-orders/, title: "Orders" },
  { match: /^\/return-orders/, title: "Return Orders" },
  { match: /^\/promo-code/, title: "Promo Code" },
  { match: /^\/reviews/, title: "Reviews" },
  { match: /^\/settings/, title: "Settings" },
];

export function getAdminPageTitle(pathname = "/") {
  const page = ADMIN_PAGE_TITLES.find((item) => item.match.test(pathname));
  return page?.title || "Admin";
}
