pragma solidity ^0.4.0;

contract PaymentPermission {

    //primary key => Wallet struct
    mapping (int => Wallet)     public wallets;
    
    //primary key => WalletUser struct
    mapping (int => WalletUser) public walletUsers;
    
    // walletID => WalletUser structs
    mapping (int => WalletUser[]) walletsUsers;

    // user address => WalletUser ids
    mapping (address => int[])  userWallets;


    int public nextWalletId;
    int public nextUserId;

    struct Wallet {
        int id;
        uint funds;
        address[] admins;
    }

    struct WalletUser {
        int id;
        int walletId;
        address userAddress;
        mapping ( address => uint ) amountCanSendToAddress;
    }

    modifier senderIsWalletAdmin(int walletId) {
        bool foundAdmin;
        address[] storage admins = wallets[walletId].admins;
        for (uint index = 0; index < admins.length; index++) {
            if (admins[index] == msg.sender) {
                foundAdmin = true;
                break;
            }
        }
        require(foundAdmin);
        _;
    }

    function PaymentPermission() public {
        nextWalletId = 0;
        nextUserId = 0;
    }

    function createWallet() public payable {
        int id = nextWalletId++;

        Wallet storage wallet = wallets[id];
        wallet.id = id;
        wallet.funds = msg.value;
        wallet.admins.push(msg.sender);

        userWallets[msg.sender].push(id);

        createWalletUser(id);
    }


    function createWalletUser(int walletId) public payable senderIsWalletAdmin(walletId) {
        int id = nextUserId++;

        WalletUser storage walletUser = walletUsers[id];

        walletUser.walletId = walletId;
        walletUser.id = id;
        walletUser.userAddress = msg.sender;
        walletUser.amountCanSendToAddress[msg.sender] = msg.value;
        
        walletsUsers[walletId].push(walletUser);
    }

    function allowSendTo(int walletId, address sender, address receiver) public payable senderIsWalletAdmin(walletId) {
        WalletUser[] storage walletusers = walletsUsers[walletId];

        for (uint index = 0; index < walletusers.length; index++) {
            if (walletusers[index].userAddress == sender) {
                walletusers[index].amountCanSendToAddress[receiver] = msg.value;
                break;
            }
        }
    }

    function sendTo(int walletId, address _address) public payable {
        WalletUser[] storage walletusers = walletsUsers[walletId];
        Wallet storage wallet = wallets[walletId];

        for (uint index = 0; index < walletusers.length; index++) {
            if (walletusers[index].userAddress == msg.sender) {
                WalletUser storage walletUser = walletusers[index];
                require(walletUser.amountCanSendToAddress[_address] >= msg.value);
                _address.transfer(msg.value);
                wallet.funds -= msg.value;
                break;
            }
        }
    }

    function getWalletIds(address user) public constant returns (int[]) {
        int[] storage walletIds = userWallets[user];
        return walletIds;
    }

    function getWalletAdmins(int walletId) public constant returns (address[]) {
        address[] storage admins = wallets[walletId].admins;
        return admins;
    }
}