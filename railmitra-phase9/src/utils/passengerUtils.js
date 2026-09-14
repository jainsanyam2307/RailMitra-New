export function getPassengerCategory(age) {
  const numericAge = Number(age);

  if (!Number.isFinite(numericAge) || numericAge < 0) {
    return null;
  }

  if (numericAge <= 5) {
    return {
      code: "infant",
      label: "Infant",
      description: "Free · No seat",
      fareMultiplier: 0,
      lowerBerthPriority: false,
    };
  }

  if (numericAge < 12) {
    return {
      code: "child",
      label: "Child",
      description: "Half ticket",
      fareMultiplier: 0.5,
      lowerBerthPriority: false,
    };
  }

  if (numericAge >= 60) {
    return {
      code: "senior",
      label: "Senior Citizen",
      description: "Lower berth priority",
      fareMultiplier: 1,
      lowerBerthPriority: true,
    };
  }

  return {
    code: "adult",
    label: "Adult",
    description: "Full ticket",
    fareMultiplier: 1,
    lowerBerthPriority: false,
  };
}

export function getSpecialRequirementLabel(value) {
  const labels = {
    none: "No special requirement",
    pwd: "Person with Disability",
    pregnant: "Pregnant Woman",
  };

  return labels[value] ?? labels.none;
}

function createPassengerId() {
  // Network URLs served over plain HTTP are not always secure contexts,
  // so crypto.randomUUID() may be unavailable on a phone or LAN IP.
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `passenger-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyPassenger() {
  return {
    id: createPassengerId(),
    name: "",
    age: "",
    gender: "",
    foodPreference: "Vegetarian",
    idProofType: "",
    idProofNumber: "",
    specialRequirement: "none",
  };
}
