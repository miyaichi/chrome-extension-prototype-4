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

const updateCursorStyle = (enabled: boolean): void => {
  document.body.style.cursor = enabled ? 'crosshair' : '';
  logger.debug(`Cursor style updated: ${enabled ? 'crosshair' : 'default'}`);
};

const saveElementStyle = (element: HTMLElement): void => {
  if (styleMap.has(currentTabId)) {
    restoreElementStyle();
  }

  const originalStyles: Partial<Pick<CSSStyleDeclaration, StyleProperty>> = {};
  STYLE_PROPERTIES.forEach((prop) => {
    originalStyles[prop] = element.style[prop];
  });

  styleMap.set(currentTabId, { originalStyles, element });
  logger.debug('Original element styles saved', { tabId: currentTabId });
};

const applyHighlightStyle = (element: HTMLElement): void => {
  Object.entries(HIGHLIGHT_STYLES).forEach(([prop, value]) => {
    element.style[prop as StyleProperty] = value;
  });
  logger.debug('Highlight styles applied to element');
};

const restoreElementStyle = (): void => {
  const storedStyle = styleMap.get(currentTabId);
  if (!storedStyle) {
    logger.debug('No stored styles found to restore');
    return;
  }

  const { element, originalStyles } = storedStyle;
  Object.entries(originalStyles).forEach(([prop, value]) => {
    if (value !== undefined && prop in element.style) {
      element.style[prop as StyleProperty] = value;
    }
  });

  styleMap.delete(currentTabId);
  logger.debug('Element styles restored and cleared from storage');
};

const handleElementSelection = (element: HTMLElement): void => {
  const elementInfo = createElementInfo(element);
  logger.log('Element selected', { 
    tagName: element.tagName,
    id: element.id,
    classes: element.className
  });
  
  saveElementStyle(element);
  applyHighlightStyle(element);
  sendMessage(DOM_SELECTION_EVENTS.ELEMENT_SELECTED, { elementInfo });
};

const handleElementClick = (event: MouseEvent): void => {
  if (!selectionModeEnabled) return;

  const element = event.target as HTMLElement;
  if (!element || element === document.body) {
    logger.debug('Invalid element clicked or body element');
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  handleElementSelection(element);
};

const cleanup = (): void => {
  logger.log('Performing content script cleanup');
  restoreElementStyle();
  document.removeEventListener('click', handleElementClick, true);
};

const handleSelectionModeToggle = (message: Message<SelectionModePayload>): void => {
  logger.log('Selection mode changed:', message.payload.enabled);
  selectionModeEnabled = message.payload.enabled;
  updateCursorStyle(selectionModeEnabled);

  if (!selectionModeEnabled) {
    restoreElementStyle();
  }
};

const handleSelectElement = (message: Message<SelectElementPayload>): void => {
  const element = getElementByPath(message.payload.path);
  if (!element) {
    logger.error('Failed to find element with path:', message.payload.path);
    return;
  }
  logger.log('Element found by path, processing selection');
  handleElementSelection(element);
};

const handleClearSelection = (): void => {
  logger.log('Clearing element selection');
  restoreElementStyle();
  sendMessage(DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED, { timestamp: Date.now() });
};

const initialize = (): void => {
  logger.log('Initializing content script');
  manager.setContext('content');

  subscribe(DOM_SELECTION_EVENTS.TOGGLE_SELECTION_MODE, handleSelectionModeToggle);
  subscribe<SelectElementPayload>(DOM_SELECTION_EVENTS.SELECT_ELEMENT, handleSelectElement);
  subscribe(DOM_SELECTION_EVENTS.CLEAR_SELECTION, handleClearSelection);

  document.addEventListener('click', handleElementClick, true);
  logger.debug('Event listeners registered');

  chrome.runtime.onConnect.addListener((port) => {
    logger.debug('Port connection established');
    port.onDisconnect.addListener(cleanup);
  });

  chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' }, (response) => {
    currentTabId = response.tabId;
    logger.log('Current tab ID retrieved:', currentTabId);
  });
  
  logger.log('Content script initialization complete');
};

initialize();