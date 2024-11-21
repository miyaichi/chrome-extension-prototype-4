import { Camera, Power, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DOMSelector } from '../components/DOMSelector';
import { SettingsPanel } from '../components/SettingsPanel';
import { ShareCapture } from '../components/ShareCapture';
import { StyleEditor } from '../components/StyleEditor';
import { useConnectionManager } from '../lib/connectionManager';
import { Logger } from '../lib/logger';
import '../styles/common.css';
import { DOM_SELECTION_EVENTS, ElementInfo, UI_EVENTS } from '../types/domSelection';
import './App.css';

export const App = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareCapture, setShowShareCapture] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const { sendMessage, subscribe } = useConnectionManager();
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
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
    }

    if (showSettings) {
      setShowSettings(false);
    }

    if (showShareCapture) {
      setShowShareCapture(false);
    }

    sendMessage(UI_EVENTS.SIDE_PANEL_CLOSED, { timestamp: Date.now() });
  };

  // Get current tab ID
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        setCurrentTabId(tabs[0].id);
      }
    });
  }, []);

  // Monitor tab change
  useEffect(() => {
    const handleTabChange = (activeInfo: chrome.tabs.TabActiveInfo) => {
      if (currentTabId !== null && activeInfo.tabId !== currentTabId) {
        logger.log('Tab changed, cleaning up');
        cleanup();
        setCurrentTabId(activeInfo.tabId);
      }
    };

    logger.log('Monitoring tab change');
    chrome.tabs.onActivated.addListener(handleTabChange);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
    };
  }, [currentTabId, isSelectionMode]);

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

  // Monitor element selection
  useEffect(() => {
    const unsubscribe = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_SELECTED,
      (message: { payload: { elementInfo: ElementInfo } }) => {
        logger.log('Element selected:', message.payload.elementInfo);
        setSelectedElement(message.payload.elementInfo);
      }
    );

    const unsubscribeUnselection = subscribe(DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED, () => {
      setSelectedElement(null);
    });

    return () => {
      unsubscribe();
      unsubscribeUnselection();
    };
  }, [subscribe]);

  // Monitor URL change
  useEffect(() => {
    const handleUrlChange = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (currentTabId === tabId && changeInfo.url && isSelectionMode) {
        logger.log('URL changed, cleaning up');
        cleanup();
      }
    };

    logger.log('Monitoring URL change');
    chrome.tabs.onUpdated.addListener(handleUrlChange);

    return () => {
      chrome.tabs.onUpdated.removeListener(handleUrlChange);
    };
  }, [currentTabId, isSelectionMode]);

  // Monitor Contents Reload
  useEffect(() => {
    const handleContentsReload = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (currentTabId === tabId && changeInfo.status === 'loading') {
        logger.log('Contents reloaded, cleaning up');
        cleanup();
      }
    };

    logger.log('Monitoring contents reload');
    chrome.tabs.onUpdated.addListener(handleContentsReload);

    return () => {
      chrome.tabs.onUpdated.removeListener(handleContentsReload);
    };
  }, [currentTabId, isSelectionMode]);

  const handleCapture = () => {
    setShowShareCapture(true);
    sendMessage(UI_EVENTS.CAPTURE_TAB, { timestamp: Date.now() });
  };

  const handleShareClose = () => {
    setShowShareCapture(false);
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
            <StyleEditor />
          </div>
        )}
      </div>
    </div>
  );
};
