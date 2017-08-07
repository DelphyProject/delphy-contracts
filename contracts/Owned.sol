pragma solidity ^0.4.11;


/// @dev `Owned` is a base level contract that assigns an `owner` that can be
///  later changed
contract Owned {
    /*
     *  Storage
     */
    address public owner;
    address public newOwner;

    /*
     *  Modifiers
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /// @notice The Constructor assigns the message sender to be `owner`
    function Owned() {
        owner = msg.sender;
    }

    /// @notice `owner` can step down and assign some other address to this role
    /// @param _newOwner The address of the new owner. 0x0 can be used to create
    ///  an unowned neutral vault, however that cannot be undone
    function changeOwner(address _newOwner) onlyOwner {
        newOwner = _newOwner;
    }


    /// @dev if msg.sender is newOwner, then the owner become the newOwner
    function acceptOwnership() {
        if (msg.sender == newOwner) {
            owner = newOwner;
        }
    }
}