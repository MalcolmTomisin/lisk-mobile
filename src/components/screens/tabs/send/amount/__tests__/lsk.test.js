import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import SendLsk from '../lsk';
import service from '../../../../../../utilities/api/service';

jest.mock('../../../../../../utilities/api/service');

const mockStore = configureMockStore();

const mockStoreProps = {
  service: {
    priceTicker: {
      LSK: {
        currency: 'USD'
      }
    }
  },
  settings: {
    language: 'en'
  }
};

const store = mockStore(mockStoreProps);

const mockProps = {
  settings: {
    token: {
      active: 'LSK'
    }
  },
  accounts: {
    info: {
      LSK: {
        balance: 100000000,
        nonce: 5
      }
    }
  },
  pricesRetrieved: jest.fn(),
  dynamicFeesRetrieved: jest.fn(),
  navigation: {
    state: { params: {} },
    dispatch: jest.fn(),
    goBack: jest.fn(),
    dismiss: jest.fn(),
    navigate: jest.fn(),
    openDrawer: jest.fn(),
    closeDrawer: jest.fn(),
    toggleDrawer: jest.fn(),
    getParam: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    isFocused: jest.fn()
  },
  sharedData: {}
};

jest.mock('../../../../../../utilities/api');
jest.mock('../../../../../../utilities/api/lisk/service');

test('Renders Send LSK correctly', () => {
  const { getAllByText } = render(
    <Provider store={store}>
      <SendLsk {...mockProps} />
    </Provider>
  );

  expect(getAllByText('Available Balance')).toHaveLength(1);
});

test('Renders correct balance of User LSK', () => {
  const { getAllByText } = render(
    <Provider store={store}>
      <SendLsk {...mockProps} />
    </Provider>
  );

  expect(getAllByText('1 LSK')).toHaveLength(1);
});

test("Calculates transaction fee if there's no priority", () => {
  const { getAllByText } = render(
    <Provider store={store}>
      <SendLsk {...mockProps} />
    </Provider>
  );

  expect(getAllByText('0.00138 LSK')).toHaveLength(1);
});

test('Re-Calculates transaction fee when the amount to send is changed', () => {
  const { getAllByText, getByLabelText } = render(
    <Provider store={store}>
      <SendLsk {...mockProps} />
    </Provider>
  );

  const input = getByLabelText('amount-input');

  fireEvent.changeText(input, '1');

  expect(getAllByText('0.00141 LSK')).toHaveLength(1);
});

test('Re-Calculates transaction fee when message is added', () => {
  const { getAllByText } = render(
    <Provider store={store}>
      <SendLsk {...mockProps} sharedData={{ reference: 'Message' }} />
    </Provider>
  );

  expect(getAllByText('0.00145 LSK')).toHaveLength(1);
});

describe('Priority', () => {
  beforeEach(() => {
    service.getDynamicFees = jest.fn();
    service.getDynamicFees.mockResolvedValue({
      Low: 6.222714,
      Medium: 976.222714,
      High: 2012.411464
    });
    jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
  });

  it('Shows priority selection field when priority is gotten', async (done) => {
    const { getAllByText } = render(
      <Provider store={store}>
        <SendLsk {...mockProps} />
      </Provider>
    );
    setTimeout(() => {
      expect(getAllByText('Low')).toHaveLength(1);
      expect(getAllByText('0.001 LSK')).toHaveLength(1);
      expect(getAllByText('Medium')).toHaveLength(1);
      expect(getAllByText('0.003 LSK')).toHaveLength(1);
      expect(getAllByText('High')).toHaveLength(1);
      expect(getAllByText('0.005 LSK')).toHaveLength(1);
      done();
    }, 1000);
  });
});
