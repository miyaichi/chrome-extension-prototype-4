import { Check, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useConnectionManager } from '../lib/connectionManager';
import { DOM_SELECTION_EVENTS, ElementInfo } from '../types/domSelection';
import './StyleEditor.css';

export const StyleEditor: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editedStyles, setEditedStyles] = useState<Record<string, string>>({});
  const [newProperty, setNewProperty] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { subscribe, sendMessage } = useConnectionManager();

  useEffect(() => {
    const unsubscribeSelection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_SELECTED,
      (message: { payload: { elementInfo: ElementInfo } }) => {
        setSelectedElement(message.payload.elementInfo);
        setEditedStyles({});
        setIsAdding(false);
        setNewProperty('');
        setNewValue('');
      }
    );

    const unsubscribeUnselection = subscribe(DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED, () => {
      setSelectedElement(null);
    });

    return () => {
      unsubscribeSelection();
      unsubscribeUnselection();
    };
  }, []);

  const handleStyleChange = (property: string, value: string) => {
    setEditedStyles((prev) => ({
      ...prev,
      [property]: value,
    }));

    sendMessage(DOM_SELECTION_EVENTS.UPDATE_ELEMENT_STYLE, {
      path: selectedElement?.path,
      styles: {
        [property]: value,
      },
    });
  };

  const handleStyleDelete = (property: string) => {
    sendMessage(DOM_SELECTION_EVENTS.UPDATE_ELEMENT_STYLE, {
      path: selectedElement?.path,
      styles: {
        [property]: '',
      },
    });

    const newEditedStyles = { ...editedStyles };
    delete newEditedStyles[property];
    setEditedStyles(newEditedStyles);
  };

  const handleAddStyle = () => {
    if (!newProperty.trim() || !newValue.trim()) return;

    handleStyleChange(newProperty.trim(), newValue.trim());
    setNewProperty('');
    setNewValue('');
    setIsAdding(false);
  };

  if (!selectedElement?.computedStyle) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Style Editor</h2>
        </div>
        <div className="style-editor-empty">
          No element selected. Click an element to view and edit its styles.
        </div>
      </div>
    );
  }

  const styleEntries = Object.entries(selectedElement.computedStyle)
    .filter(([key]) => typeof key === 'string' && isNaN(Number(key)))
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
                  value={editedStyles[property] ?? String(value)}
                  onChange={(e) => handleStyleChange(property, e.target.value)}
                  className="style-editor-input"
                  title={editedStyles[property] ?? String(value)}
                />
                <button
                  onClick={() => handleStyleDelete(property)}
                  className="style-editor-button style-editor-button-danger"
                  title="Remove style"
                >
                  <Trash2 size={16} />
                </button>
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
