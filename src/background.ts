// src/background/background.ts
import { ConnectionManager, Message } from './lib/connectionManager';
import { Logger } from './lib/logger';

const logger = new Logger('Background');

class BackgroundService {
  private static instance: BackgroundService | null = null;
  private manager: ConnectionManager;
  private activeTabId: number | null = null;

  private constructor() {
    this.manager = ConnectionManager.getInstance();

    if (BackgroundService.instance) {
      return BackgroundService.instance;
    }
    BackgroundService.instance = this;

    this.initialize();
  }

  public static getInstance(): BackgroundService {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService();
    }
    return BackgroundService.instance;
  }

  // Initialize
  private async initialize(): Promise<void> {
    logger.log('Initializing ...');
    this.setupInstallListener();
    this.setupMessageSubscription();
    this.setupTabListeners();
    this.setupWindowListeners();
    await this.initializeActiveTab();
    await this.initializeSidePanel();
    logger.log('initialization complete');
  }

  private setupInstallListener(): void {
    chrome.runtime.onInstalled.addListener(() => {
      logger.log('Extension installed');
    });
    chrome.action.onClicked.addListener((tab) => {
      chrome.sidePanel.open({ windowId: tab.windowId });
    });
  }

  private setupMessageSubscription(): void {
    this.manager.setContext('background');
    this.manager.subscribe('CAPTURE_TAB', this.captureTab.bind(this));
  }

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

  private setupTabListeners(): void {
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      logger.debug('Tab activated:', activeInfo.tabId);
      this.activeTabId = activeInfo.tabId;
      await this.handleTabChange(activeInfo.tabId);
    });

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (tabId === this.activeTabId && changeInfo.status === 'complete') {
        this.activeTabId = tabId;
        logger.debug('Tab updated:', tabId);
        await this.handleTabChange(tabId);
      }
    });
  }

  private setupWindowListeners(): void {
    chrome.windows.onFocusChanged.addListener(async (windowId) => {
      if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        logger.debug('Window focus changed:', windowId);
        const tabs = await chrome.tabs.query({ active: true, windowId });
        if (tabs[0]) {
          this.activeTabId = tabs[0].id ?? null;
          if (this.activeTabId) {
            await this.handleTabChange(this.activeTabId);
          }
        }
      }
    });
  }

  private async initializeActiveTab(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        this.activeTabId = tab.id;
        await this.handleTabChange(tab.id);
      }
    } catch (error) {
      logger.error('Failed to initialize active tab:', error);
    }
  }

  private async handleTabChange(tabId: number): Promise<void> {
    logger.debug('Handling tab change:', tabId);
    try {
      await this.manager.sendMessage('TAB_ACTIVATED', { timestamp: Date.now() });
    } catch (error) {
      logger.error('Failed to send TAB_ACTIVATED message:', error);
    }
  }

  private async initializeSidePanel(): Promise<void> {
    try {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } catch (error) {
      logger.error('Failed to set panel behavior:', error);
    }
  }
}

const backgroundService = BackgroundService.getInstance();
