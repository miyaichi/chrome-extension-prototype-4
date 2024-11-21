/** Information about a DOM element in the tree structure */
export interface ElementInfo {
  /** HTML start tag of the element */
  startTag: string;
  /** HTML element's computed style */
  computedStyle: CSSStyleDeclaration;
  /** Array of indices representing the path from root to this element */
  path: number[];
  /** Child nodes in the element tree */
  children: ElementInfo[];
}

/** Payload for element selection events */
export interface SelectElementPayload {
  path: number[];
}

/** Payload for selection mode toggle events */
export interface SelectionModePayload {
  enabled: boolean;
}

/** Constants for DOM selection related events */
export const DOM_SELECTION_EVENTS = {
  SELECT_ELEMENT: 'SELECT_ELEMENT',
  ELEMENT_SELECTED: 'ELEMENT_SELECTED',
  ELEMENT_UNSELECTED: 'ELEMENT_UNSELECTED',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  UPDATE_ELEMENT_STYLE: 'UPDATE_ELEMENT_STYLE',
  TOGGLE_SELECTION_MODE: 'TOGGLE_SELECTION_MODE',
} as const;

/** Constants for UI related events */
export const UI_EVENTS = {
  SIDE_PANEL_CLOSED: 'SIDE_PANEL_CLOSED',
  CAPTURE_TAB: 'CAPTURE_TAB',
  CAPTURE_TAB_RESULT: 'CAPTURE_TAB_RESULT',
} as const;

/** Constants for browser state change events */
export const BROWSER_EVENTS = {
  TAB_ACTIVATED: 'TAB_ACTIVATED',
  TAB_UPDATED: 'TAB_UPDATED',
} as const;

export type DOMSelectionEvent = (typeof DOM_SELECTION_EVENTS)[keyof typeof DOM_SELECTION_EVENTS];

export type UIEvent = (typeof UI_EVENTS)[keyof typeof UI_EVENTS];

export interface Message<T = unknown> {
  type: DOMSelectionEvent;
  payload: T;
}
