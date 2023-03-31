// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;

contract SmartWallet {
    address public owner;
    address[] private guardians;
    mapping(address => bool) public isGuardian;

    constructor(address[] memory _guardians) {
        owner = msg.sender;

        for (uint i = 0; i < _guardians.length; ++i) {
            addGuardian(_guardians[i]);
        }
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not owner");
        _;
    }

    function withdraw(uint _amount) external onlyOwner returns (bool) {
        payable(msg.sender).transfer(_amount);
        return true;
    }

    function transferTo(
        address _to,
        uint _amount
    ) external onlyOwner returns (bool) {
        require(_to != address(0), "receiver can not be the zero address");
        require(_amount <= address(this).balance, "insufficient balance");

        payable(_to).transfer(_amount);

        return true;
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    function addGuardian(address _guardian) public onlyOwner returns (bool) {
        require(!isGuardian[_guardian], "duplicate guardian");
        require(_guardian != address(0), "address can not be the zero address");
        require(_guardian != owner, "owner can not be a guardian");

        guardians.push(_guardian);
        isGuardian[_guardian] = true;

        return true;
    }

    function removeGuardian(
        address _guardian
    ) external onlyOwner returns (bool) {
        require(_guardian != address(0), "address can not be the zero address");
        require(isGuardian[_guardian], "guardian does not exist");

        uint index = getIndexFromAddress(_guardian);
        guardians[index] = guardians[guardians.length - 1];
        guardians.pop();
        isGuardian[_guardian] = false;

        return true;
    }

    function getIndexFromAddress(
        address _address
    ) private view returns (uint _index) {
        for (uint i = 0; i < guardians.length; ++i) {
            if (guardians[i] == _address) {
                _index = i;
                break;
            }
        }
    }

    function getGuardians() external view returns (address[] memory) {
        return guardians;
    }
}
