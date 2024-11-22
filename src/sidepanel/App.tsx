import { Camera, Power, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DOMSelector } from '../components/DOMSelector';
import { SettingsPanel } from '../components/SettingsPanel';
import { ShareCapture } from '../components/ShareCapture';
import { StyleEditor } from '../components/StyleEditor';
import { useConnectionManager } from '../lib/connectionManager';
import { Logger } from '../lib/logger';
import '../styles/common.css';
import {
  BROWSER_EVENTS,
  DOM_SELECTION_EVENTS,
  ElementInfo,
  StyleModification,
  UI_EVENTS,
} from '../types/domSelection';
import './App.css';

export const App = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareCapture, setShowShareCapture] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [styleModifications, setStyleModifications] = useState<StyleModification[]>([]);
  const { sendMessage, subscribe } = useConnectionManager();
  const logger = new Logger('SidePanel');

  // Cleanup
  const cleanup = () => {
    logger.log('Cleaning up');
    if (isSelectionMode) {
      setIsSelectionMode(false);
      sendMessage(DOM_SELECTION_EVENTS.TOGGLE_SELECTION_MODE, {
        enabled: false,
      });
      sendMessage(DOM_SELECTION_EVENTS.CLEAR_SELECTION, {
        timestamp: Date.now(),
      });
      setSelectedElement(null);
    }

    if (showSettings) {
      setShowSettings(false);
    }

    if (showShareCapture) {
      setShowShareCapture(false);
    }

    sendMessage(UI_EVENTS.SIDE_PANEL_CLOSED, { timestamp: Date.now() });
  };

  // Monitor visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logger.log('Document hidden, cleaning up');
        cleanup();
      }
    };

    logger.log('Monitoring visibility change');
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Monitor connection to the Chrome extension
    const port = chrome.runtime.connect({ name: 'sidepanel' });
    port.onDisconnect.addListener(cleanup);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      port.disconnect();
    };
  }, [isSelectionMode, showSettings]);

  // Monitor selection and tab events
  useEffect(() => {
    const unsubscribeSelection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_SELECTED,
      (message: { payload: { elementInfo: ElementInfo } }) => {
        logger.log('Element selected:', message.payload.elementInfo);
        setSelectedElement(message.payload.elementInfo);
      }
    );

    const unsubscribeUnselection = subscribe(DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED, () => {
      logger.log('Element unselected');
      setSelectedElement(null);
    });

    const unsubscribeTabActivated = subscribe(BROWSER_EVENTS.TAB_ACTIVATED, () => {
      logger.log('Tab activated, cleaning up');
      cleanup();
    });

    const unsubscribeTabUpdate = subscribe(BROWSER_EVENTS.TAB_UPDATED, () => {
      logger.log('Tab updated, cleaning up');
      cleanup();
    });

    return () => {
      unsubscribeSelection();
      unsubscribeUnselection();
      unsubscribeTabActivated();
      unsubscribeTabUpdate();
    };
  }, [subscribe]);

  const handleCapture = () => {
    setShowShareCapture(true);
    sendMessage(UI_EVENTS.CAPTURE_TAB, { timestamp: Date.now() });
  };

  const handleShareClose = () => {
    setShowShareCapture(false);
  };

  const handleStylesChange = (modifications: StyleModification[]) => {
    setStyleModifications(modifications);
  };

  const toggleSelectionMode = () => {
    const newMode = !isSelectionMode;
    if (!newMode) {
      sendMessage(DOM_SELECTION_EVENTS.CLEAR_SELECTION, {
        timestamp: Date.now(),
      });
    }
    setIsSelectionMode(newMode);
    sendMessage(DOM_SELECTION_EVENTS.TOGGLE_SELECTION_MODE, {
      enabled: newMode,
    });
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <div className="app-header">
          <button
            onClick={toggleSelectionMode}
            className={`selection-button ${isSelectionMode ? 'enabled' : 'disabled'}`}
          >
            <Power size={16} />
            {isSelectionMode ? 'Selection Mode On' : 'Selection Mode Off'}
          </button>

          <div className="header-actions">
            <button onClick={handleCapture} className="icon-button">
              <Camera size={16} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`icon-button ${showSettings ? 'active' : ''}`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {showSettings ? (
          <SettingsPanel />
        ) : (
          <div className="components-container">
            <DOMSelector />
            {showShareCapture && (
              <ShareCapture onClose={handleShareClose} initialSelectedElement={selectedElement} />
            )}
            <StyleEditor onStylesChange={handleStylesChange} />
          </div>
        )}
      </div>
    </div>
  );
};
