// 引入mongoose模块
const mongoose = require('mongoose');
// 定义用户的Schema，包含username、password和email三个字段
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true }
});
// 创建用户模型
const User = mongoose.model('User', userSchema);
// 导出用户模型
module.exports = User;