import { ConnectionManager, Message } from './lib/connectionManager';
import { Logger } from './lib/logger';

interface TabInfo {
  id: number;
  windowId: number;
  url: string | undefined;
  title: string | undefined;
  domain: string | undefined;
}

class BackgroundService {
  private static instance: BackgroundService | null = null;
  private manager: ConnectionManager;
  private currentTabInfo: TabInfo | null = null;
  private logger: Logger;

  constructor() {
    this.manager = ConnectionManager.getInstance();
    this.logger = new Logger('background');

    if (BackgroundService.instance) {
      return BackgroundService.instance;
    }
    BackgroundService.instance = this;

    this.initialize();
  }

  private async initialize() {
    this.logger.log('Initializing BackgroundService...');
    this.manager.setContext('background');
    await this.setupEventHandlers();
    await this.initializeActiveTab();
    await this.setupSidePanel();
    this.logger.log('BackgroundService initialization complete');
  }

  private setupEventHandlers() {
    // メッセージサブスクリプション
    this.manager.subscribe('DEBUG', (message: Message) => {
      const timestamp = new Date(message.timestamp).toISOString();
      this.logger.debug(
        `[${timestamp}] ${message.source} -> ${message.target || 'broadcast'}: ${message.type}`,
        message.payload
      );
    });
    this.manager.subscribe('CAPTURE_TAB', this.captureTab.bind(this));

    // 拡張機能イベント
    chrome.runtime.onInstalled.addListener(() => {
      this.logger.log('Extension installed/updated');
      this.setupSidePanel();
    });
    chrome.action.onClicked.addListener(this.toggleSidePanel);

    // タブイベント
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));

    // ウィンドウイベント
    chrome.windows.onFocusChanged.addListener(this.handleWindowFocusChanged.bind(this));
  }

  private async handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      this.currentTabInfo = this.createTabInfo(tab);

      await this.manager.sendMessage('TAB_ACTIVATED', {
        ...this.currentTabInfo,
      });
      this.logger.debug('TAB_ACTIVATED message sent successfully');
    } catch (error: unknown) {
      this.logger.error('Tab activation handling error:', error);
    }
  }

  private async handleTabUpdated(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) {
    if (changeInfo.url || changeInfo.status === 'complete') {
      try {
        const updatedTab = await chrome.tabs.get(tabId);
        if (this.currentTabInfo?.id === tabId) {
          this.currentTabInfo = this.createTabInfo(updatedTab);
        }

        await this.manager.sendMessage('TAB_UPDATED', {
          ...this.currentTabInfo,
          isReload: changeInfo.status === 'complete',
          isUrlChange: Boolean(changeInfo.url),
        });
        this.logger.debug('TAB_UPDATED message sent successfully');
      } catch (error) {
        this.logger.error('Tab update handling error:', error);
      }
    }
  }

  private async handleTabRemoved(tabId: number) {
    if (this.currentTabInfo?.id === tabId) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          this.currentTabInfo = this.createTabInfo(tab);
          await this.manager.sendMessage('TAB_ACTIVATED', {
            ...this.currentTabInfo,
          });
          this.logger.debug('New active tab found and activated');
        }
      } catch (error) {
        this.logger.error('Failed to handle tab removal:', error);
        this.currentTabInfo = null;
      }
    }
  }

  private async handleWindowFocusChanged(windowId: number) {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      this.currentTabInfo = null;
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, windowId });
      if (tab?.id) {
        this.currentTabInfo = this.createTabInfo(tab);
        await this.manager.sendMessage('TAB_ACTIVATED', {
          ...this.currentTabInfo,
        });
        this.logger.debug('Window focus changed successfully');
      }
    } catch (error) {
      this.logger.error('Window focus change handling error:', error);
    }
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
      this.logger.error('Failed to capture tab:', error);
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

  private async initializeActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        this.currentTabInfo = this.createTabInfo(tab);
        await this.manager.sendMessage('TAB_ACTIVATED', {
          ...this.currentTabInfo,
        });
        this.logger.debug('Active tab initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize active tab:', error);
    }
  }

  private async setupSidePanel() {
    try {
      await chrome.sidePanel.setOptions({
        enabled: true,
        path: 'sidepanel.html',
      });
      this.logger.log('Side panel settings updated');
    } catch (error) {
      this.logger.error('Failed to setup side panel:', error);
    }
  }

  private createTabInfo(tab: chrome.tabs.Tab): TabInfo {
    return {
      id: tab.id!,
      windowId: tab.windowId,
      url: tab.url,
      title: tab.title,
      domain: this.getDomain(tab.url),
    };
  }

  private getDomain(url: string | undefined): string | undefined {
    if (!url) return undefined;
    try {
      return new URL(url).hostname;
    } catch {
      return undefined;
    }
  }

  private toggleSidePanel = (tab: chrome.tabs.Tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        this.logger.error('Failed to open side panel:', error);
      } else {
        this.logger.log('Side panel opened successfully');
      }
    });
  };
}

export default new BackgroundService();
