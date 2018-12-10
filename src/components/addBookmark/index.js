import React from 'react';
import { View } from 'react-native';
import connect from 'redux-connect-decorator';
import { IconButton } from '../toolBox/button';
import Icon from '../toolBox/icon';
import reg from '../../constants/regex';
import Input from '../toolBox/input';
import { colors } from '../../constants/styleGuide';
import Avatar from '../avatar';
import Scanner from '../send/recipient/scanner';
import KeyboardAwareScrollView from '../toolBox/keyboardAwareScrollView';
import withTheme from '../withTheme';
import getStyles from './styles';
import {
  accountFollowed as accountFollowedAction,
  accountEdited as accountEditedAction,
} from '../../actions/accounts';
import { P, Small } from '../toolBox/typography';

@connect(state => ({
  account: state.accounts.followed,
}), {
  accountFollowed: accountFollowedAction,
  accountEdited: accountEditedAction,
})
class AddToBookmark extends React.Component {
  activeInputRef = null;
  validator = {
    address: (str) => {
      if (str === '') return -1;
      return reg.address.test(str) ? 0 : 1;
    },
    label: str => (str.length > 20 ? 1 : 0),
  };

  scannedData = {};
  state = {
    header: true,
    address: {
      value: '',
      validity: -1,
    },
    label: {
      value: '',
      validity: -1,
    },
    avatarPreview: false,
  };

  componentDidMount() {
    const account = this.props.navigation.getParam('account', null);
    if (!account) {
      setTimeout(() => {
        this.addressRef.focus();
      }, 300);
    } else {
      this.setState({
        label: { value: account.label },
        incomingData: account,
      });
    }
  }

  setAvatarPreviewTimeout = () => {
    this.avatarPreviewTimeout = setTimeout(() => {
      this.setState({
        avatarPreview: true,
      });
    }, 300);
  }

  onQRCodeRead = (data) => {
    this.setAddress(data.address);
    this.scannedData = data;
    this.input.focus();
  }

  setAddress = (value) => {
    clearTimeout(this.avatarPreviewTimeout);
    if (this.validator.address(value) === 0) {
      this.setAvatarPreviewTimeout();
    }
    this.setState({
      address: {
        value,
      },
      avatarPreview: false,
    });
  }

  setLabel = (value) => {
    this.setState({
      label: {
        value,
      },
    });
  }

  submitForm = () => {
    const { accountFollowed, navigation, accountEdited } = this.props;
    const { address, label, incomingData } = this.state;
    const addressValidity = this.validator.address(address.value);
    const labelValidity = this.validator.label(label.value);
    if (incomingData && labelValidity === 0) {
      accountEdited(
        incomingData.address,
        this.state.label.value,
      );
      navigation.goBack();
    } else if (addressValidity === 0 && labelValidity === 0) {
      accountFollowed(address.value, label.value);
      navigation.goBack();
    } else {
      this.setState({
        address: {
          value: address.value, validity: addressValidity,
        },
        label: {
          value: label.value, validity: labelValidity,
        },
      });
    }
  }

  render() {
    const {
      navigation, theme, styles,
    } = this.props;
    const {
      address, avatarPreview, label, incomingData,
    } = this.state;

    return (
      <View style={[styles.wrapper, styles.theme.wrapper]}>
        <Scanner
          ref={(el) => { this.scanner = el; }}
          navigation={navigation}
          setValues={this.onQRCodeRead}
        />
        <KeyboardAwareScrollView
            onSubmit={this.submitForm}
            button={{
              title: incomingData ? 'Save changes' : 'Add to bookmarks',
            }}
            styles={{ container: styles.container, innerContainer: styles.innerContainer }}
          >
          <View style={styles.form}>
            {
              !incomingData ? <View style={styles.addressContainer}>
                <IconButton
                  onPress={() => this.scanner.toggleCamera()}
                  titleStyle={[styles.scanButtonTitle, styles.theme.scanButtonTitle]}
                  style={styles.scanButton}
                  title='Scan'
                  icon='scanner'
                  iconSize={18}
                  color={colors.light.blue}
                />
                {
                  avatarPreview ?
                    <Avatar
                      style={styles.avatar}
                      address={address.value}
                      size={34}
                    /> :
                    <Icon
                      style={styles.avatar}
                      name='avatar-placeholder'
                      size={34}
                      color={colors[theme].gray5}
                    />
                }
                <Input
                  label='Address'
                  reference={(input) => { this.addressRef = input; }}
                  innerStyles={{
                    errorMessage: styles.errorMessage,
                    input: [
                      styles.input,
                      styles.addressInput,
                    ],
                    containerStyle: styles.addressInputContainer,
                  }}
                  onChange={this.setAddress}
                  value={address.value}
                  error={
                    address.validity === 1 ?
                      'Invalid address' : ''
                  }
                  onFocus={() => { this.activeInputRef = 0; }}
                />
              </View> :
              <View style={styles.row}>
                <P style={[styles.label, styles.theme.label]}>Address</P>
                <View style={styles.staticAddressContainer}>
                  <Avatar address={incomingData.address || ''} style={styles.staticA} size={35}/>
                  <Small style={[styles.address, styles.theme.address]}>
                    {incomingData.address}
                  </Small>
                </View>
              </View>
            }
            <Input
              label='Label'
              autoCorrect={false}
              innerStyles={{ input: styles.input }}
              multiline={true}
              onChange={this.setLabel}
              error={
                label.validity === 1 ?
                  'The label must be shorter than 20 characters.' : ''
              }
              value={label.value}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

export default withTheme(AddToBookmark, getStyles());
