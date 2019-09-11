// @flow
import { httpService } from '/infra/httpService';
import { createError } from '/infra/utils';
import { nodeConsts } from '/vars';
import { Action, Dispatch, GetState } from '/types';

export const CHECK_NODE_CONNECTION: string = 'CHECK_NODE_CONNECTION';

export const SET_MINING_STATUS: string = 'SET_MINING_STATUS';
export const INIT_MINING: string = 'INIT_MINING';

export const SET_GENESIS_TIME: string = 'SET_GENESIS_TIME';
export const SET_UPCOMING_REWARDS: string = 'SET_UPCOMING_REWARDS';

export const SET_NODE_IP: string = 'SET_NODE_IP';
export const SET_REWARDS_ADDRESS: string = 'SET_REWARDS_ADDRESS';

export const checkNodeConnection = (): Action => async (dispatch: Dispatch): Dispatch => {
  dispatch({ type: CHECK_NODE_CONNECTION, payload: { isConnected: true } });
  return true;
};

export const getMiningStatus = (): Action => async (dispatch: Dispatch): Dispatch => {
  dispatch({ type: SET_MINING_STATUS, payload: { status: '1' } });
};

export const initMining = ({ address }: { address: string }): Action => async (dispatch: Dispatch): Dispatch => {
  dispatch({ type: INIT_MINING, payload: { address } });
};

export const getGenesisTime = (): Action => async (dispatch: Dispatch): Dispatch => {
  try {
    const genesisTime = await httpService.getGenesisTime();
    dispatch({ type: SET_GENESIS_TIME, payload: { genesisTime: new Date(genesisTime).getTime() } });
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
};

export const getUpcomingRewards = (): Action => async (dispatch: Dispatch, getState: GetState): Dispatch => {
  try {
    const rewardLayerNumbers = await httpService.getUpcomingRewards();
    const { genesisTime } = getState().node;
    const currentLayer = Math.floor((new Date().getTime() - genesisTime) / nodeConsts.TIME_BETWEEN_LAYERS);
    const futureRewardLayerNumbers = rewardLayerNumbers.filter((layer) => layer >= currentLayer);
    dispatch({ type: SET_UPCOMING_REWARDS, payload: { timeTillNextReward: nodeConsts.TIME_BETWEEN_LAYERS * (futureRewardLayerNumbers[0] - currentLayer) } });
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
};

export const setNodeIpAddress = ({ nodeIpAddress }: { nodeIpAddress: string }): Action => async (dispatch: Dispatch): Dispatch => {
  dispatch({ type: SET_NODE_IP, payload: { nodeIpAddress } });
};

export const setRewardsAddress = ({ address }: { address: string }): Action => async (dispatch: Dispatch): Dispatch => {
  try {
    await httpService.setRewardsAddress({ address });
    dispatch({ type: SET_REWARDS_ADDRESS, payload: { address } });
  } catch (err) {
    throw createError('Error setting rewards address', () => setRewardsAddress({ address }));
  }
};
