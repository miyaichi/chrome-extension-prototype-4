import { ConnectionManager, Message, useConnectionManager } from './lib/connectionManager';
import { Logger } from './lib/logger';
import {
  DOM_SELECTION_EVENTS,
  SelectElementPayload,
  SelectionModePayload,
} from './types/domSelection';
import { createElementInfo, getElementByPath } from './utils/domSelection';

// Types
type StyleProperty = 'backgroundColor' | 'outline' | 'border';

interface ElementStyle {
  originalStyles: Partial<Pick<CSSStyleDeclaration, StyleProperty>>;
  element: HTMLElement;
}

interface StyleConfig {
  backgroundColor: string;
  outline: string;
  border: string;
}

// Constants
const HIGHLIGHT_STYLES: StyleConfig = {
  backgroundColor: 'rgba(255, 255, 0, 0.3)',
  outline: '2px solid #ffd700',
  border: '1px solid #ffd700',
};

const STYLE_PROPERTIES: StyleProperty[] = ['backgroundColor', 'outline', 'border'];

// State declarations
const logger = new Logger('ContentScript');
const styleMap = new Map<number, ElementStyle>();
const { sendMessage, subscribe } = useConnectionManager();
const manager = ConnectionManager.getInstance();

let currentTabId: number;
let selectionModeEnabled = false;

/**
 * Updates the cursor style based on the selection mode
 * @param enabled - Boolean indicating whether selection mode is enabled
 */
const updateCursorStyle = (enabled: boolean): void => {
  document.body.style.cursor = enabled ? 'crosshair' : '';
};

/**
 * Saves the original styles of an element before applying highlight styles
 * @param element - The HTML element to save the styles for
 */
const saveElementStyle = (element: HTMLElement): void => {
  if (styleMap.has(currentTabId)) {
    restoreElementStyle();
  }

  const originalStyles: Partial<Pick<CSSStyleDeclaration, StyleProperty>> = {};
  STYLE_PROPERTIES.forEach((prop) => {
    originalStyles[prop] = element.style[prop];
  });

  styleMap.set(currentTabId, { originalStyles, element });
};

const applyHighlightStyle = (element: HTMLElement): void => {
  Object.entries(HIGHLIGHT_STYLES).forEach(([prop, value]) => {
    element.style[prop as StyleProperty] = value;
  });
};

const restoreElementStyle = (): void => {
  const storedStyle = styleMap.get(currentTabId);
  if (!storedStyle) return;

  const { element, originalStyles } = storedStyle;
  Object.entries(originalStyles).forEach(([prop, value]) => {
    if (value !== undefined && prop in element.style) {
      element.style[prop as StyleProperty] = value;
    }
  });

  styleMap.delete(currentTabId);
};

// Element selection handling
const handleElementSelection = (element: HTMLElement): void => {
  const elementInfo = createElementInfo(element);
  saveElementStyle(element);
  applyHighlightStyle(element);
  sendMessage(DOM_SELECTION_EVENTS.ELEMENT_SELECTED, { elementInfo });
};

const handleElementClick = (event: MouseEvent): void => {
  if (!selectionModeEnabled) return;

  const element = event.target as HTMLElement;
  if (!element || element === document.body) return;

  event.preventDefault();
  event.stopPropagation();
  handleElementSelection(element);
};

// Cleanup
const cleanup = (): void => {
  restoreElementStyle();
  document.removeEventListener('click', handleElementClick, true);
};

// Message handlers
const handleSelectionModeToggle = (message: Message<SelectionModePayload>): void => {
  logger.debug('Selection mode changed:', message.payload.enabled);
  selectionModeEnabled = message.payload.enabled;
  updateCursorStyle(selectionModeEnabled);

  if (!selectionModeEnabled) {
    restoreElementStyle();
  }
};

const handleSelectElement = (message: Message<SelectElementPayload>): void => {
  const element = getElementByPath(message.payload.path);
  if (!element) {
    logger.warn('Failed to find element with path:', message.payload.path);
    return;
  }
  handleElementSelection(element);
};

const handleClearSelection = (): void => {
  restoreElementStyle();
  sendMessage(DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED, { timestamp: Date.now() });
};

// Initialization
const initialize = (): void => {
  manager.setContext('content');

  // Set up message subscriptions
  subscribe(DOM_SELECTION_EVENTS.TOGGLE_SELECTION_MODE, handleSelectionModeToggle);
  subscribe<SelectElementPayload>(DOM_SELECTION_EVENTS.SELECT_ELEMENT, handleSelectElement);
  subscribe(DOM_SELECTION_EVENTS.CLEAR_SELECTION, handleClearSelection);

  // Set up event listeners
  document.addEventListener('click', handleElementClick, true);

  // Set up cleanup on disconnect
  chrome.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(cleanup);
  });

  // Get current tab ID
  chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' }, (response) => {
    currentTabId = response.tabId;
  });
};

initialize();
