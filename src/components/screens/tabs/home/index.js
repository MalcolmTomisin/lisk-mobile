/* eslint-disable complexity */
/* eslint-disable max-lines */
import React from 'react';
import {
  View, Animated, StatusBar, Platform, RefreshControl, SafeAreaView
} from 'react-native';
import connect from 'redux-connect-decorator';
import { withNavigationFocus } from '@react-navigation/compat';
import {
  transactionsReset as transactionsResetAction,
  transactionsLoaded as transactionsLoadedAction
} from '../../../../actions/transactions';
import {
  blockUpdated as blockUpdatedAction,
  accountFetched as accountFetchedAction
} from '../../../../actions/accounts';
import { settingsUpdated as settingsUpdatedAction } from '../../../../actions/settings';
import { getNetworkInfo as getNetworkInfoAction } from '../../../../actions/network';
import AccountSummary from './accountSummary/home';
import Transactions from '../../../shared/transactions';
import Empty from '../../../shared/transactions/empty';
import Loading from '../../../shared/transactions/loading';
import {
  loadMore, resetTxAndFetch, showIntroModal, showInitializationModal
} from './utils';
import { deviceHeight, viewportHeight } from '../../../../utilities/device';
import InfiniteScrollView from '../../../shared/infiniteScrollView';
import ParallaxHeader from '../../../shared/ParallaxHeader';
import { tokenKeys } from '../../../../constants/tokens';
import withTheme from '../../../shared/withTheme';
import getStyles from './styles';
import { colors, themes } from '../../../../constants/styleGuide';
import HomeHeaderTitle from '../../router/homeHeaderTitle';
import Banner from '../../../shared/banner';
import BTCRemoval from '../../banners/BtcRemoval';
import { fetchData, persistData } from '../../../../utilities/storage';

const itemHeight = 90;
const summaryHeight = 200;
/**
 * This component would be mounted first and would be used to config and redirect
 * the application to referer page or Sign In
 *
 * @todo Implement release notification
 * @todo Implement custom message: this can be used in case we need to notify the user
 * about any unforeseen issue/change
 */
@connect(
  (state) => ({
    account: state.accounts.info || {},
    transactions: state.transactions,
    incognito: state.settings.incognito,
    activeToken: state.settings.token.active,
    settings: state.settings,
    followedAccounts: state.accounts.followed || [],
  }),
  {
    transactionsLoaded: transactionsLoadedAction,
    transactionsReset: transactionsResetAction,
    updateTransactions: blockUpdatedAction,
    accountFetched: accountFetchedAction,
    settingsUpdated: settingsUpdatedAction,
    getNetworkInfo: getNetworkInfoAction
  }
)
class Home extends React.Component {
  state = {
    footer: null,
    refreshing: false,
    hideBtcRemoval: true
  };

  canLoadMore = true;

  scrollY = new Animated.Value(0);

  scrollView = null;

  lastActiveToken = null;

  setHeader = () => {
    const {
      navigation: { setOptions }
    } = this.props;
    setOptions({
      headerTitle: () => (
        <HomeHeaderTitle type="home" scrollToTop={this.scrollToTop} scrollY={this.scrollY} />
      ),
      tabBarVisible: this.state.hideBtcRemoval
    });
  };

  scrollToTop = () => {
    if (this.scrollView) {
      this.scrollView.scrollTo({ y: 0, animated: true });
    }
  };

  refreshAccountAndTx = () => {
    this.lastActiveToken = this.props.activeToken;
    this.initialFetchTimeout = setTimeout(() => {
      resetTxAndFetch(this.props);
    }, 200);
    this.props.accountFetched();
  };

  screenWillFocus = () => {
    if (this.lastActiveToken === null) {
      this.setHeader();
      this.modalTimeout = setTimeout(() => {
        showIntroModal(this.props);
      }, 1200);
    }
    if (this.lastActiveToken !== this.props.activeToken) {
      this.refreshAccountAndTx();
      this.setHeader();
    }
  };

  componentDidMount() {
    const {
      navigation: { addListener },
      settingsUpdated,
      incognito,
      route,
      activeToken,
      getNetworkInfo
    } = this.props;
    if (activeToken) {
      getNetworkInfo(activeToken);
    }
    this.props.navigation.setParams({
      scrollToTop: this.scrollToTop
    });
    addListener('willFocus', this.screenWillFocus);
    if (route.params && route.params.discreet && !incognito) {
      settingsUpdated({ incognito: true });
    }
    this.accountFetchTimeout = setTimeout(() => {
      this.fetchInactiveTokensAccounts();
      resetTxAndFetch(this.props);
    }, 1000);
    setTimeout(() => {
      showInitializationModal(this.props);
    }, 1200);
    this.checkBTCBanner();
  }

  checkBTCBanner = async () => {
    const hideBtcRemoval = await fetchData('@list-hideBtcRemoval');
    this.setState({
      hideBtcRemoval: Boolean(hideBtcRemoval)
    });
  };

  hideBTCBanner = () => {
    persistData('@list-hideBtcRemoval', 'true');
    this.setState({
      hideBtcRemoval: true
    });
  };

  loadMore = ({ nativeEvent }) => {
    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
      const paddingToBottom = 20;
      return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };
    if (isCloseToBottom(nativeEvent) && this.canLoadMore) {
      this.canLoadMore = false;
      loadMore(this.props);
    }
  };

  // eslint-disable-next-line max-statements
  componentDidUpdate(prevProps, prevState) {
    const {
      transactions,
      account,
      incognito,
      activeToken,
      isFocused,
      settings: {
        token: { list }
      }
    } = this.props;
    const prevTokenList = prevProps.settings.token.list;
    const prevTransactionCount = prevProps.transactions.pending.length
    + prevProps.transactions.confirmed.length;
    const transactionCount = transactions.pending.length + transactions.confirmed.length;
    const shouldUpdateState = prevProps.transactions.loaded !== transactions.loaded
      || prevTransactionCount !== transactionCount;
    const transactionList = transactions.count > 0
      ? [...transactions.pending, ...transactions.confirmed]
      : ['emptyState'];
    if (prevTransactionCount !== transactionList.length) {
      this.canLoadMore = transactionList.length < transactions.count;
    }
    if (shouldUpdateState) {
      this.setState({
        footer: Math.floor((viewportHeight() - summaryHeight) / itemHeight) < transactionCount
      });
    }
    if (this.shouldFetchAccounts(prevTokenList, list)) {
      this.fetchInactiveTokensAccounts();
    }
    if (
      prevProps.account[activeToken].balance !== account[activeToken].balance
      || prevProps.incognito !== incognito
    ) {
      this.setHeader();
    }
    if (prevState.hideBtcRemoval !== this.state.hideBtcRemoval) {
      this.setHeader();
    }
    if (prevProps.activeToken !== activeToken && isFocused) {
      this.refreshAccountAndTx();
      this.setHeader();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.initialFetchTimeout);
    clearTimeout(this.modalTimeout);
    clearTimeout(this.accountFetchTimeout);
  }

  shouldFetchAccounts = (prevList, newList) =>
    Object.keys(prevList).some((token) => newList[token] !== prevList[token]);

  fetchInactiveTokensAccounts() {
    const { activeToken, accountFetched, settings } = this.props;
    const inactiveTokens = tokenKeys.filter(
      (key) => settings.token.list[key] && key !== activeToken
    );
    if (inactiveTokens.length > 0) {
      inactiveTokens.forEach((token) => {
        accountFetched(token);
      });
    }
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.props.updateTransactions();
    setTimeout(() => {
      this.setState({ refreshing: false });
    }, 2000);
  };

  render() {
    const {
      styles,
      account,
      transactions,
      navigation,
      updateTransactions,
      theme,
      isFocused,
      activeToken,
    } = this.props;
    let content = null;
    if (transactions.loaded) {
      const listElements = transactions.count > 0
        ? [...transactions.pending, ...transactions.confirmed]
        : ['emptyState'];
      content = (
        <InfiniteScrollView
          scrollEventThrottle={8}
          style={[styles.scrollView]}
          refresh={updateTransactions}
          loadMore={() => {
            loadMore(this.props);
          }}
          list={listElements}
          count={transactions.count}
          render={(refreshing) =>
            transactions.count > 0 ? (
              <Transactions
                type="home"
                transactions={transactions}
                footer={this.state.footer}
                navigate={navigation.navigate}
                account={account[activeToken]}
                refreshing={refreshing}
              />
            ) : (
              <Empty
                style={[styles.emptyContainer, styles.theme.emptyContainer]}
                refreshing={refreshing}
              />
            )
          }
        />
      );
    } else {
      content = <Loading style={[styles.emptyContainer, styles.theme.emptyContainer]} />;
    }
    const otherPageStatusBar = theme === themes.light ? 'dark-content' : 'light-content';
    if (!this.state.hideBtcRemoval) {
      return (
        <Banner>
          <BTCRemoval closeBanner={this.hideBTCBanner} />
        </Banner>
      );
    }
    return (
      <SafeAreaView style={[styles.flex, styles.theme.homeContainer]}>
        {Platform.OS !== 'ios' ? (
          <StatusBar barStyle="light-content" />
        ) : (
          <StatusBar barStyle={isFocused ? 'light-content' : otherPageStatusBar} />
        )}
        <ParallaxHeader
          reference={(el) => {
            this.scrollView = el;
          }}
          headerMinHeight={70}
          headerMaxHeight={260}
          extraScrollHeight={20}
          navbarColor="#3498db"
          alwaysShowTitle={false}
          refreshControl={
            <RefreshControl
              progressViewOffset={deviceHeight() / 3}
              onRefresh={this.onRefresh}
              refreshing={this.state.refreshing}
              tintColor={
                this.props.theme === themes.light ? colors.light.slateGray : colors.dark.platinum
              }
            />
          }
          title={
            <AccountSummary
              navigation={navigation}
              scrollY={this.scrollY}
              isFocused={isFocused}
              incognito={this.props.incognito}
            />
          }
          renderContent={() => content}
          scrollViewProps={{
            onScroll: this.loadMore
          }}
        />
        <View style={[styles.fixedBg, styles.theme.fixedBg]}></View>
      </SafeAreaView>
    );
  }
}

export default withNavigationFocus(withTheme(Home, getStyles()));
