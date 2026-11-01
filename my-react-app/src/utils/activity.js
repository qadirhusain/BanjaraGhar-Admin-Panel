// Turns "PUT /api/admin/home-sections/{id}" into a sentence an admin can read.
// Ids in the stored action are already replaced with {id}.
const RULES = [
  // Products
  ["POST", /^\/products$/, "Added a product"],
  ["PUT", /^\/products\/\{id\}$/, "Edited a product"],
  ["PATCH", /^\/products\/\{id\}\/active$/, "Changed product visibility"],
  ["PATCH", /^\/products\/\{id\}\/stock$/, "Updated product stock"],
  [
    "PATCH",
    /^\/products\/\{id\}\/featured$/,
    "Changed product featured status",
  ],
  ["PUT", /^\/products\/\{id\}\/related$/, "Updated related products"],
  ["POST", /^\/products\/\{id\}\/images$/, "Uploaded product images"],
  ["PUT", /^\/products\/\{id\}\/images\/order$/, "Reordered product images"],
  ["DELETE", /^\/products\/\{id\}\/images\/\{id\}$/, "Deleted a product image"],

  // Categories
  ["POST", /^\/categories$/, "Added a category"],
  ["PUT", /^\/categories\/\{id\}$/, "Edited a category"],
  ["PATCH", /^\/categories\/\{id\}\/active$/, "Changed category visibility"],

  // Orders and returns
  ["POST", /^\/orders\/\{id\}\/cancel$/, "Cancelled an order"],
  ["POST", /^\/orders\/\{id\}\/shipment\/retry$/, "Retried shipment creation"],
  ["POST", /^\/returns\/\{id\}\/approve$/, "Approved a return"],
  ["POST", /^\/returns\/\{id\}\/reject$/, "Rejected a return"],

  // Coupons
  ["POST", /^\/coupons$/, "Added a coupon"],
  ["PUT", /^\/coupons\/\{id\}$/, "Edited a coupon"],
  ["PATCH", /^\/coupons\/\{id\}\/active$/, "Changed coupon status"],
  ["DELETE", /^\/coupons\/\{id\}$/, "Deleted a coupon"],

  // Banners
  ["POST", /^\/banners\/image$/, "Uploaded an image"],
  ["POST", /^\/banners$/, "Added a banner"],
  ["PUT", /^\/banners\/\{id\}$/, "Edited a banner"],
  ["PATCH", /^\/banners\/\{id\}\/active$/, "Changed banner status"],
  ["DELETE", /^\/banners\/\{id\}$/, "Deleted a banner"],

  // Home sections
  ["POST", /^\/home-sections$/, "Added a home section"],
  ["PUT", /^\/home-sections\/\{id\}$/, "Edited a home section"],
  ["PATCH", /^\/home-sections\/\{id\}\/active$/, "Changed home section status"],
  [
    "PUT",
    /^\/home-sections\/\{id\}\/products$/,
    "Updated home section products",
  ],
  ["DELETE", /^\/home-sections\/\{id\}$/, "Deleted a home section"],

  // Reviews, messages, subscribers, settings
  ["PATCH", /^\/reviews\/\{id\}\/visible$/, "Changed review visibility"],
  ["PATCH", /^\/messages\/\{id\}\/status$/, "Changed message status"],
  [
    "PATCH",
    /^\/newsletter\/subscribers\/\{id\}\/active$/,
    "Changed subscriber status",
  ],
  ["PUT", /^\/settings\/shipping$/, "Updated shipping settings"],
];

const VERBS = {
  POST: "Added",
  PUT: "Updated",
  PATCH: "Updated",
  DELETE: "Deleted",
};

export function describeAction(action) {
  const [method, fullPath = ""] = action.split(" ");
  const path = fullPath.replace("/api/admin", "");

  const rule = RULES.find(
    ([ruleMethod, pattern]) => ruleMethod === method && pattern.test(path),
  );
  if (rule) return rule[2];

  // Fallback for any endpoint added later: "Updated coupons"
  const entity = path.split("/")[1] ?? "item";
  return `${VERBS[method] ?? method} ${entity}`;
}
