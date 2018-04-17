var PaymentPermission =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__eth_interface__ = __webpack_require__(1);


class AdminTable {
	constructor(container) {
		Object.assign(this, {
			$container: $(container),
			contractInterface: new __WEBPACK_IMPORTED_MODULE_0__eth_interface__["a" /* default */]()
		});
		this.bindClickEvents();
		this.construct().then(() => { 
			this.acceptUserInput();
		});
	}

	async construct() {
		let walletIds = await this.contractInterface.walletsAddressIsAdminOn;
		
		const walletList = this.$container.find('.collection');
		if (walletIds.length) {
			walletIds.forEach(wallet => walletList.append(`<li class="collection-item">Wallet ID: ${wallet}</li>`));
		} else {
			walletList.append(`<li class="collection-item">Create a wallet to get started</li>`)
		}
	}

	bindClickEvents() {
		let createWalletBtn = this.$container.find('#create-wallet');
		createWalletBtn.click(() => {
			let currentUser = web3.eth.accounts[0];
			this.contractInterface.createWallet(currentUser);
		});
	}

	acceptUserInput() {
		let addUserBtn		 	= this.$container.find('#add-user-to-wallet');
		let addFundsBtn 		= this.$container.find('#add-funds-to-wallet');
		let allowSendToBtn	= this.$container.find('#allow-send-funds');
		let [currentUser] 	= web3.eth.accounts;

		addUserBtn.click(() => {
			let walletId 	= this.$container.find('#wallet_id').val();
			let address 	= this.$container.find('#user_address').val();
			this.contractInterface.createWalletUser(walletId, address, currentUser);
		});
		
		addFundsBtn.click(() => {
			let funds 			= this.$container.find('#funds').val();
			let walletId 		= this.$container.find('#wallet_id').val();
			this.contractInterface.addFunds(walletId, funds, currentUser);
		});

		allowSendToBtn.click(() => {
			let walletId 					= this.$container.find('#wallet_id').val();
			let receiver				 	= this.$container.find('#receiving-address').val();
			let allowedFunds		 	= this.$container.find('#receiving-amount').val();
			let sender						= this.$container.find('#user_address').val();
			this.contractInterface.allowSendTo(sender, receiver, walletId, allowedFunds, currentUser);
		});
	}
}
/* harmony export (immutable) */ __webpack_exports__["AdminTable"] = AdminTable;



class UserTable {
	constructor(container) {
		Object.assign(this, {
			$container: $(container),
			contractInterface: new __WEBPACK_IMPORTED_MODULE_0__eth_interface__["a" /* default */]()
		});
		this.construct().then(() => {
			this.acceptUserInput();
		});
	}

	async construct() {
		let walletIds = await this.contractInterface.walletIds;
		let userIds	  = await this.contractInterface.userIds;
		let addresses = await Promise.all(userIds.map(id => this.contractInterface.addressesAvailableToUser(id)));
		
		let users = userIds.reduce((acc, val, i) => {
			acc[userIds[i]] = {
				addresses: addresses[i],
				walletId: walletIds[i]
			};
			
			return acc;
		}, {});

		let amountAvailableToUser = {};
		
		const walletList = this.$container.find('.collection');

		for (const userId in users) {
			let user = users[userId];
			let { walletId } = user;
			for (let address of user.addresses) {
				let amount = await this.contractInterface.amountAvailableToUserOnAddress(userId, address);
				walletList.append(`<li class="collection-item">can send ${amount} wei to ${address} on wallet ${walletId}</li>`);
			}
		}
	}

	acceptUserInput() {
		let sendFundsBtn = this.$container.find('#send-funds-to-user');
		let [currentUser] 	= web3.eth.accounts;

		sendFundsBtn.click(() => {
			let amount 		= this.$container.find('#send-amount').val();
			let toAddress = this.$container.find('#send-to-user').val();
			let walletId 	= this.$container.find('#wallet-to-take-from').val();
			this.contractInterface.sendFunds(walletId, amount, toAddress, currentUser);
		});
	}
}
/* harmony export (immutable) */ __webpack_exports__["UserTable"] = UserTable;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__helpers_url__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__env_config__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__helpers_notification__ = __webpack_require__(4);




const { INFURA_HOST, CONTRACT_ABI, CONTRACT_ADDRESS, UNREASONABLY_HIGH_GAS_RATE } = __WEBPACK_IMPORTED_MODULE_1__env_config__["a" /* default */];

class EthInterface {
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
    return Object(__WEBPACK_IMPORTED_MODULE_0__helpers_url__["a" /* getParam */])('address');
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
      Object(__WEBPACK_IMPORTED_MODULE_2__helpers_notification__["a" /* notification */])(`Adding user to wallet`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
    })
  }

  addFunds(wallet, funds, from) {
    this.paymentPermission.addFundsToWallet(wallet, { from, gas: UNREASONABLY_HIGH_GAS_RATE, value: funds }, (e, txhash) => {
      Object(__WEBPACK_IMPORTED_MODULE_2__helpers_notification__["a" /* notification */])(`Adding funds to wallet`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
    })
  }

  allowSendTo(sender, receiver, walletId, allowedFunds, from, value=0) {
    this.paymentPermission.allowSendTo(sender, receiver, walletId, allowedFunds, { from, gas: UNREASONABLY_HIGH_GAS_RATE, value }, (e, txhash) => {
      Object(__WEBPACK_IMPORTED_MODULE_2__helpers_notification__["a" /* notification */])(`Allowing ${sender} to send ${allowedFunds} to ${receiver}`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
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
      Object(__WEBPACK_IMPORTED_MODULE_2__helpers_notification__["a" /* notification */])(`Sending ${amount}wei to ${receiverAddress}`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
    });
  }

  createWallet(user) {
    if (user.toLowerCase() != this.user.toLowerCase()) { // normalize query params with web3 address
      alert(`you can't create a wallet for an address that isn't yours`);
      return;
    }
    this.paymentPermission.createWallet({from: user, gas: UNREASONABLY_HIGH_GAS_RATE }, (e, txhash)=>{
      Object(__WEBPACK_IMPORTED_MODULE_2__helpers_notification__["a" /* notification */])(`Creating Wallet`, "View Transaction", `https://etherscan.io/tx/${txhash}`, 5000);
    });
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = EthInterface;
;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export setParam */
/* harmony export (immutable) */ __webpack_exports__["a"] = getParam;
/* unused harmony export paramExists */
function setParam(_url, key, val) {
  var url = new URL(_url);

  url.searchParams.set(key, val);

  return url.toString();
}

function getParam(key){

  var url = new URL(location.href);

  return url.searchParams.get(key);
}

function paramExists(_url, key) {
  var url = new URL(_url);

  return !!url.searchParams.get(key);
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const INFURA_HOST = "https://mainnet.infura.io/unUocZxzv4r4nTIdNwBP";
const CONTRACT_ADDRESS = "0xb6a9d7cf910504006b7facdf03da5e70cfefadc9";
const CONTRACT_ABI = [{"constant": false,"inputs": [{"name": "walletId","type": "int256"},{"name": "userAddress","type": "address"}],"name": "createWalletUser","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [],"name": "createWallet","outputs": [{"name": "","type": "int256"}],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "userId","type": "int256"}],"name": "getAddressesAvailableToUser","outputs": [{"name": "","type": "address[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "userAddress","type": "address"}],"name": "getWalletsAddressIsAdminOn","outputs": [{"name": "","type": "int256[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "walletId","type": "int256"}],"name": "addFundsToWallet","outputs": [{"name": "","type": "uint256"}],"payable": true,"stateMutability": "payable","type": "function"},{"constant": false,"inputs": [{"name": "walletId","type": "int256"},{"name": "amount","type": "uint256"},{"name": "receiverAddress","type": "address"}],"name": "sendTo","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "sender","type": "address"},{"name": "receiver","type": "address"},{"name": "walletId","type": "int256"},{"name": "allowedFunds","type": "uint256"}],"name": "allowSendTo","outputs": [],"payable": true,"stateMutability": "payable","type": "function"},{"constant": false,"inputs": [{"name": "walletId","type": "int256"},{"name": "amount","type": "uint256"},{"name": "sender","type": "address"},{"name": "receiver","type": "address"}],"name": "updateUserFundsOnWallet","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "userAddress","type": "address"}],"name": "getUserIds","outputs": [{"name": "","type": "int256[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "int256"}],"name": "users","outputs": [{"name": "id","type": "int256"},{"name": "walletId","type": "int256"},{"name": "_address","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"},{"name": "","type": "uint256"}],"name": "addressToUserIds","outputs": [{"name": "","type": "int256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "userAddress","type": "address"}],"name": "getWalletIds","outputs": [{"name": "","type": "int256[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "walletId","type": "int256"}],"name": "getWalletAdmins","outputs": [{"name": "","type": "address[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "userId","type": "int256"},{"name": "receiver","type": "address"}],"name": "getAmountAvailableToUserOnAddress","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "int256"}],"name": "wallets","outputs": [{"name": "id","type": "int256"},{"name": "funds","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"inputs": [],"payable": false,"stateMutability": "nonpayable","type": "constructor"}];
const UNREASONABLY_HIGH_GAS_RATE = 500000;
/* harmony default export */ __webpack_exports__["a"] = ({
  INFURA_HOST,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  UNREASONABLY_HIGH_GAS_RATE
});


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = notification;
function notification(primaryText, secondaryText='#', secondaryTextLink='', duration=3000, target='_blank') {
  M.toast({html:`<span class="round">${primaryText}</span><a href="${secondaryTextLink}" target=${target} class="btn-flat toast-action">${secondaryText}</a>`, duration, classes:'rounded meta-notification'});
}



/***/ })
/******/ ]);