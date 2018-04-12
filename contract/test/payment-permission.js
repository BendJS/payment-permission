require('babel-polyfill');

const EXPECT_FAILURE = require('./expect-failure');

const paymentPermissionContract = artifacts.require('PaymentPermission');

const BASE_TEN = 10;
const LARGE_AMOUNT_OF_WEI = 100000;

contract('Payment Permission', function([admin, user1, user2, user3, ...addresses]) {

  it('only an admin can add funds to a wallet', async function() {
    
    let paymentPermission = await paymentPermissionContract.deployed();
    
    await paymentPermission.createWallet({ from:user1 });
    await paymentPermission.createWallet({ from:user1 });
    await paymentPermission.createWallet({ from:user1 });
    
    await paymentPermission.addFundsToWallet(0, { from: user1, value: LARGE_AMOUNT_OF_WEI });

    let [ walletId, walletFunds ] = (await paymentPermission.wallets(0)).map(val => val.toNumber());

    assert.equal(walletFunds, LARGE_AMOUNT_OF_WEI, `wallet ${walletId} has ${LARGE_AMOUNT_OF_WEI} in funds`);
    
    await EXPECT_FAILURE.EXPECT_THROW(
                          paymentPermission.addFundsToWallet(0, { from: user2, value: LARGE_AMOUNT_OF_WEI }));
    
  });

  it('only admin can remove funds', async function() {
    
  });
  it('only admin can only send to permited user', async function() {
    
  });
  it('user can not send funds they do not have', async function() {
    
  });
  // it('can send value to another address', async function() {
    
  //   let pp = await paymentPermission.deployed();

  //   let user2BalanceBefore = web3.eth.getBalance(user2).toNumber();

  //   await pp.allowSendTo(0, user1, user2, {from: user10});
  //   await pp.sendTo(0, user2, { from: user1 });
    
  //   let userBalanceAfter = web3.eth.getBalance(user2).toNumber();

  //   assert.equal(user2BalanceBefore+500, userBalanceAfter);
  // });

  // it('adds users to wallet', async function() {
    
  //   let pp = await paymentPermission.deployed();

  //   let user2BalanceBefore = web3.eth.getBalance(user2).toNumber();

  //   await pp.allowSendTo(0, user1, user2, {from: user10});
  //   await pp.sendTo(0, user2, { from: user1 });
    
  //   let userBalanceAfter = web3.eth.getBalance(user2).toNumber();

  //   assert.equal(user2BalanceBefore+500, userBalanceAfter);
  // });

  

});