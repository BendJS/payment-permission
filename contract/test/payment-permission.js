require('babel-polyfill');

const { EXPECT_THROW } = require('./expect-failure');
const { makeIterator } = require('./iterator-helper');

const paymentPermissionContract = artifacts.require('PaymentPermission');

const BASE_TEN = 10;
const LARGE_AMOUNT_OF_WEI = 100000;

contract('Payment Permission', function([admin, user1, user2, user3, ...addresses]) {

  const iterator = makeIterator([...new Array(500)].map((_, i) => i));

  it('only only allows admins to add funds to wallet', async function() {
    const WALLET_TO_EXAMINE = iterator.next().value;
    // get deployed version of contract
    let paymentPermission = await paymentPermissionContract.deployed();
    // create wallets
    await paymentPermission.createWallet({ from: user1 });
    // add funds to the wallet
    await paymentPermission.addFundsToWallet(WALLET_TO_EXAMINE, { from: user1, value: LARGE_AMOUNT_OF_WEI });
    // get the wallet's information
    let [ walletId, walletFunds ] = (await paymentPermission.wallets(WALLET_TO_EXAMINE)).map(val => val.toNumber());
    // wallet has correct balance
    assert.equal(walletFunds, LARGE_AMOUNT_OF_WEI, `wallet ${walletId} has ${LARGE_AMOUNT_OF_WEI} in funds`);
    // wallet fails when you aren't an admin and try to add funds
    await EXPECT_THROW(paymentPermission.addFundsToWallet(WALLET_TO_EXAMINE, { from: user2, value: LARGE_AMOUNT_OF_WEI }));
    
  });

  it('allows admins to add users to wallet', async function() {
    // get deployed version of contract
    let paymentPermission = await paymentPermissionContract.deployed();
    // walletId that we're going to be examining
    const WALLET_PERMISSION_IS_GRANTED_ON = iterator.next().value;
    // create wallet
    await paymentPermission.createWallet({ from: user1 });
    // add a user to the wallet
    await paymentPermission.createWalletUser(WALLET_PERMISSION_IS_GRANTED_ON, user2, { from: user1 });
    // get the wallet id from the public mapping
    let [ walletId ] = await paymentPermission.getWalletIds.call(user2);
    // check to make sure that the wallet Id is correct
    assert.equal(walletId.toNumber(), WALLET_PERMISSION_IS_GRANTED_ON, 'permision is granted to the proper wallet');
    // a user that is not an admin can not add a user to a wallet
    await EXPECT_THROW(paymentPermission.createWalletUser(WALLET_PERMISSION_IS_GRANTED_ON, user2, { from: user2 }));
  });

  it('allows users to send funds they have', async function() {
    // amount of wei a user can send
    const WEI_CAN_SEND = 500;
    // deployed contract
    let paymentPermission = await paymentPermissionContract.deployed();
    // create wallet
    await paymentPermission.createWallet({ from: user3 });
    // send funds to wallet
    const WALLET_TO_EXAMINE = iterator.next().value;
    await paymentPermission.addFundsToWallet(WALLET_TO_EXAMINE, { from: user3, value: LARGE_AMOUNT_OF_WEI });
    // create wallet user
    await paymentPermission.createWalletUser(WALLET_TO_EXAMINE, user1, { from: user3 });
    // allow user to send funds to address
    await paymentPermission.allowSendTo(user1, user2, WALLET_TO_EXAMINE, WEI_CAN_SEND, { from: user3 });
    // get contract's balance prior to the sending of funds
    const oldContractBalance = web3.eth.getBalance(paymentPermission.address).toNumber();
    // get the balance of user 2 prior to sending wei
    const oldUser2Balance = web3.eth.getBalance(user2).toNumber();
    // get wallet funds prior
    const [ _nil, oldWalletFunds ] = (await paymentPermission.wallets(WALLET_TO_EXAMINE)).map(val => val.toNumber());
    
    
    // send funds to address from user 1
    await paymentPermission.sendTo(WALLET_TO_EXAMINE, WEI_CAN_SEND, user2, { from: user1 });
    
    
    // check new contract balance
    const newContractBalance = web3.eth.getBalance(paymentPermission.address).toNumber();
    // contract has decreased in value
    assert.equal(newContractBalance, oldContractBalance-WEI_CAN_SEND, 'wei has been sent from contract');
    // check new user balance
    const newUser2Balance = web3.eth.getBalance(user2).toNumber();
    // user2 balance has increased
    assert.equal(newUser2Balance, oldUser2Balance+WEI_CAN_SEND, 'wei has been received by user');
    // get new wallet funds
    const [ _blank_, newWalletFunds ] = (await paymentPermission.wallets(WALLET_TO_EXAMINE)).map(val => val.toNumber());
    // check wallet's balance has decreased
    assert.equal(oldWalletFunds, newWalletFunds+WEI_CAN_SEND, 'wallet funds have decreased');
  });
});