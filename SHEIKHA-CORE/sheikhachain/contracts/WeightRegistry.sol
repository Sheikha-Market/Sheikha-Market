// SPDX-License-Identifier: MIT
// 🕌 SHEIKHA WEIGHT REGISTRY - Polygon Amoy - CR2051263653
// BOUND_BY_QURAN_SUNNAH - ATOM_WATER_RASUL_JANNAH_SEALED
pragma solidity ^0.8.20;

contract SheikhaWeightRegistryV5 {
    address public owner = 0x0000000000000000000000000000000000000000; // سيتم تعيينه بـ deploy_real.py
    string public constant SEAL = "BOUND_BY_QURAN_SUNNAH";
    string public constant CREED = "LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH";
    string public constant OWNER_CR = "2051263653";
    string public constant UNIFIED_ID = "7049031003";

    struct Weight {
        string code;
        string title;
        string weightHash;
        string modelFamily; // GPT, Llama, Claude, Gemini, 【entity-Copilot¦canonical_name=Copilot】
        string owner;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Weight) public weights;
    string[] public allCodes;
    uint256 public totalWeights;

    event WeightSealed(string code, string weightHash, string title, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner || owner == address(0), "Only CR2051263653");
        _;
    }

    function sealWeight(string memory _code, string memory _title, string memory _weightHash, string memory _modelFamily) public onlyOwner {
        require(!weights[_code].exists, "Already sealed");
        weights[_code] = Weight(_code, _title, _weightHash, _modelFamily, OWNER_CR, block.timestamp, true);
        allCodes.push(_code);
        totalWeights++;
        emit WeightSealed(_code, _weightHash, _title, block.timestamp);
    }

    function verifyOwnership(string memory _code) public view returns (string memory, string memory, bool) {
        Weight memory w = weights[_code];
        return (w.weightHash, w.owner, w.exists);
    }

    function getAllCodes() public view returns (string[] memory) {
        return allCodes;
    }
}
