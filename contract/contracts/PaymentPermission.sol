pragma solidity ^0.4.0;

contract PaymentPermission {

    //primary key => Wallet struct
    mapping (int => Wallet) public wallets;
    
    //primary key => User struct
    mapping (int => User) public users;

    // user address => User ids
    mapping (address => int[]) public addressToUserIds;

    int nextWalletId;
    int nextUserId;

    struct Wallet {
        int id;
        uint funds;
        int[] users;
        address[] admins;
    }

    struct User {
        int id;
        int walletId;
        address _address;
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

    function createWallet() public returns(int) {
        int id = nextWalletId++;

        Wallet storage wallet = wallets[id];
        
        wallet.id = id;
        wallet.admins.push(msg.sender);
        wallet.funds = 0;
        
        wallets[id] = wallet;

        createWalletUser(id, msg.sender);

        return id;
    }

    function createWalletUser(int walletId, address userAddress) public senderIsWalletAdmin(walletId) {
        int id = nextUserId++;

        User storage user = users[id];

        user.id = id;
        user.walletId = walletId;
        user._address = userAddress;
        
        addressToUserIds[userAddress].push(id);
        wallets[walletId].users.push(user.id);
    }

    function addFundsToWallet(int walletId) public payable senderIsWalletAdmin(walletId) returns (uint) {
        Wallet storage wallet = wallets[walletId];
        wallet.funds += msg.value;
        return msg.value;
    }

    function allowSendTo(address sender, address receiver, int walletId, uint allowedFunds) public payable senderIsWalletAdmin(walletId) {
        Wallet storage wallet = wallets[walletId];
        int[] storage walletsUsersIds = wallet.users;

        require(wallet.funds >= allowedFunds);

        for (uint index = 0; index < walletsUsersIds.length; index++) {
            
            User storage user = users[walletsUsersIds[index]];
            
            if (user._address == sender) {
                user.amountCanSendToAddress[receiver] = allowedFunds;
                break;
            }
        }
    }

    function sendTo(int walletId, uint amount, address receiverAddress) public {
        
        Wallet storage wallet = wallets[walletId];
        int[] storage walletsUsersIds = wallet.users;

        require(wallet.funds >= amount);

        for (uint index = 0; index < walletsUsersIds.length; index++) {
            
            User storage user = users[walletsUsersIds[index]];
            
            if (user._address == msg.sender) {
                require(user.amountCanSendToAddress[receiverAddress] >= amount);
                
                receiverAddress.transfer(amount);

                user.amountCanSendToAddress[receiverAddress] -= amount;
                wallet.funds -= amount;
                
                break;
            }
        }
    }
    
    function updateUserFundsOnWallet(int walletId, uint amount, address sender, address receiver) public senderIsWalletAdmin(walletId) {
        int[] storage walletsUsersIds = wallets[walletId].users;
        
        for (uint index = 0; index < walletsUsersIds.length; index++) {
            
            User storage user = users[walletsUsersIds[index]];

            if (user._address == sender) {
                user.amountCanSendToAddress[receiver] = amount;
                break;
            }
        }
    }

    function getWalletIds(address userAddress) public returns (int[]) {
        int[] storage walletUserStructsIds = addressToUserIds[userAddress];
        int[] storage usersWalletsIds;

        for (uint index = 0; index < walletUserStructsIds.length; index++) {
            User storage user = users[walletUserStructsIds[index]];
            usersWalletsIds.push(user.walletId);  
        }

        return usersWalletsIds;
    }

    function getWalletAdmins(int walletId) public constant returns (address[]) {
        address[] storage admins = wallets[walletId].admins;
        return admins;
    }
}