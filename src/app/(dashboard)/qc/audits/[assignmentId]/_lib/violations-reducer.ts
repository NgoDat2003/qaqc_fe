export type ImagePreview = { id: string; url: string };

export type DraftViolation = {
  numErrors: number;
  note: string | null;
  imageIds: string[];           // sent to BE in draft/submit body
  imagePreviews: ImagePreview[]; // UI display only
};

export type ViolationsState = Record<string, DraftViolation>;

export type ViolationAction =
  | { type: "SET_ERRORS"; criteriaId: string; numErrors: number }
  | { type: "SET_NOTE"; criteriaId: string; note: string | null }
  | { type: "ADD_IMAGE"; criteriaId: string; imageId: string; url: string }
  | { type: "REMOVE_IMAGE"; criteriaId: string; imageId: string }
  | { type: "RESTORE"; violations: ViolationsState };

const emptyViolation = (): DraftViolation => ({
  numErrors: 0,
  note: null,
  imageIds: [],
  imagePreviews: [],
});

export function violationsReducer(
  state: ViolationsState,
  action: ViolationAction
): ViolationsState {
  switch (action.type) {
    case "SET_ERRORS": {
      const cur = state[action.criteriaId] ?? emptyViolation();
      return { ...state, [action.criteriaId]: { ...cur, numErrors: Math.max(0, action.numErrors) } };
    }
    case "SET_NOTE": {
      const cur = state[action.criteriaId] ?? emptyViolation();
      return { ...state, [action.criteriaId]: { ...cur, note: action.note } };
    }
    case "ADD_IMAGE": {
      const cur = state[action.criteriaId] ?? emptyViolation();
      return {
        ...state,
        [action.criteriaId]: {
          ...cur,
          imageIds: [...cur.imageIds, action.imageId],
          imagePreviews: [...cur.imagePreviews, { id: action.imageId, url: action.url }],
        },
      };
    }
    case "REMOVE_IMAGE": {
      const cur = state[action.criteriaId] ?? emptyViolation();
      return {
        ...state,
        [action.criteriaId]: {
          ...cur,
          imageIds: cur.imageIds.filter((id) => id !== action.imageId),
          imagePreviews: cur.imagePreviews.filter((img) => img.id !== action.imageId),
        },
      };
    }
    case "RESTORE":
      return action.violations;
    default:
      return state;
  }
}
