// @flow
import { shell } from 'electron';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { logout } from '/redux/auth/actions';
import { getMiningStatus, getGenesisTime, checkNodeConnection } from '/redux/node/actions';
import { ScreenErrorBoundary } from '/components/errorHandler';
import { SecondaryButton } from '/basicComponents';
import routes from '/routes';
import { notificationsService } from '/infra/notificationsService';
import { logo, sideBar, settingsIcon, getCoinsIcon, helpIcon, signOutIcon } from '/assets/images';
import { smColors, nodeConsts } from '/vars';
import type { Action } from '/types';
import type { RouterHistory } from 'react-router-dom';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 5px 25px 20px 10px;
  background-color: ${smColors.white};
`;

const NavBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const NavBarPart = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-right: 10px;
`;

const NavLinksWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  margin-left: 30px;
`;

const NavBarLink = styled.div`
  margin-right: 15px;
  font-family: SourceCodeProBold;
  font-size: 16px;
  line-height: 20px;
  text-decoration-line: ${({ isActive }) => (isActive ? 'underline' : 'none')};
  text-transform: uppercase;
  color: ${({ isActive }) => (isActive ? smColors.purple : smColors.disabledGray)};
  cursor: pointer;
`;

const Logo = styled.img`
  display: block;
  width: 130px;
  height: 40px;
`;

const SideBar = styled.img`
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 100%;
`;

const InnerWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: ${smColors.white};
`;

const bntStyle = { marginRight: 15, marginTop: 10 };

type Props = {
  isConnected: boolean,
  miningStatus: number,
  getMiningStatus: Action,
  checkNodeConnection: Action,
  getGenesisTime: Action,
  logout: Action,
  history: RouterHistory,
  location: { pathname: string, hash: string }
};

type State = {
  activeRouteIndex: number
};

class Main extends Component<Props, State> {
  timer: any;

  navMap: Array<() => void>;

  constructor(props: Props) {
    super(props);
    const { location, history } = props;
    const isWalletLocation = location.pathname.includes('/wallet');
    const activeRouteIndex = isWalletLocation ? 1 : 0;
    this.state = {
      activeRouteIndex
    };

    this.navMap = [
      () => history.push('/main/node'),
      () => history.push('/main/wallet'),
      () => history.push('/main/settings'),
      () => shell.openExternal('https://testnet.spacemesh.io/#/tap'),
      () => shell.openExternal('https://testnet.spacemesh.io/#/help')
    ];
  }

  render() {
    const { activeRouteIndex } = this.state;
    return (
      <Wrapper>
        <SideBar src={sideBar} />
        <NavBar>
          <NavBarPart>
            <Logo src={logo} />
            <NavLinksWrapper>
              <NavBarLink onClick={() => this.handleNavigation({ index: 0 })} isActive={activeRouteIndex === 0}>MINING</NavBarLink>
              <NavBarLink onClick={() => this.handleNavigation({ index: 1 })} isActive={activeRouteIndex === 1}>WALLET</NavBarLink>
            </NavLinksWrapper>
          </NavBarPart>
          <NavBarPart>
            <SecondaryButton
              onClick={() => this.handleNavigation({ index: 2 })}
              img={settingsIcon}
              imgHeight={16}
              imgWidth={16}
              isPrimary={activeRouteIndex === 2}
              style={bntStyle}
            />
            <SecondaryButton onClick={() => this.handleNavigation({ index: 3 })} img={getCoinsIcon} imgHeight={16} imgWidth={16} isPrimary={false} style={bntStyle} />
            <SecondaryButton onClick={() => this.handleNavigation({ index: 4 })} img={helpIcon} imgHeight={16} imgWidth={16} isPrimary={false} style={bntStyle} />
            <SecondaryButton onClick={() => this.handleNavigation({ index: 5 })} img={signOutIcon} imgHeight={16} imgWidth={16} isPrimary={false} style={bntStyle} />
          </NavBarPart>
        </NavBar>
        <InnerWrapper>
          <Switch>
            {routes.main.map((route) => (
              <Route key={route.path} path={route.path} component={route.component} />
            ))}
          </Switch>
        </InnerWrapper>
      </Wrapper>
    );
  }

  componentDidMount() {
    const { checkNodeConnection } = this.props;
    checkNodeConnection();
    this.timer = setInterval(() => {
      checkNodeConnection();
    }, 50000);
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  componentDidUpdate(prevProps: Props) {
    const { isConnected, miningStatus, getMiningStatus } = this.props;
    if (prevProps.isConnected && !isConnected) {
      // TODO: Connect to error handler service / modal to indicate a disconnect.
    } else if (isConnected && miningStatus === nodeConsts.NOT_MINING) {
      getMiningStatus();
    }
    if ([nodeConsts.NOT_MINING, nodeConsts.IN_SETUP].includes(prevProps.miningStatus) && miningStatus === nodeConsts.IS_MINING) {
      notificationsService.notify({
        title: 'Spacemesh Wallet',
        notification: 'Your full node setup is complete! You are now participating in the Spacemesh network…!',
        callback: () => this.handleNavigation({ index: 0 })
      });
    }
  }

  static getDerivedStateFromProps(props: Props) {
    const pathname = props.location.pathname;
    if (pathname.indexOf('backup') !== -1 || pathname.indexOf('transactions') !== -1 || pathname.indexOf('contacts') !== -1) {
      return { activeRouteIndex: -1 };
    }
    return null;
  }

  handleNavigation = ({ index }: { index: number }) => {
    const { history } = this.props;
    const { activeRouteIndex } = this.state;
    if (index !== activeRouteIndex) {
      switch (index) {
        case 0:
        case 1:
        case 2: {
          this.setState({ activeRouteIndex: index });
          this.navMap[index]();
          break;
        }
        case 3:
        case 4: {
          this.navMap[index]();
          break;
        }
        case 5: {
          history.push('/');
          logout();
          break;
        }
        default: break;
      }
    }
  };
}

const mapStateToProps = (state) => ({
  isConnected: state.node.isConnected,
  miningStatus: state.node.miningStatus
});

const mapDispatchToProps = {
  checkNodeConnection,
  getMiningStatus,
  getGenesisTime,
  logout
};

Main = connect<any, any, _, _, _, _>(
  mapStateToProps,
  mapDispatchToProps
)(Main);

Main = ScreenErrorBoundary(Main, true);
export default Main;
