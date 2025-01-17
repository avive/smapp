// @flow
import { shell } from 'electron';
import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { getUpcomingRewards } from '/redux/node/actions';
import { CorneredContainer } from '/components/common';
import { WrapperWith2SideBars, Link, Button } from '/basicComponents';
import { ScreenErrorBoundary } from '/components/errorHandler';
import { localStorageService } from '/infra/storageService';
import { playIcon, pauseIcon, fireworks } from '/assets/images';
import { smColors, nodeConsts } from '/vars';
import { getFormattedTimestamp } from '/infra/utils';
import type { RouterHistory } from 'react-router-dom';
import type { Action } from '/types';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LogInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: visible;
  overflow-x: hidden;
`;

const LogEntry = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogText = styled.div`
  font-size: 16px;
  line-height: 20px;
  color: ${smColors.black};
`;

const AwardText = styled(LogText)`
  color: ${smColors.green};
`;

const LogEntrySeparator = styled(LogText)`
  margin: 15px 0;
  line-height: 16px;
`;

const Text = styled.div`
  font-size: 16px;
  line-height: 23px;
  color: ${smColors.realBlack};
`;

const BoldText = styled(Text)`
  font-family: SourceCodeProBold;
  margin-top: 20px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
  align-items: flex-end;
`;

const Status = styled.div`
  font-size: 16px;
  line-height: 20px;
  color: ${({ isConnected }) => (isConnected ? smColors.green : smColors.orange)};
  margin-bottom: 30px;
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const LeftText = styled.div`
  margin-right: 15px;
  font-size: 16px;
  line-height: 20px;
  color: ${smColors.realBlack};
`;

const RightText = styled.div`
  flex: 1;
  margin-right: 0;
  margin-left: 15px;
  text-align: right;
`;

const GreenText = styled(RightText)`
  color: ${smColors.green};
`;

const Dots = styled(LeftText)`
  margin: 0 auto;
  flex-shrink: 1;
  overflow: hidden;
`;

const Fireworks = styled.img`
  position: absolute;
  top: 50px;
  max-width: 100%;
  max-height: 100%;
  cursor: inherit;
`;

const inlineLinkStyle = { display: 'inline', fontSize: '16px', lineHeight: '20px' };

type Props = {
  isConnected: boolean,
  miningStatus: number,
  timeTillNextAward: number,
  totalEarnings: number,
  totalFeesEarnings: number,
  getUpcomingRewards: Action,
  history: RouterHistory,
  location: { state?: { showIntro?: boolean } }
};

type State = {
  showIntro: boolean,
  isMiningPaused: boolean,
  showFireworks: boolean
};

class Node extends Component<Props, State> {
  getUpcomingAwardsInterval: IntervalID;

  fireworksTimeout: TimeoutID;

  constructor(props) {
    super(props);
    const { location } = props;
    this.state = {
      showIntro: !!location?.state?.showIntro,
      isMiningPaused: false,
      showFireworks: !!location?.state?.showIntro
    };
  }

  render() {
    const rewards = localStorageService.get('rewards') || [];
    let smesherInitTimestamp = localStorageService.get('smesherInitTimestamp');
    smesherInitTimestamp = smesherInitTimestamp ? getFormattedTimestamp(smesherInitTimestamp) : '';
    let smesherSmeshingTimestamp = localStorageService.get('smesherSmeshingTimestamp');
    smesherSmeshingTimestamp = smesherSmeshingTimestamp ? getFormattedTimestamp(smesherSmeshingTimestamp) : '';
    return (
      <Wrapper>
        <WrapperWith2SideBars width={650} height={480} header="SMESHER" style={{ marginRight: 10 }}>
          {this.renderMainSection()}
        </WrapperWith2SideBars>
        <CorneredContainer width={260} height={480} header="SMESHER LOG">
          <LogInnerWrapper>
            {smesherInitTimestamp ? (
              <>
                <LogEntry>
                  <LogText>{smesherInitTimestamp}</LogText>
                  <LogText>Initializing smesher</LogText>
                </LogEntry>
                <LogEntrySeparator>...</LogEntrySeparator>
              </>
            ) : null}
            {smesherSmeshingTimestamp ? (
              <>
                <LogEntry>
                  <LogText>{smesherSmeshingTimestamp}</LogText>
                  <LogText>Started smeshing</LogText>
                </LogEntry>
                <LogEntrySeparator>...</LogEntrySeparator>
              </>
            ) : null}
            {rewards.map((reward, index) => (
              <div key={`reward${index}`}>
                <LogEntry>
                  <LogText>12.09.19 - 13:10</LogText>
                  <AwardText>Smeshing reward: {reward.totalReward} SMG</AwardText>
                  <AwardText>Smeshing fee reward: {reward.layerRewardEstimate} SMG</AwardText>
                </LogEntry>
                <LogEntrySeparator>...</LogEntrySeparator>
              </div>
            ))}
          </LogInnerWrapper>
        </CorneredContainer>
      </Wrapper>
    );
  }

  async componentDidMount() {
    const { isConnected, miningStatus, getUpcomingRewards } = this.props;
    if (isConnected && miningStatus === nodeConsts.IS_MINING) {
      await getUpcomingRewards();
      this.getUpcomingAwardsInterval = setInterval(getUpcomingRewards, nodeConsts.TIME_BETWEEN_LAYERS);
    }
  }

  componentWillUnmount(): * {
    this.getUpcomingAwardsInterval && clearInterval(this.getUpcomingAwardsInterval);
    this.fireworksTimeout && clearTimeout(this.fireworksTimeout);
  }

  renderMainSection = () => {
    const { miningStatus } = this.props;
    const { showIntro, showFireworks } = this.state;
    if (showIntro) {
      return showFireworks ? this.renderFireworks() : this.renderIntro();
    } else if (miningStatus === nodeConsts.NOT_MINING) {
      return this.renderPreSetup();
    }
    return this.renderNodeDashboard();
  };

  renderFireworks = () => {
    this.fireworksTimeout = setTimeout(() => {
      this.setState({ showFireworks: false });
    }, 1500);
    return <Fireworks key="fireworks" src={fireworks} />;
  };

  renderIntro = () => {
    return [
      <BoldText key="1">Success! You are now a Spacemesh Testnet member!</BoldText>,
      <Text key="2">* You will get a desktop notification about your smeshing rewards in about 48 hours</Text>,
      <Text key="3">* You can close this window and choose to keep smeshing the background</Text>,
      <BoldText key="4">Important</BoldText>,
      <Text key="5">* Leave your computer on 24/7 to smesh and to earn smeshing rewards</Text>,
      <Text key="6">
        * <Link onClick={this.navigateToPreventComputerSleep} text="Disable your computer from going to sleep" style={inlineLinkStyle} />
      </Text>,
      <Text key="7">
        * Configure your network to accept incoming app connections.
        <Link onClick={this.navigateToNetConfigGuide} text="Learn more." style={inlineLinkStyle} />
      </Text>,
      <Text key="8" style={{ display: 'flex', flexDirection: 'row' }}>
        *&nbsp;
        <Link onClick={this.navigateToMiningGuide} text="Learn more about smeshing" style={inlineLinkStyle} />
      </Text>,
      <Footer key="footer">
        <Link onClick={this.navigateToMiningGuide} text="SMESHING GUIDE" />
        <Button onClick={() => this.setState({ showIntro: false })} text="GOT IT" width={175} />
      </Footer>
    ];
  };

  renderPreSetup = () => {
    const { history } = this.props;
    return [
      <BoldText key="1">You are not smeshing yet.</BoldText>,
      <br key="2" />,
      <Text key="3">Setup smeshing to join Spacemesh and earn Smesh rewards.</Text>,
      <br key="4" />,
      <br key="5" />,
      <Text key="6">{`Setup requires ${nodeConsts.COMMITMENT_SIZE} GB of free disk space.`}</Text>,
      <Text key="7">You will start earning Smesh rewards in about 48 hours.</Text>,
      <Footer key="footer">
        <Link onClick={this.navigateToMiningGuide} text="SMESHING GUIDE" />
        <Button onClick={() => history.push('/main/node-setup', { isOnlyNodeSetup: true })} text="BEGIN SETUP" width={175} />
      </Footer>
    ];
  };

  renderNodeDashboard = () => {
    const { isConnected, timeTillNextAward, totalEarnings, totalFeesEarnings } = this.props;
    const { isMiningPaused } = this.state;
    return [
      <Status key="status" isConnected={isConnected}>
        {isConnected ? 'Your Smesher is online.' : 'Not connected!'}
      </Status>,
      <TextWrapper key="1">
        <LeftText>Upcoming reward in</LeftText>
        <Dots>.............................</Dots>
        <RightText>{timeTillNextAward || timeTillNextAward === 0 ? `${timeTillNextAward} min` : 'Not available'}</RightText>
      </TextWrapper>,
      <TextWrapper key="2">
        <LeftText>Total Smeshing Rewards</LeftText>
        <Dots>.............................</Dots>
        <GreenText>{totalEarnings} SMG</GreenText>
      </TextWrapper>,
      <TextWrapper key="3">
        <LeftText>Total Fees Rewards</LeftText>
        <Dots>.............................</Dots>
        <GreenText>{totalFeesEarnings} SMG</GreenText>
      </TextWrapper>,
      <Footer key="footer">
        <Link onClick={this.navigateToMiningGuide} text="SMESHING GUIDE" />
        <Button
          onClick={this.pauseResumeMining}
          text={isMiningPaused ? 'RESUME SMESHING' : 'PAUSE SMESHING'}
          width={175}
          imgPosition="before"
          img={isMiningPaused ? playIcon : pauseIcon}
          isDisabled
        />
      </Footer>
    ];
  };

  pauseResumeMining = () => {};

  navigateToMiningGuide = () => shell.openExternal('https://testnet.spacemesh.io/#/guide/setup');

  navigateToNetConfigGuide = () => shell.openExternal('https://testnet.spacemesh.io/#/netconfig');

  navigateToPreventComputerSleep = () => shell.openExternal('https://testnet.spacemesh.io/#/no_sleep');
}

const mapStateToProps = (state) => ({
  isConnected: state.node.isConnected,
  miningStatus: state.node.miningStatus,
  timeTillNextAward: state.node.timeTillNextAward,
  totalEarnings: state.node.totalEarnings,
  totalFeesEarnings: state.node.totalEarnings
});

const mapDispatchToProps = {
  getUpcomingRewards
};

Node = connect<any, any, _, _, _, _>(mapStateToProps, mapDispatchToProps)(Node);

Node = ScreenErrorBoundary(Node);
export default Node;
