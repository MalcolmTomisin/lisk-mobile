import { NativeModules } from 'react-native';
import settingsMiddleware from './settings';
import actionTypes from '../../constants/actions';
import * as storageUtility from '../../utilities/storage';

describe('Middleware: Settings', () => {
  beforeEach(() => {
    NativeModules.SettingsManager = {
      settings: {
        AppleLanguages: ['en_EN'],
        AppleLocale: 'en_EN'
      }
    };
  });
  const next = jest.fn();
  const store = {
    dispatch: jest.fn(),
    getState: () => ({
      settings: {}
    })
  };

  it('should pass the action', () => {
    const action = { type: 'ANY_ACTION' };
    settingsMiddleware(store)(next)(action);
    expect(next).toBeCalledWith(action);
  });

  it('should change add the language if not already set', () => {
    const action = {
      type: actionTypes.settingsRetrieved,
      data: {
        currency: 'EUR'
      }
    };

    const editedAction = {
      type: actionTypes.settingsRetrieved,
      data: {
        currency: 'EUR',
        language: 'en'
      }
    };

    settingsMiddleware(store)(next)(action);
    expect(next).toBeCalledWith(editedAction);
  });

  it('should store new settings', () => {
    const action = {
      type: actionTypes.settingsUpdated,
      data: {
        test: true
      }
    };

    storageUtility.storeSettings = jest.fn();
    settingsMiddleware(store)(next)(action);
    const { settings } = store.getState();
    expect(storageUtility.storeSettings).toBeCalledWith(settings);
  });
});
