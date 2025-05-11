// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    struct StageEvent {
        bytes32 uid; 
        bytes32 stage;
        bytes32 action; // "entry" or "exit"
        uint40 timestamp;
    }

    struct Order {
        uint256 orderId;
        bytes32 carRfid;
        uint40 createdAt;
    }

    struct OrderItem {
        uint256 orderId;
        bytes32 itemUid;
        bytes32 stage;
    }

    mapping(uint256 => StageEvent) public logs;
    uint256 public logCount;

    mapping(uint256 => Order) public orders;
    uint256 public orderCount;

    mapping(uint256 => OrderItem) public items;
    uint256 public itemCount;

    // Lookup mappings for fast access
    mapping(bytes32 => uint256[]) public uidToLogIndexes;
    mapping(uint256 => uint256[]) public orderToItemIndexes;

    // Events for off-chain indexing
    event StageEventLogged(uint256 index, bytes32 uid, bytes32 stage, bytes32 action);
    event OrderLogged(uint256 index, uint256 orderId, bytes32 carRfid);
    event OrderItemLogged(uint256 index, uint256 orderId, bytes32 itemUid, bytes32 stage);

    function logStageEvent(bytes32 uid, bytes32 stage, bytes32 action) external onlyOwner {
        logs[logCount] = StageEvent(uid, stage, action, uint40(block.timestamp));
        uidToLogIndexes[uid].push(logCount);
        emit StageEventLogged(logCount, uid, stage, action);
        logCount++;
    }

    function logOrder(uint256 orderId, bytes32 carRfid) external onlyOwner {
        orders[orderCount] = Order(orderId, carRfid, uint40(block.timestamp));
        emit OrderLogged(orderCount, orderId, carRfid);
        orderCount++;
    }

    function logOrderItem(uint256 orderId, bytes32 itemUid, bytes32 stage) external onlyOwner {
        items[itemCount] = OrderItem(orderId, itemUid, stage);
        orderToItemIndexes[orderId].push(itemCount);
        emit OrderItemLogged(itemCount, orderId, itemUid, stage);
        itemCount++;
    }

    // Getters
    function getLog(uint256 index) external view returns (StageEvent memory) {
        require(index < logCount, "Invalid log index");
        return logs[index];
    }

    function getOrder(uint256 index) external view returns (Order memory) {
        require(index < orderCount, "Invalid order index");
        return orders[index];
    }

    function getItem(uint256 index) external view returns (OrderItem memory) {
        require(index < itemCount, "Invalid item index");
        return items[index];
    }

    function getLogIndexesByUID(bytes32 uid) external view returns (uint256[] memory) {
        return uidToLogIndexes[uid];
    }

    function getItemIndexesByOrderId(uint256 orderId) external view returns (uint256[] memory) {
        return orderToItemIndexes[orderId];
    }

    // Optional: transfer ownership if needed
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address not allowed");
        owner = newOwner;
    }
}
