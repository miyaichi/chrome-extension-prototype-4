import { ChevronUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useConnectionManager } from '../lib/connectionManager';
import { Logger } from '../lib/logger';
import { DOM_SELECTION_EVENTS, ElementInfo, SelectElementPayload } from '../types/domSelection';
import './DOMSelector.css';
import { DOMTreeView } from './DOMTreeView';

export const DOMSelector: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const { subscribe, sendMessage } = useConnectionManager();
  const logger = new Logger('DOMSelector');

  const handleElementSelect = (elementInfo: ElementInfo) => {
    const path: number[] = elementInfo.path;
    sendMessage<SelectElementPayload>(DOM_SELECTION_EVENTS.SELECT_ELEMENT, {
      path,
    });
  };

  const handleParentSelect = () => {
    if (!selectedElement) return;
    if (selectedElement.path.length === 0) return;

    logger.log('Parent element selected');
    const parentPath = selectedElement.path.slice(0, -1);
    sendMessage<SelectElementPayload>(DOM_SELECTION_EVENTS.SELECT_ELEMENT, {
      path: parentPath,
    });
  };

  const hasParentElement = (element: ElementInfo) => {
    return element.path.length > 0;
  };

  useEffect(() => {
    const unsubscribeSelection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_SELECTED,
      (message: { payload: { elementInfo: ElementInfo } }) => {
        logger.log('Element selected:', message.payload.elementInfo);
        const elementInfo = message.payload.elementInfo;
        setSelectedElement(elementInfo);
      }
    );

    const unsubscribeUnselection = subscribe(DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED, () => {
      logger.log('Element unselected');
      setSelectedElement(null);
    });

    return () => {
      unsubscribeSelection();
      unsubscribeUnselection();
    };
  }, []);

  if (!selectedElement) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">DOM Selector</h2>
        </div>
        <div className="style-editor-empty">
          No element is selected. Turn on Selection Mode and click on a component to display
          information about it and edit its style.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">DOM Selector</h2>
      </div>
      <div className="card-content">
        {selectedElement && (
          <>
            <div className="selected-element-info">
              <div className="element-header">
                <h3>Selected Element:</h3>
                {hasParentElement(selectedElement) && (
                  <button
                    onClick={handleParentSelect}
                    className="parent-nav-button"
                    title="Go to parent element"
                  >
                    <ChevronUp size={16} />
                  </button>
                )}
              </div>
              <div className="element-path">{selectedElement.path.join(' > ')}</div>
            </div>
            <DOMTreeView elementInfo={selectedElement} onSelect={handleElementSelect} />
          </>
        )}
      </div>
    </div>
  );
};
