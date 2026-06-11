// 引入mongoose模块
const mongoose = require('mongoose');
// 定义账单数据的Schema
const billSchema = new mongoose.Schema({
 // { id: 5, date: "2026-06-01", category: "购物", note: "生活用品", type: "expense", amount: 328 }
    date: { type: String, required: true },
    category: { type: String, required: true },
    note: { type: String },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    username: { type: String, required: true } // 添加用户名字段，用于关联账单和用户
});
// 创建一个模型来操作账单数据
const Bill = mongoose.model('Bill', billSchema);
// 暴露模型供其他模块使用
module.exports = Bill;