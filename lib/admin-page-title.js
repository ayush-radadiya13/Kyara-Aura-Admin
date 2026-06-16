const ADMIN_PAGE_TITLES = [
  { match: /^\/dashboard/, title: "Dashboard" },
  { match: /^\/category/, title: "Category" },
  { match: /^\/orders/, title: "Orders" },
  { match: /^\/promo-code/, title: "Promo Code" },
  { match: /^\/products/, title: "Products" },
  { match: /^\/customers/, title: "Customers" },
  { match: /^\/settings/, title: "Settings" },
];

export function getAdminPageTitle(pathname = "/") {
  const page = ADMIN_PAGE_TITLES.find((item) => item.match.test(pathname));
  return page?.title || "Admin";
}
