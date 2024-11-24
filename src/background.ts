// src/background.ts
import { ConnectionManager, Message } from './lib/connectionManager';
import { Logger } from './lib/logger';

const logger = new Logger('background');

class BackgroundService {
  private static instance: BackgroundService | null = null;
  private manager: ConnectionManager;

  constructor() {
    this.manager = ConnectionManager.getInstance();

    if (BackgroundService.instance) {
      return BackgroundService.instance;
    }
    BackgroundService.instance = this;

    this.initialize();
  }

  private async initialize() {
    logger.debug('Initializing BackgroundService...');
    logger.debug('Setting background context...');
    this.manager.setContext('background');
    logger.debug('Setting up event handlers...');
    await this.setupEventHandlers();
    logger.log('BackgroundService initialization complete');

    await this.setupSidePanel();
  }

  /**
   * Sets up event handlers for the background service
   */
  private setupEventHandlers() {
    // Debugging message handler
    this.manager.subscribe('DEBUG', (message: Message) => {
      const timestamp = new Date(message.timestamp).toISOString();
      logger.debug(
        `[${timestamp}] ${message.source} -> ${message.target || 'broadcast'}: ${message.type}`,
        message.payload
      );
    });

    // Tab capture handler
    this.manager.subscribe('CAPTURE_TAB', this.captureTab.bind(this));

    // Extension installation/update handler
    chrome.runtime.onInstalled.addListener(() => {
      logger.log('Extension installed/updated');
      this.setupSidePanel();
    });

    // Browser events
    chrome.action.onClicked.addListener(this.toggleSidePanel);
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
  }

  /**
   * Captures the current tab and sends the image data back to the requester
   */
  private async captureTab(message: Message) {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const windowId = tab.windowId;

      const imageDataUrl = await chrome.tabs.captureVisibleTab(windowId, {
        format: 'png',
        quality: 100,
      });

      await this.manager.sendMessage(
        'CAPTURE_TAB_RESULT',
        {
          success: true,
          imageDataUrl: imageDataUrl,
          url: tab.url || null,
        },
        message.source
      );
    } catch (error) {
      logger.error('Failed to capture tab:', error);
      await this.manager.sendMessage(
        'CAPTURE_TAB_RESULT',
        {
          success: false,
          error: (error as Error).message,
          url: null,
        },
        message.source
      );
    }
  }

  /**
   * Handles tab activation events
   */
  private async handleTabActivated({ tabId, windowId }: chrome.tabs.TabActiveInfo) {
    try {
      const tab = await chrome.tabs.get(tabId);
      logger.debug('Tab info retrieved:', tab);

      if (tab) {
        await this.manager.sendMessage('TAB_ACTIVATED', {
          tabId,
          windowId,
          url: tab.url || '',
          title: tab.title || '',
        });
        logger.debug('TAB_ACTIVATED message sent successfully');
      }
    } catch (error) {
      logger.error('Tab update handling error:', error);
    }
  }

  /**
   * Handles tab update events
   */
  private async handleTabUpdated(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) {
    // Check if the URL has changed or the page has completed loading
    if (changeInfo.url || changeInfo.status === 'complete') {
      try {
        // Get the current tab information
        const updatedTab = await chrome.tabs.get(tabId);

        // Create the update payload
        const updateInfo = {
          tabId,
          windowId: tab.windowId,
          url: updatedTab.url,
          title: updatedTab.title,
          isReload: changeInfo.status === 'complete',
          isUrlChange: Boolean(changeInfo.url),
        };

        // Log the update
        logger.debug('Tab updated:', updateInfo);

        // Broadcast the update to all listeners
        await this.manager.sendMessage('TAB_UPDATED', updateInfo);
        logger.debug('TAB_UPDATED message sent successfully');
      } catch (error) {
        logger.error('Tab update handling error:', error);
      }
    }
  }

  /**
   * Sets up the side panel configuration
   */
  private async setupSidePanel() {
    try {
      await chrome.sidePanel.setOptions({
        enabled: true,
        path: 'sidepanel.html',
      });
      logger.log('Side panel settings updated');
    } catch (error) {
      logger.error('Failed to setup side panel:', error);
    }
  }

  /**
   * Toggles the side panel visibility
   */
  private toggleSidePanel = (tab: chrome.tabs.Tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        logger.error('Failed to open side panel:', error);
      } else {
        logger.debug('Side panel opened successfully');
      }
    });
  };
}

// Initialize the background service
new BackgroundService();
