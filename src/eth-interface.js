import { getParam } from './helpers/url';
import config from '../env/config';
import { notification } from './helpers/notification';

const { INFURA_HOST, CONTRACT_ABI, CONTRACT_ADDRESS, UNREASONABLY_HIGH_GAS_RATE } = config;

export default class EthInterface {
  constructor() {

    if ( typeof web3 !== 'undefined' && typeof Web3 !== 'undefined' ) {
      this.web3 = new Web3(web3.currentProvider);
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider(INFURA_HOST));
      console.log("Please install meta mask to interact with wallets");
    }
    this.paymentPermission = this.web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);
  }

  get user() {
    return getParam('address');
  }

  get currentViewWalletIds() {
    return new Promise(res => {
      this.paymentPermission.getWalletIds(this.user, (_, response) => res(response));
    });
  }

  get walletsAddressIsAdminOn() {
    return new Promise(res => {
      this.paymentPermission.getWalletsAddressIsAdminOn(this.user, (_, response) => {
        res(response.map(int => int.toNumber()));
      });
    });
  }

  get walletIds() {
    return new Promise(res => {
      this.paymentPermission.getWalletIds(this.user, (_, response) => {
        res(response.map(int => int.toNumber()));
      });
    });
  }

  createWalletUser(wallet, address, from) {
    this.paymentPermission.createWalletUser(wallet, address, { from, gas: UNREASONABLY_HIGH_GAS_RATE }, (e, txhash) => {
      notification(`Adding user to wallet`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
    })
  }

  addFunds(wallet, funds, from) {
    this.paymentPermission.addFundsToWallet(wallet, { from, gas: UNREASONABLY_HIGH_GAS_RATE, value: funds }, (e, txhash) => {
      notification(`Adding funds to wallet`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
    })
  }

  allowSendTo(sender, receiver, walletId, allowedFunds, from, value=0) {
    this.paymentPermission.allowSendTo(sender, receiver, walletId, allowedFunds, { from, gas: UNREASONABLY_HIGH_GAS_RATE, value }, (e, txhash) => {
      notification(`Allowing ${sender} to send ${allowedFunds} to ${receiver}`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
    })
  }

  get userIds() {
    return new Promise(res => {
      this.paymentPermission.getUserIds(this.user, (_, response) => {
        res(response.map(int => int.toNumber()));
      });
    });
  }

  addressesAvailableToUser(userId) {
    return new Promise(res => {
      this.paymentPermission.getAddressesAvailableToUser(userId, (_, response) => {
        res(response);
      });
    });
  }

  amountAvailableToUserOnAddress(userId, address) {
    return new Promise(res => {
      this.paymentPermission.getAmountAvailableToUserOnAddress(userId, address, (_, response) => {
        res(response.toNumber());
      });
    });
  }

  sendFunds(walletId, amount, receiverAddress, from) {
    this.paymentPermission.sendTo(walletId, amount, receiverAddress, {from, gas: UNREASONABLY_HIGH_GAS_RATE}, (e, txhash) => {
      notification(`Sending ${amount}wei to ${receiverAddress}`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
    });
  }

  createWallet(user) {
    if (user.toLowerCase() != this.user.toLowerCase()) { // normalize query params with web3 address
      alert(`you can't create a wallet for an address that isn't yours`);
      return;
    }
    this.paymentPermission.createWallet({from: user, gas: UNREASONABLY_HIGH_GAS_RATE }, (e, txhash)=>{
      notification(`Creating Wallet`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
    });
  }
};
