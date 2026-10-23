// SPDX-License-Identifier: MIT
// SHEIKHA SOVEREIGN COIN (SHK) CONTRACT
// Owner: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653)
// Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
// Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED

pragma solidity ^0.8.20;

contract SheikhaToken {
    string public name = "Sheikha Sovereign Coin";
    string public symbol = "SHK";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000000 * 10**18; // 1 Billion SHK
    
    address public immutable sovereignOwner;
    string public constant CREED = "LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH";
    string public constant SEAL = "BOUND_BY_QURAN_SUNNAH";
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        sovereignOwner = msg.sender;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "INSUFFICIENT_BALANCE");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}
