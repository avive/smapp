// @flow
import React, { Component } from 'react';
import SideMenu from '../baseComponents/SideMenu/SideMenu';
import { Route, Switch, Redirect } from 'react-router-dom';
import StoryBook from './StoryBook';
import type { SideMenuEntry, LoadingEntry } from '../baseComponents/SideMenu/SideMenu';

type WalletRootProps = {};
type WalletRootState = {
  fullNodeLoading: boolean
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    width: '100%',
    heighy: '100%'
  }
};

const routes = {
  STORYBOOK: {
    path: '/root/story-book',
    component: StoryBook
  }
};

export default class WalletRoot extends Component<WalletRootProps, WalletRootState> {
  props: WalletRootProps;

  state: WalletRootState = {
    fullNodeLoading: true
  };

  render() {
    const { fullNodeLoading } = this.state;

    const loadingEntry: LoadingEntry = { id: 1, isLoading: fullNodeLoading };

    return (
      <div style={styles.container}>
        <SideMenu onPress={this.handleSideMenuPress} loadingEntry={loadingEntry} />
        <div style={styles.mainContent}>
          <Switch>
            {Object.keys(routes).map((routeKey) => (
              <Route exact key={routeKey} path={routes[routeKey].path} component={routes[routeKey].component} />
            ))}
            <Redirect to="/root/story-book" />
          </Switch>
        </div>
      </div>
    );
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        fullNodeLoading: false
      });
    }, 8000);
  }

  handleSideMenuPress = (selection: SideMenuEntry) => {
    /* eslint-disable no-console */
    console.warn(`${selection.id}: ${selection.label}`); // TODO: TEST - remove this
  };
}