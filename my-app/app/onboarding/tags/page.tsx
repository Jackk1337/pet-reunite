"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ShoppingCart, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAN_CONFIG, type PlanKey } from "@/lib/plans";

type TagColor = {
  id: string;
  name: string;
  swatch: string;
  accent: string;
};

type TagProduct = {
  id: string;
  name: string;
  description: string;
  finish: string;
  heroGradient: string;
  colors: TagColor[];
};

type TagSelection = {
  selectionId: string;
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  colorSwatch: string;
};

const sharedPalette: TagColor[] = [
  { id: "sunset", name: "Sunset Orange", swatch: "#ffb067", accent: "#f5933c" },
  { id: "ocean", name: "Ocean Teal", swatch: "#36c8b0", accent: "#1ba68f" },
  { id: "midnight", name: "Midnight Navy", swatch: "#1f3a5f", accent: "#15273f" },
  { id: "petal", name: "Petal Pink", swatch: "#f4a9c4", accent: "#ec82aa" },
  { id: "slate", name: "Slate Grey", swatch: "#5f6c7b", accent: "#45505c" },
];

const tagOptions: TagProduct[] = [
  {
    id: "circle",
    name: "Dog Tag Circle",
    description: "Classic rounded stainless-steel tag with a soft enamel finish that highlights your pet's name.",
    finish: "Polished edges • Laser engraved QR code",
    heroGradient: "from-orange-200/60 via-white to-orange-100/60",
    colors: sharedPalette,
  },
  {
    id: "flat",
    name: "Dog Tag Flat",
    description: "Low-profile rectangular tag that lays flush against any collar — perfect for active adventures.",
    finish: "Matte finish • Deep etched QR code",
    heroGradient: "from-blue-200/50 via-white to-blue-100/60",
    colors: sharedPalette.map((color) => ({
      ...color,
      accent:
        color.id === "sunset"
          ? "#ff9f4d"
          : color.id === "ocean"
          ? "#1faf94"
          : color.id === "midnight"
          ? "#1b3352"
          : color.id === "petal"
          ? "#ea86a6"
          : "#4c5664",
    })),
  },
];

const createSelectionId = () => `selection-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function TagOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPlan = (searchParams.get("plan") as PlanKey) || "reunite";

  const [selectedPlanKey, setSelectedPlanKey] = useState<PlanKey>(
    PLAN_CONFIG[requestedPlan] ? requestedPlan : "reunite"
  );
  const [selectedTags, setSelectedTags] = useState<TagSelection[]>([]);
  const [pendingSelections, setPendingSelections] = useState<Record<string, TagColor | null>>(() =>
    Object.fromEntries(tagOptions.map((tag) => [tag.id, null]))
  );
  const [message, setMessage] = useState<string | null>(null);
  const [allowUnderSelection, setAllowUnderSelection] = useState(false);

  useEffect(() => {
    if (!PLAN_CONFIG[requestedPlan]) {
      setSelectedPlanKey("reunite");
    } else {
      setSelectedPlanKey(requestedPlan);
    }
  }, [requestedPlan]);

  useEffect(() => {
    const allowed = PLAN_CONFIG[selectedPlanKey].allocation;
    setAllowUnderSelection(false);
    if (selectedTags.length > allowed) {
    setSelectedTags((prev) => prev.slice(0, allowed));
    }
    setAllowUnderSelection(false);
    setPendingSelections((prev) => {
      const updated = { ...prev };
      tagOptions.forEach((tag) => {
        if (!(tag.id in updated)) {
          updated[tag.id] = null;
        }
      });
      return updated;
    });
  }, [selectedPlanKey, selectedTags.length]);

  const remaining = useMemo(() => PLAN_CONFIG[selectedPlanKey].allocation - selectedTags.length, [
    selectedPlanKey,
    selectedTags.length,
  ]);

  const handleSelectColor = (product: TagProduct, color: TagColor) => {
    setPendingSelections((prev) => ({
      ...prev,
      [product.id]: color,
    }));
    setMessage(null);
  };

  const handleAddPending = (product: TagProduct) => {
    const allowed = PLAN_CONFIG[selectedPlanKey].allocation;
    if (allowed === 0) {
      setMessage("The Free plan does not include complimentary tags.");
      return;
    }

    if (selectedTags.length >= allowed) {
      setMessage(`You've reached the ${allowed}-tag allowance for the ${PLAN_CONFIG[selectedPlanKey].name} plan.`);
      return;
    }

    const pendingColor = pendingSelections[product.id];
    if (!pendingColor) {
      setMessage("Choose a color first, then add it to your selections.");
      return;
    }

    const alreadySelected = selectedTags.some(
      (tag) => tag.productId === product.id && tag.colorId === pendingColor.id
    );
    if (alreadySelected) {
      setMessage("You've already added that color. Pick a different color or tag style.");
      return;
    }

    setSelectedTags((prev) => [
      ...prev,
      {
        selectionId: createSelectionId(),
        productId: product.id,
        productName: product.name,
        colorId: pendingColor.id,
        colorName: pendingColor.name,
        colorSwatch: pendingColor.swatch,
      },
    ]);
    setPendingSelections((prev) => ({
      ...prev,
      [product.id]: null,
    }));
    setMessage(null);
  };

  const handleRemoveSelection = (selectionId: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.selectionId !== selectionId));
    setMessage(null);
  };

  const handleContinue = () => {
    const allowed = PLAN_CONFIG[selectedPlanKey].allocation;
    if (allowed > 0 && selectedTags.length === 0) {
      setMessage("Select at least one tag color to continue.");
      return;
    }
    if (allowed > 0 && selectedTags.length !== allowed && !allowUnderSelection) {
      setMessage(`Please choose ${allowed} tag${allowed > 1 ? "s" : ""} to continue.`);
      return;
    }

    const params = new URLSearchParams({
      plan: selectedPlanKey,
      selections: JSON.stringify(selectedTags),
    });
    router.push(`/onboarding/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f9fa" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Step 1</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Choose your complimentary dog tags</h1>
          <p className="text-gray-600 max-w-2xl">
            Pick the tag style and color that matches your pet’s personality. We’ll engrave each tag with a unique QR
            code linked directly to your PetReunite profile.
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-lg border-gray-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Plan selected</p>
              <h2 className="text-2xl font-semibold text-gray-900">{PLAN_CONFIG[selectedPlanKey].name}</h2>
              <p className="text-gray-600">{PLAN_CONFIG[selectedPlanKey].description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tag allowance</p>
              <p className="text-3xl font-semibold text-gray-900">
                {PLAN_CONFIG[selectedPlanKey].allocation} tag
                {PLAN_CONFIG[selectedPlanKey].allocation === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Click a plan below if you change your mind.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {(Object.keys(PLAN_CONFIG) as PlanKey[]).map((planKey) => (
              <button
                key={planKey}
                onClick={() => {
                  setSelectedPlanKey(planKey);
                  setSelectedTags([]);
                  setPendingSelections((prev) => {
                    const reset = { ...prev };
                    tagOptions.forEach((tag) => (reset[tag.id] = null));
                    return reset;
                  });
                  setMessage(null);
                }}
                className={`text-left rounded-2xl border px-4 py-3 transition hover:shadow ${
                  selectedPlanKey === planKey
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-orange-200"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{PLAN_CONFIG[planKey].name}</p>
                <p className="text-sm text-gray-500">{PLAN_CONFIG[planKey].allocation} tag(s)</p>
                <p className="text-xs text-gray-400 mt-1">{PLAN_CONFIG[planKey].description}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 px-5 py-4 text-sm text-orange-700 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-orange-800">
                {PLAN_CONFIG[selectedPlanKey].allocation === 0
                  ? "This plan does not include complimentary tags."
                  : `${remaining} of ${PLAN_CONFIG[selectedPlanKey].allocation} selections remaining`}
              </p>
              <p className="text-orange-700/80">
                {PLAN_CONFIG[selectedPlanKey].allocation > 0
                  ? "Pick a style, choose a color, then add it to cart."
                  : "Upgrade to Reunite or Reunite+ to claim free tags."}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-orange-700">
              <Check className="h-4 w-4" />
              QR code engraving is included on every tag.
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {tagOptions.map((tag) => (
            <Card key={tag.id} className="overflow-hidden shadow-lg border-gray-200">
              <div className={`h-72 bg-gradient-to-br ${tag.heroGradient} flex items-center justify-center relative`}>
                <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
                <div className="relative w-4/5 h-3/4 rounded-[36px] shadow-2xl flex flex-col items-center justify-center border border-white/60 backdrop-blur">
                  <div className="w-3/4 h-20 rounded-full bg-white/90 shadow-inner flex items-center justify-center text-2xl font-semibold text-gray-600">
                    {tag.id === "circle" ? "◉" : "▭"}
                  </div>
                  <p className="mt-6 text-sm text-gray-600">{tag.finish}</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{tag.name}</h2>
                  <p className="text-gray-600 mt-1">{tag.description}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Pick a color</p>
                  <div className="flex flex-wrap gap-3">
                    {tag.colors.map((color) => {
                      const isPending = pendingSelections[tag.id]?.id === color.id;
                      return (
                        <button
                          key={color.id}
                          className={`relative h-14 w-14 rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-orange-200 ${
                            isPending ? "border-orange-500 scale-105" : "border-transparent"
                          }`}
                          style={{ background: `radial-gradient(circle at 30% 30%, #fff8, ${color.swatch})` }}
                          onClick={() => handleSelectColor(tag, color)}
                        >
                          {isPending && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleAddPending(tag)}
                  disabled={
                    PLAN_CONFIG[selectedPlanKey].allocation === 0 ||
                    !pendingSelections[tag.id] ||
                    selectedTags.length >= PLAN_CONFIG[selectedPlanKey].allocation
                  }
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to cart
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 shadow-md border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your selections</h3>
            <p className="text-sm text-gray-500">
              {selectedTags.length} of {PLAN_CONFIG[selectedPlanKey].allocation} chosen
            </p>
          </div>

          {selectedTags.length === 0 ? (
            <p className="text-gray-600 text-sm">
              {PLAN_CONFIG[selectedPlanKey].allocation > 0
                ? "No tags selected yet. Choose a color above to add it here."
                : "This plan does not include tags. Continue to finish onboarding."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {selectedTags.map((tag) => (
                <div
                  key={tag.selectionId}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white shadow-inner"
                    style={{ backgroundColor: tag.colorSwatch }}
                  />
                  <span className="text-sm text-gray-700">
                    {tag.productName} • {tag.colorName}
                  </span>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                    onClick={() => handleRemoveSelection(tag.selectionId)}
                    aria-label={`Remove ${tag.productName} ${tag.colorName}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {message && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              {message}
            </div>
          )}
          {PLAN_CONFIG[selectedPlanKey].allocation > 0 &&
            selectedTags.length > 0 &&
            selectedTags.length < PLAN_CONFIG[selectedPlanKey].allocation &&
            !allowUnderSelection && (
              <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-orange-800">
                  Prefer fewer tags? You can still continue with {selectedTags.length} tag
                  {selectedTags.length === 1 ? "" : "s"}.
                </p>
                <Button
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-100"
                  onClick={() => {
                    setAllowUnderSelection(true);
                    setMessage(null);
                  }}
                >
                  I only want {selectedTags.length} tag{selectedTags.length === 1 ? "" : "s"}
                </Button>
              </div>
            )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <p className="text-sm text-gray-500">
              You can always come back later to edit tag choices before we ship them.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => router.back()}>
                Back
              </Button>
              <Button
                style={{ backgroundColor: "#ffb067" }}
                className="hover:opacity-90"
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

