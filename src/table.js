import EthInterface from './eth-interface';

export class AdminTable {
	constructor(container) {
		Object.assign(this, {
			$container: $(container),
			contractInterface: new EthInterface()
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


export class UserTable {
	constructor(container) {
		Object.assign(this, {
			$container: $(container),
			contractInterface: new EthInterface()
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
