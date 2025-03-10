import React from 'react';
import { View, Image } from 'react-native';
import { translate } from 'react-i18next';
import FormattedDate from '../../shared/formattedDate';
import withTheme from '../../shared/withTheme';
import { P, B } from '../../shared/toolBox/typography';
import { getTxConstant } from '../../../constants/transactions';
import getStyles from './styles';

const Graphics = ({ tx, theme }) => (
  <Image style={{ width: 40, height: 40 }} source={getTxConstant(tx).image(theme)} />
);

const TimeStamp = ({ timestamp, styles }) => {
  if (timestamp) {
    return (
      <FormattedDate format="MMM D, YYYY LTS" type={P} style={[styles.date, styles.theme.date]}>
        {timestamp * 1000}
      </FormattedDate>
    );
  }

  return null;
};

const LskSummary = ({
  styles, theme, t, tx
}) => {
  return (
    <View style={[styles.senderAndRecipient, styles.theme.senderAndRecipient]}>
      <View style={styles.titleContainer}>
        <View>
          <B style={[styles.transactionTitle, styles.theme.transactionTitle]}>
            {t(getTxConstant(tx).title)}
          </B>
          <TimeStamp timestamp={tx.timestamp} styles={styles} />
        </View>
        <Graphics tx={tx} theme={theme} />
      </View>
    </View>
  );
};

export default withTheme(translate()(LskSummary), getStyles());
