// @flow
import { shell } from 'electron';
import React, { Component } from 'react';
import styled from 'styled-components';
import type { RouterHistory } from 'react-router-dom';
import { WrapperWith2SideBars, Button, Link, SmallHorizontalPanel } from '/basicComponents';
import { fileSystemService } from '/infra/fileSystemService';
import { localStorageService } from '/infra/storageService';

const Text = styled.span`
  font-size: 16px;
  line-height: 22px;
`;

const MiddleSectionRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const BottomRow = styled(MiddleSectionRow)`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: flex-end;
  justify-content: space-between;
`;

type Props = {
  history: RouterHistory
};

class FileBackup extends Component<Props> {
  render() {
    return (
      <WrapperWith2SideBars width={820} height={370} header="BACKUP EXISTING WALLET" subHeader="A wallet restore file has been saved.">
        <SmallHorizontalPanel />
        <Link onClick={this.showBackupFile} text="Browse file location" />
        <Text>You can use this file to restore your spacemesh wallet on any computer.</Text>
        <BottomRow>
          <Link onClick={this.openBackupGuide} text="BACKUP GUIDE" />
          <Button onClick={this.backToWalletRoot} text="GOT IT" width={95} />
        </BottomRow>
      </WrapperWith2SideBars>
    );
  }

  showBackupFile = () => {
    const lastBackupTime = localStorageService.get('lastBackupTime');
    fileSystemService.openWalletBackupDirectory({ lastBackupTime });
  };

  backToWalletRoot = () => {
    const { history } = this.props;
    history.push('/main/wallet');
  };

  openBackupGuide = () => shell.openExternal('https://testnet.spacemesh.io/#/backup');
}

export default FileBackup;
