import { BrowserWindow, ipcMain } from 'electron';
import { ipcConsts } from '../app/vars';
import FileManager from './fileManager';
import NodeManager from './nodeManager';
import DiskStorageManager from './diskStorageManager';
// eslint-disable-next-line import/no-cycle
import netService from './netService';
import WalletAutoStarter from './autoStartManager';

const subscribeToEventListeners = ({ mainWindow }) => {
  ipcMain.on(ipcConsts.READ_FILE, (event, request) => {
    FileManager.readFile({ event, ...request });
  });

  ipcMain.on(ipcConsts.COPY_FILE, (event, request) => {
    FileManager.copyFile({ event, ...request });
  });

  ipcMain.on(ipcConsts.READ_DIRECTORY, (event) => {
    FileManager.readDirectory({ browserWindow: mainWindow, event });
  });

  ipcMain.on(ipcConsts.SAVE_FILE, (event, request) => {
    FileManager.writeFile({ event, ...request });
  });

  ipcMain.on(ipcConsts.UPDATE_FILE, (event, request) => {
    FileManager.updateFile({ event, ...request });
  });

  ipcMain.on(ipcConsts.DELETE_FILE, (event, request) => {
    FileManager.deleteWalletFile({ browserWindow: mainWindow, ...request });
  });

  ipcMain.on(ipcConsts.WIPE_OUT, () => {
    FileManager.wipeOut({ browserWindow: mainWindow });
  });

  ipcMain.on(ipcConsts.GET_DRIVE_LIST, (event) => {
    DiskStorageManager.getDriveList({ event });
  });

  ipcMain.on(ipcConsts.OPEN_WALLET_BACKUP_DIRECTORY, (event, request) => {
    FileManager.openWalletBackupDirectory({ event, ...request });
  });

  ipcMain.on(ipcConsts.PRINT, (event, request: { content: string }) => {
    const printerWindow = new BrowserWindow({ width: 800, height: 800, show: true, webPreferences: { nodeIntegration: true, devTools: false } });
    const html = `<body>${request.content}</body><script>window.onafterprint = () => setTimeout(window.close, 3000); window.print();</script>`;
    printerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURI(html)}`);
  });

  ipcMain.on(ipcConsts.NOTIFICATION_CLICK, () => {
    mainWindow.show();
    mainWindow.focus();
  });

  ipcMain.on(ipcConsts.TOGGLE_AUTO_START, () => {
    WalletAutoStarter.toggleAutoStart();
  });

  ipcMain.on(ipcConsts.IS_AUTO_START_ENABLED_REQUEST_RESPONSE, (event) => {
    WalletAutoStarter.isEnabled({ event });
  });

  ipcMain.on(ipcConsts.START_NODE, (event) => {
    NodeManager.startNode({ event });
  });

  ipcMain.on(ipcConsts.HARD_REFRESH, () => {
    NodeManager.hardRefresh({ browserWindow: mainWindow });
  });

  ipcMain.once(ipcConsts.QUIT_NODE, (event) => {
    NodeManager.killNodeProcess({ event });
  });

  /**
   ******************************************* gRPS Calls **************************************
   */
  ipcMain.on(ipcConsts.CHECK_NODE_CONNECTION, (event) => {
    netService.checkNodeConnection({ event });
  });

  ipcMain.on(ipcConsts.GET_MINING_STATUS, (event) => {
    netService.getMiningStatus({ event });
  });

  ipcMain.on(ipcConsts.INIT_MINING, async (event, request) => {
    netService.initMining({ event, ...request });
  });

  ipcMain.on(ipcConsts.GET_GENESIS_TIME, (event) => {
    netService.getGenesisTime({ event });
  });

  ipcMain.on(ipcConsts.GET_UPCOMING_REWARDS, (event) => {
    netService.getUpcomingRewards({ event });
  });

  ipcMain.on(ipcConsts.GET_ACCOUNT_REWARDS, (event, request) => {
    netService.getAccountRewards({ event, ...request });
  });

  ipcMain.on(ipcConsts.SET_REWARDS_ADDRESS, (event, request) => {
    netService.setRewardsAddress({ event, ...request });
  });

  ipcMain.on(ipcConsts.SET_NODE_IP, async (event, request) => {
    netService.setNodeIpAddress({ event, ...request });
  });

  ipcMain.on(ipcConsts.GET_BALANCE, (event, request) => {
    netService.getBalance({ event, ...request });
  });

  ipcMain.on(ipcConsts.GET_NONCE, (event, request) => {
    netService.getNonce({ event, ...request });
  });

  ipcMain.on(ipcConsts.SEND_TX, (event, request) => {
    netService.sendTx({ event, ...request });
  });

  ipcMain.on(ipcConsts.GET_ACCOUNT_TXS, (event, request) => {
    netService.getAccountTxs({ event, ...request });
  });

  ipcMain.on(ipcConsts.GET_TX, (event, request) => {
    netService.getTransaction({ event, ...request });
  });
};

export { subscribeToEventListeners }; // eslint-disable-line import/prefer-default-export
