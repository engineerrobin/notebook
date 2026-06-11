// 引入mongoose模块
const mongoose = require('mongoose');
// 定义电影的Schema，包含title、director、release_year和genre四个字段
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String, required: true },
  release_year: { type: Number, required: true },
  genre: { type: String, required: true }
});
// 创建电影模型
const Movie = mongoose.model('Movie', movieSchema);
// 导出电影模型
module.exports = Movie;