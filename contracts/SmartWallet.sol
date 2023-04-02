// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;

contract SmartWallet {
    /******************************************************
     *   STORAGE
     ******************************************************/

    /// @notice owner of the wallet
    address public owner;

    /// @notice list of guardians
    address[] private guardians;

    /// @notice true if guardian address, else false
    mapping(address => bool) public isGuardian;

    /// @notice required votes to transfer ownership
    uint public requiredVotes;

    /// @notice current recovery round
    uint public currentRecoveryRound;

    /// @notice true if wallet is in recovery mode
    bool public inRecovery;

    /// @notice struct used for bookkeeping during recovery mode
    struct Recovery {
        address candidate;
        uint recoveryRound;
        bool usedInExecuteRecovery;
    }

    /// @notice mapping from guardian address to their Recovery struct
    mapping(address => Recovery) guardianToRecovery;

    /******************************************************
     *   MODIFIERS
     ******************************************************/

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not owner");
        _;
    }

    modifier onlyGuardian() {
        require(isGuardian[msg.sender], "caller is not guardian");
        _;
    }

    /******************************************************
     *   EVENTS
     ******************************************************/

    /// TODO

    /******************************************************
     *   CONSTRUCTOR
     ******************************************************/

    /**
     * @notice sets guardians and required votes
     * @param _guardians - array of guardian addresses
     * @param _requiredVotes - number of guardians required to transfer ownership
     */
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

    /******************************************************
     *   WALLET BASIC FUNCTIONALITIES
     ******************************************************/

    /// @notice allows deposit of ether
    receive() external payable {}

    /**
     * @notice allows transfer of ether to another account
     * @param _to - address of the transfer recipient
     * @param _amount - amount of ether to transfer
     * @return - true if successfully transferred, else false
     */
    function transferTo(
        address _to,
        uint _amount
    ) external onlyOwner returns (bool) {
        require(_to != address(0), "receiver can not be the zero address");
        require(_amount <= address(this).balance, "insufficient balance");

        payable(_to).transfer(_amount);

        return true;
    }

    /**
     * @notice allows to retrieve the wallet balance
     * @return - wallet balance
     */
    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    /******************************************************
     *   GUARDIANS MANAGEMENT
     ******************************************************/

    /**
     * @notice allows guardian addition
     * @param _guardian - guardian address to be added
     * @return - true if guardian added successfuly
     */
    function addGuardian(address _guardian) public onlyOwner returns (bool) {
        require(!isGuardian[_guardian], "duplicate guardian");
        require(_guardian != address(0), "address can not be the zero address");
        require(_guardian != owner, "owner can not be a guardian");

        guardians.push(_guardian);
        isGuardian[_guardian] = true;

        return true;
    }

    /**
     * @notice allows guardian removal
     * @param _guardian - guardian address to be removed
     * @return - true if guardian removed successfuly
     */
    function removeGuardian(
        address _guardian
    ) external onlyOwner returns (bool) {
        require(_guardian != address(0), "address can not be the zero address");
        require(isGuardian[_guardian], "guardian does not exist");

        removeFromArray(guardians, _guardian);
        isGuardian[_guardian] = false;

        return true;
    }

    /**
     * @notice allows to retrieve guardians
     * @return - array of guardians
     */
    function getGuardians() external view returns (address[] memory) {
        return guardians;
    }

    /******************************************************
     *   RECOVERY
     ******************************************************/

    /**
     * @notice allows trigger the recovery mode
     * @param _candidate - address of the candidate
     * @return - true if triggered the recovery mode successfuly
     */
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

    /**
     * @notice allows guardians to support the recovery process
     * @param _candidate - address of the candidate
     * @return - true if vote was saved successfuly
     */
    function supportRecovery(
        address _candidate
    ) public onlyGuardian returns (bool) {
        require(inRecovery, "not in recovery mode");

        saveVote(msg.sender, Recovery(_candidate, currentRecoveryRound, false));

        return true;
    }

    /**
     * @notice allows guardians to close the recovery process
     * @param _candidate - address of the candidate
     * @param _guardians - array of guardian addresses that voted for the candidate
     * @return - true if successfuly transfer ownership
     */
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

    /**
     * @notice allows owner to cancel the recovery round
     * @return - true if recovery round was successfuly canceled
     */
    function cancelRecovery() public onlyOwner returns (bool) {
        require(inRecovery, "not in recovery mode");

        inRecovery = false;
        ++currentRecoveryRound;

        return true;
    }

    /******************************************************
     *   AUXILIAR FUNCTIONS
     ******************************************************/

    /**
     * @notice save guardian's vote
     * @param _guardian - guardian address
     * @param _vote - guardian vote
     */
    function saveVote(address _guardian, Recovery memory _vote) private {
        guardianToRecovery[_guardian] = _vote;
    }

    /**
     * @notice allows item removal from an array
     * @param _arr - array of addresses from which an item should be removed
     * @param _addr - item to be removed
     */
    function removeFromArray(address[] storage _arr, address _addr) private {
        uint index = getIndexFromAddress(_arr, _addr);
        _arr[index] = _arr[_arr.length - 1];
        _arr.pop();
    }

    /**
     * @notice allows to retrieve the index of an array element
     * @param arr - search array
     * @param _address - address
     */
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
