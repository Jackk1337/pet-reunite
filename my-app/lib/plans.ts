export type PlanKey = "free" | "reunite" | "reunite-plus";

export type PlanConfig = {
  name: string;
  description: string;
  allocation: number;
  price: number;
  billingCycle: "monthly";
  priceId: string;
};

export const PLAN_CONFIG: Record<PlanKey, PlanConfig> = {
  free: {
    name: "Free",
    description: "Create a profile without physical tags.",
    allocation: 0,
    price: 0,
    billingCycle: "monthly",
    priceId: "",
  },
  reunite: {
    name: "Reunite",
    description: "Includes 1 complimentary dog tag.",
    allocation: 1,
    price: 6.99,
    billingCycle: "monthly",
    priceId: "price_1SUl8QF0oMy8sdsjUCNkA0Zt",
  },
  "reunite-plus": {
    name: "Reunite+",
    description: "Includes 3 complimentary dog tags.",
    allocation: 3,
    price: 13.99,
    billingCycle: "monthly",
    priceId: "price_1SUl91F0oMy8sdsjv5SzXEgG",
  },
};

