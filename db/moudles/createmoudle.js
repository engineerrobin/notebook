    // 引入 mongoose 模块
    const mongoose = require('mongoose');
    const userSchema = new mongoose.Schema({
    // 字符串类型字段，必填
    name: { type: String, required: true },
    // 字符串类型字段，唯一
    auther:{type:String,unique:true},
    price: Number,
    // 日期类型字段，默认值
    created_at: { type: Date, default: Date.now },
  });

    const User = mongoose.model('User', userSchema);
    module.exports = User;