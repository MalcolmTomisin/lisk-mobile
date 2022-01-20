import React from 'react';
import { translate } from 'react-i18next';
import { Linking, View, TouchableOpacity } from 'react-native';
import BTCRemovalSVG from '../../../assets/svgs/BTCRemovalSVG';
import LinkSvg from '../../../assets/svgs/LinkSvg';
import { PrimaryButton } from '../../shared/toolBox/button';
import { B, H2 } from '../../shared/toolBox/typography';
import withTheme from '../../shared/withTheme';
import getStyles from './styles';
import packageJson from '../../../../package.json';

const BTCRemoval = ({ styles, t, closeBanner }) => {
  const readMore = () =>
    Linking.openURL('https://lisk.com/blog/development/lisk-desktop-220-release');
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <H2 style={styles.title}>{t('banners.btcRemoval.title', { release: packageJson.version })}</H2>
        <BTCRemovalSVG />
      </View>
      <TouchableOpacity
        style={styles.readMoreButton}
        onPress={readMore}
      >
        <B style={styles.readMoreText}>{t('banners.btcRemoval.buttons.readMore')}</B>
        <View style={styles.icon}>
          <LinkSvg />
        </View>
      </TouchableOpacity>
      <PrimaryButton
        title={t('banners.btcRemoval.buttons.gotIt')}
        noTheme
        style={styles.gotItButton}
        textStyle={styles.gotItText}
        onPress={closeBanner}
      />
    </View>
  );
};

export default withTheme(translate()(BTCRemoval), getStyles());
