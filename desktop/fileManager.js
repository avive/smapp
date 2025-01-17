import fs from 'fs';
import util from 'util';
import path from 'path';
import { app, dialog, shell } from 'electron';
import { ipcConsts } from '../app/vars';

const readFileAsync = util.promisify(fs.readFile);
const readDirectoryAsync = util.promisify(fs.readdir);
const writeFileAsync = util.promisify(fs.writeFile);
const unlinkFileAsync = util.promisify(fs.unlink);

// Linux: ~/.config/<App Name>
// Mac OS: ~/Library/Application Support/<App Name>
// Windows: C:\Users\<user>\AppData\Local\<App Name>
const appFilesDirPath = app.getPath('userData');
const documentsDirPath = app.getPath('documents');

class FileManager {
  static copyFile = ({ event, fileName, filePath, newFileName, saveToDocumentsFolder }) => {
    const newFilePath = saveToDocumentsFolder ? path.join(documentsDirPath, newFileName) : path.join(appFilesDirPath, fileName);
    fs.copyFile(filePath, newFilePath, (error) => {
      if (error) {
        event.sender.send(ipcConsts.COPY_FILE_RESPONSE, { error });
      }
      event.sender.send(ipcConsts.COPY_FILE_RESPONSE, { error: null, newFilePath });
    });
  };

  static openWalletBackupDirectory = async ({ event, lastBackupTime }) => {
    try {
      const files = await readDirectoryAsync(lastBackupTime ? documentsDirPath : appFilesDirPath);
      const regex = new RegExp(lastBackupTime || '(my_wallet_).*.(json)', 'ig');
      const filteredFiles = files.filter((file) => file.match(regex));
      const filesWithPath = filteredFiles.map((file) => path.join(lastBackupTime ? documentsDirPath : appFilesDirPath, file));
      if (filesWithPath && filesWithPath[0]) {
        shell.showItemInFolder(filesWithPath[0]);
      } else {
        shell.openItem(appFilesDirPath);
      }
      event.sender.send(ipcConsts.OPEN_WALLET_BACKUP_DIRECTORY_RESPONSE, { error: null });
    } catch (error) {
      event.sender.send(ipcConsts.OPEN_WALLET_BACKUP_DIRECTORY_RESPONSE, { error });
    }
  };

  static readFile = async ({ event, filePath }) => {
    await FileManager._readFile({ event, filePath });
  };

  static readDirectory = async ({ event }) => {
    try {
      const files = await readDirectoryAsync(appFilesDirPath);
      const regex = new RegExp('(my_wallet_).*.(json)', 'ig');
      const filteredFiles = files.filter((file) => file.match(regex));
      const filesWithPath = filteredFiles.map((file) => path.join(appFilesDirPath, file));
      event.sender.send(ipcConsts.READ_DIRECTORY_RESPONSE, { error: null, filesWithPath });
    } catch (error) {
      event.sender.send(ipcConsts.READ_DIRECTORY_FAILURE, { error, filesWithPath: null });
    }
  };

  static writeFile = async ({ event, fileName, fileContent, saveToDocumentsFolder }) => {
    const filePath = path.join(saveToDocumentsFolder ? documentsDirPath : appFilesDirPath, fileName);
    await FileManager._writeFile({ event, filePath, fileContent });
  };

  static updateFile = async ({ event, fileName, fieldName, data }) => {
    try {
      const filePath = path.isAbsolute(fileName) ? fileName : path.join(appFilesDirPath, fileName);
      const fileContent = await readFileAsync(filePath);
      const file = JSON.parse(fileContent);
      file[fieldName] = data;
      await writeFileAsync(filePath, JSON.stringify(file));
      event.sender.send(ipcConsts.UPDATE_FILE_RESPONSE, { error: null });
    } catch (error) {
      event.sender.send(ipcConsts.UPDATE_FILE_RESPONSE, { error });
    }
  };

  static deleteWalletFile = ({ browserWindow, fileName }) => {
    try {
      const filePath = path.isAbsolute(fileName) ? fileName : path.join(appFilesDirPath, fileName);
      const options = {
        title: 'Delete File',
        message: 'All wallet data will be lost. Are You Sure?',
        buttons: ['Delete Wallet File', 'Cancel']
      };
      dialog.showMessageBox(browserWindow, options, async (response) => {
        if (response === 0) {
          try {
            await unlinkFileAsync(filePath);
            browserWindow.reload();
          } catch (err) {
            throw new Error(err);
          }
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting wallet file');
    }
  };

  static wipeOut = ({ browserWindow }) => {
    try {
      const options = {
        title: 'Reinstall App',
        message: 'WARNING: All wallets, addresses and settings will be lost. Are you sure you want to do this?',
        buttons: ['Delete All', 'Cancel']
      };
      dialog.showMessageBox(browserWindow, options, async (response) => {
        if (response === 0) {
          const deleteFolderRecursive = (path) => {
            if (fs.existsSync(path)) {
              fs.readdirSync(path).forEach((file) => {
                const curPath = `${path}/${file}`;
                if (fs.lstatSync(curPath).isDirectory()) {
                  // recurse
                  deleteFolderRecursive(curPath);
                } else {
                  // delete file
                  fs.unlinkSync(curPath);
                }
              });
              fs.rmdirSync(path);
            }
          };
          deleteFolderRecursive(appFilesDirPath);
          app.exit();
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error purging app data directory');
    }
  };

  static _readFile = async ({ event, filePath }) => {
    try {
      const fileContent = await readFileAsync(filePath);
      event.sender.send(ipcConsts.READ_FILE_RESPONSE, { error: null, xml: JSON.parse(fileContent) });
    } catch (error) {
      event.sender.send(ipcConsts.READ_FILE_RESPONSE, { error, xml: null });
    }
  };

  static _writeFile = async ({ event, filePath, fileContent }) => {
    try {
      await writeFileAsync(filePath, fileContent);
      event.sender.send(ipcConsts.SAVE_FILE_RESPONSE, { error: null });
    } catch (error) {
      event.sender.send(ipcConsts.SAVE_FILE_RESPONSE, { error });
    }
  };
}

export default FileManager;
