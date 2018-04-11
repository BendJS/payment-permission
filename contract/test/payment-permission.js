require('babel-polyfill');

const EXPECT_FAILURE = require('./expect-failure');

const paymentPermission = artifacts.require('PaymentPermission');

contract('Payment Permission', function([admin, user1, user2, user3, ...addresses]) {
  it('should return all wallet ids', async function() {
    const NUMBER_OF_WALLETS = 50;
    const expectedWalletIds = [...Array(NUMBER_OF_WALLETS)].map((_, i) => i.toString());

    let pp = await paymentPermission.deployed();

    for (const _ of expectedWalletIds) {
      await pp.createWallet({ from: user1, value: 5000 });
    }

    let walletIds = await pp.getWalletIds.call(user1, { from: user1 });

    assert.equal(walletIds.length, NUMBER_OF_WALLETS, 'user has the correct number of wallets');

    for (const id of walletIds) {
      expectedWalletIds.includes(id.toString());
    }
  });

  it('should create wallet with correct parameters', async function() {
    let pp = await paymentPermission.deployed();

    let wallet = await pp.wallets.call(0 , { from: user1 });

    let [ walletId, walletFunds ] = wallet.map(val => val.toString(10));

    assert.equal(walletId, '0', 'id of first wallet is correct');
    assert.equal(walletFunds, '5000', 'value in first wallet is correct');
  });

  it('should create wallet with correct parameters', async function() {
    let pp = await paymentPermission.deployed();

    let wallet = await pp.getWalletAdmins.call(0 , { from: user1 });

    let [ admin ] = wallet;
    
    assert.equal(admin, user1, 'wallet has correct admin after creation');
  });
  


  it('only admin can add funds', async function() {
  });

  it('only admin can remove funds', async function() {
  
  });
  it('only admin can only send to permited user', async function() {
  
  });
  // it('can send value to another address', async function() {
    
  //   let pp = await paymentPermission.deployed();

  //   let user2BalanceBefore = web3.eth.getBalance(user2).toNumber();

  //   await pp.allowSendTo(0, user1, user2, {from: user1, value: 5000});
  //   await pp.sendTo(0, user2, { from: user1, value: 500 });
    
  //   let userBalanceAfter = web3.eth.getBalance(user2).toNumber();

  //   assert.equal(user2BalanceBefore+500, userBalanceAfter);
  // });

  // it('adds users to wallet', async function() {
    
  //   let pp = await paymentPermission.deployed();

  //   let user2BalanceBefore = web3.eth.getBalance(user2).toNumber();

  //   await pp.allowSendTo(0, user1, user2, {from: user1, value: 5000});
  //   await pp.sendTo(0, user2, { from: user1, value: 500 });
    
  //   let userBalanceAfter = web3.eth.getBalance(user2).toNumber();

  //   assert.equal(user2BalanceBefore+500, userBalanceAfter);
  // });

  

});