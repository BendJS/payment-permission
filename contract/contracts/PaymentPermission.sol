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
        address[] availableAddresses;
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

    function allowSendTo(address sender, address receiver, int walletId, uint allowedFunds) public senderIsWalletAdmin(walletId) {
        Wallet storage wallet = wallets[walletId];
        int[] storage walletsUsersIds = wallet.users;

        require(wallet.funds >= allowedFunds);

        for (uint index = 0; index < walletsUsersIds.length; index++) {

            User storage user = users[walletsUsersIds[index]];

            if (user._address == sender) {

                user.amountCanSendToAddress[receiver] = allowedFunds;

                bool addressAlreadyAvailableToUser = false;

                for (index = 0; index < user.availableAddresses.length; index++) {
                    if (user.availableAddresses[index] == receiver) {
                        addressAlreadyAvailableToUser = true;
                    }
                }

                if (!addressAlreadyAvailableToUser) {
                    user.availableAddresses.push(receiver);
                }

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

    function getWalletIds(address userAddress) public constant returns (int[]) {
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

    function getWalletsAddressIsAdminOn(address userAddress) public constant returns (int[]) {
        int[] storage walletUserStructsIds = addressToUserIds[userAddress];
        Wallet storage wallet;
        int[] storage walletsIdsUserIsAdminOn;

        for (uint usersIndex = 0; usersIndex < walletUserStructsIds.length; usersIndex++) {
            int walletId = users[walletUserStructsIds[usersIndex]].walletId;
            wallet = wallets[walletId];
            
            address[] storage admins = wallet.admins;
            for (uint adminsIndex = 0; adminsIndex < admins.length; adminsIndex++) {
                if (admins[adminsIndex] == userAddress) {
                    walletsIdsUserIsAdminOn.push(wallet.id);
                    break;
                }
            }
        }

        return walletsIdsUserIsAdminOn;
    }

    function getUserIds(address userAddress) public constant returns (int[]) {
        int[] storage structsIds = addressToUserIds[userAddress];
        return structsIds;
    }

    function getAddressesAvailableToUser(int userId) public constant returns (address[]) {
        address[] storage available = users[userId].availableAddresses;
        return available;
    }

    function getAmountAvailableToUserOnAddress(int userId, address receiver) public constant returns (uint) {
        uint amount = users[userId].amountCanSendToAddress[receiver];
        return amount;
    }
}
