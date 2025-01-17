import { shell } from 'electron';
import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { copyFile } from '/redux/wallet/actions';
import { CorneredContainer } from '/components/common';
import { DragAndDrop } from '/components/auth';
import { Button, Link, SecondaryButton, SmallHorizontalPanel } from '/basicComponents';
import { chevronLeftWhite } from '/assets/images';
import type { Action } from '/types';
import type { RouterHistory } from 'react-router-dom';

const DdArea = styled.div`
  display: flex;
  flex: 1;
  margin-bottom: 20px;
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

type Props = {
  copyFile: Action,
  history: RouterHistory
};

type State = {
  fileName: string,
  filePath: string,
  hasError: boolean
};

class FileRestore extends Component<Props, State> {
  state = {
    fileName: '',
    filePath: '',
    hasError: false
  };

  render() {
    const { history } = this.props;
    const { fileName, hasError } = this.state;
    return (
      <CorneredContainer width={800} height={480} header="RESTORE WALLET FROM FILE" subHeader="Locate wallet restore file.">
        <SmallHorizontalPanel />
        <SecondaryButton onClick={history.goBack} img={chevronLeftWhite} imgWidth={10} imgHeight={15} style={{ position: 'absolute', bottom: 0, left: -35 }} />
        <DdArea>
          <DragAndDrop onFilesAdded={this.addFile} fileName={fileName} hasError={hasError} />
        </DdArea>
        <BottomSection>
          <Link onClick={this.navigateToBackupGuide} text="BACKUP GUIDE" />
          <Button onClick={this.openWalletFile} text="RESTORE" isDisabled={hasError || !fileName} />
        </BottomSection>
      </CorneredContainer>
    );
  }

  addFile = ({ fileName, filePath }) => {
    if (fileName.split('.').pop() !== 'json') {
      this.setState({ hasError: true });
    } else {
      this.setState({ fileName, filePath, hasError: false });
    }
  };

  openWalletFile = async () => {
    const { copyFile, history } = this.props;
    const { fileName, filePath } = this.state;
    try {
      await copyFile({ fileName, filePath });
      history.push('/auth/unlock');
    } catch {
      this.setState({ hasError: true });
    }
  };

  navigateToBackupGuide = () => shell.openExternal('https://testnet.spacemesh.io/#/backup?id=restoring-from-a-backup-file');
}

const mapDispatchToProps = {
  copyFile
};

FileRestore = connect(null, mapDispatchToProps)(FileRestore);

export default FileRestore;
