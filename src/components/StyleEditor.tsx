import { Check, Plus, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useConnectionManager } from '../lib/connectionManager';
import { Logger } from '../lib/logger';
import { DOM_SELECTION_EVENTS, ElementInfo, StyleModification } from '../types/domSelection';
import './StyleEditor.css';

interface StyleEditorProps {
  onStylesChange?: (modifications: StyleModification[]) => void;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({ onStylesChange }) => {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editedStyles, setEditedStyles] = useState<Record<string, string>>({});
  const [newProperty, setNewProperty] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { subscribe, sendMessage } = useConnectionManager();
  const logger = new Logger('StyleEditor');

  const previousStylesRef = useRef<Partial<Record<keyof CSSStyleDeclaration, string>>>({});

  useEffect(() => {
    const unsubscribeSelection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_SELECTED,
      (message: { payload: { elementInfo: ElementInfo } }) => {
        logger.log('Element selected:', message.payload.elementInfo);
        setSelectedElement(message.payload.elementInfo);
        setEditedStyles({});
        previousStylesRef.current = {};
        setIsAdding(false);
        setNewProperty('');
        setNewValue('');
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

  const handleStyleChange = (property: keyof CSSStyleDeclaration, value: string) => {
    const newStyles = {
      ...editedStyles,
      [property]: value,
    };

    setEditedStyles(newStyles);

    if (newStyles[property] !== previousStylesRef.current[property]) {
      previousStylesRef.current = newStyles;
      setTimeout(() => {
        const modifications = Object.entries(newStyles).map(([prop, val]) => ({
          property: prop,
          value: val,
        }));
        logger.log('Styles changed:', modifications);
        onStylesChange?.(modifications);
      }, 0);
    }

    sendMessage(DOM_SELECTION_EVENTS.UPDATE_ELEMENT_STYLE, {
      path: selectedElement?.path,
      styles: {
        [property]: value,
      },
    });
    logger.log('Style updated:', property, value);
  };

  const handleAddStyle = () => {
    const trimmedProperty = newProperty.trim();
    const trimmedValue = newValue.trim();

    if (!trimmedProperty || !trimmedValue) return;

    if (trimmedProperty in document.body.style) {
      logger.log('Adding new style:', trimmedProperty, trimmedValue);
      handleStyleChange(trimmedProperty as keyof CSSStyleDeclaration, trimmedValue);
      setNewProperty('');
      setNewValue('');
      setIsAdding(false);
    } else {
      logger.warn('Invalid CSS property:', trimmedProperty);
    }
  };

  if (!selectedElement?.computedStyle) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Style Editor</h2>
        </div>
        <div className="style-editor-empty">
          You can check and modify the computed style of the selected element.
        </div>
      </div>
    );
  }

  const styleEntries = Object.entries(selectedElement.computedStyle)
    .filter(([key]) => {
      return (
        typeof key === 'string' &&
        isNaN(Number(key)) &&
        typeof selectedElement.computedStyle[key as keyof CSSStyleDeclaration] !== 'function'
      );
    })
    .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Style Editor</h2>
      </div>
      <div className="style-editor">
        <div className="style-editor-search">
          <Search className="style-editor-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search styles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="style-editor-search-input"
          />
        </div>

        <div className="style-editor-content">
          <div className="style-editor-grid">
            {styleEntries.map(([property, value]) => (
              <React.Fragment key={property}>
                <div className="style-editor-property" title={property}>
                  {property}
                </div>
                <input
                  key={property}
                  defaultValue={editedStyles[property] ?? String(value)}
                  onBlur={(e) =>
                    handleStyleChange(property as keyof CSSStyleDeclaration, e.target.value)
                  }
                  className="style-editor-input"
                />
              </React.Fragment>
            ))}
          </div>

          <div className="style-editor-add">
            {isAdding ? (
              <div className="style-editor-add-form">
                <input
                  placeholder="Property"
                  value={newProperty}
                  onChange={(e) => setNewProperty(e.target.value)}
                  className="style-editor-input"
                />
                <input
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="style-editor-input"
                />
                <div className="style-editor-button-group">
                  <button
                    onClick={handleAddStyle}
                    className="style-editor-button style-editor-button-primary"
                    title="Add style"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewProperty('');
                      setNewValue('');
                    }}
                    className="style-editor-button style-editor-button-danger"
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="style-editor-button style-editor-button-primary"
                title="Add new style"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
