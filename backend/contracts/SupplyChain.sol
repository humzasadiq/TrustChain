// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {

    function uint2str(uint _i) internal pure returns (string memory str) {
    if (_i == 0) return "0";
    uint j = _i;
    uint len;
    while (j != 0) {
        len++;
        j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint k = len;
    j = _i;
    while (j != 0) {
        bstr[--k] = bytes1(uint8(48 + j % 10));
        j /= 10;
    }
    str = string(bstr);
}


     struct StageEvent {
        string uid;
        string stage;
        string action; // Entry or Exit
        uint256 timestamp;
    }


    StageEvent[] public logs;

    function logStageEvent(string memory uid, string memory stage, string memory action) public {
        logs.push(StageEvent(uid, stage, action, block.timestamp));
    }

    function getAllLogs() public view returns (StageEvent[] memory) {
        return logs;
    }

function getLog(uint index) public view returns (string memory) {
    require(index < logs.length, "Invalid index");
    StageEvent memory log = logs[index];
    return string(abi.encodePacked(
        log.uid, " ",
        log.stage, " ",
        log.action, " ",
        uint2str(log.timestamp)
    ));
}

    function totalLogs() public view returns (uint) {
        return logs.length;
    }
}
