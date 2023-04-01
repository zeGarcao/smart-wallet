// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;

contract SmartWallet {
    address public owner;
    address[] private guardians;
    mapping(address => bool) public isGuardian;

    uint public requiredVotes;
    uint public currentRecoveryRound;
    bool public inRecovery;
    struct Recovery {
        address candidate;
        uint recoveryRound;
        bool usedInExecuteRecovery;
    }
    mapping(address => Recovery) guardianToRecovery;

    constructor(address[] memory _guardians, uint _requiredVotes) {
        require(
            _requiredVotes <= _guardians.length,
            "required votes exceeds guardians length"
        );
        require(_requiredVotes > 0, "required votes must be greater than zero");

        owner = msg.sender;
        requiredVotes = _requiredVotes;

        for (uint i = 0; i < _guardians.length; ++i) {
            addGuardian(_guardians[i]);
        }
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not owner");
        _;
    }

    modifier onlyGuardian() {
        require(isGuardian[msg.sender], "caller is not guardian");
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

        removeFromArray(guardians, _guardian);
        isGuardian[_guardian] = false;

        return true;
    }

    function getGuardians() external view returns (address[] memory) {
        return guardians;
    }

    function triggerRecovery(
        address _candidate
    ) public onlyGuardian returns (bool) {
        require(!inRecovery, "already in recovery mode");
        require(_candidate != address(0), "zero address invalid");

        inRecovery = true;
        ++currentRecoveryRound;
        saveVote(msg.sender, Recovery(_candidate, currentRecoveryRound, false));

        return true;
    }

    function supportRecovery(
        address _candidate
    ) public onlyGuardian returns (bool) {
        require(inRecovery, "not in recovery mode");

        saveVote(msg.sender, Recovery(_candidate, currentRecoveryRound, false));

        return true;
    }

    function executeRecovery(
        address _candidate,
        address[] calldata _guardians
    ) public onlyGuardian returns (bool) {
        require(_candidate != address(0), "zero address invalid");
        require(
            _guardians.length >= requiredVotes,
            "guardians less than required"
        );

        for (uint i = 0; i < _guardians.length; i++) {
            Recovery memory recovery = guardianToRecovery[_guardians[i]];

            require(
                recovery.recoveryRound == currentRecoveryRound,
                "round mismatch"
            );
            require(
                recovery.candidate == _candidate,
                "disagreement on new owner"
            );
            require(!recovery.usedInExecuteRecovery, "duplicate guardian");

            guardianToRecovery[_guardians[i]].usedInExecuteRecovery = true;
        }

        inRecovery = false;
        owner = _candidate;

        return true;
    }

    function cancelRecovery() public onlyOwner returns (bool) {
        require(inRecovery, "not in recovery mode");
        inRecovery = false;
    }

    function saveVote(address _guardian, Recovery memory _vote) private {
        guardianToRecovery[_guardian] = _vote;
    }

    function removeFromArray(address[] storage _arr, address _addr) private {
        uint index = getIndexFromAddress(_arr, _addr);
        _arr[index] = _arr[_arr.length - 1];
        _arr.pop();
    }

    function getIndexFromAddress(
        address[] memory arr,
        address _address
    ) private pure returns (uint _index) {
        for (uint i = 0; i < arr.length; ++i) {
            if (arr[i] == _address) {
                _index = i;
                break;
            }
        }
    }
}
