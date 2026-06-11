var express = require('express');
var router = express.Router();
// 引入账单模型
const Bill = require('../../db/moudles/acountMoudle');
// 引入登录检查中间件
const checkLogin = require('../../middlewares/checklogin');




// 账单列表
router.get('/list', checkLogin, function(req, res, next) {
    res.render('list', { title: '账单列表'});
});
// 返回账单数据的 API 路由
router.get('/api/bills', checkLogin, function(req, res, next) {
  Bill.find().then((bills) => {
    res.json({ bills });
  }).catch((err) => {
    console.error('Error fetching bills:', err);
    res.status(500).json({ message: '获取账单数据失败' });
  });
});
// 删除账单的 API 路由
router.delete('/api/bills/:id', checkLogin, function(req, res, next) {
  const id = req.params.id;
  console.log('Deleting bill with id:', id);
  // 注意：MongoDB 中的 _id 是一个 ObjectId 类型，而不是数字，所以需要根据实际情况调整查询条件
  Bill.deleteOne({ _id: id }).then(() => {
    res.json({ status: 'success', statusCode: 200 });
  }).catch((err) => {
    console.error('Error deleting bill:', err);
    res.status(500).json({ message: '删除账单失败' });
  });
});
// 添加账单页面
router.get('/add', function(req, res, next) {
  res.render('add', { title: '添加账单' });
});
// 添加账单处理
router.post('/add', checkLogin, function(req, res, next) {
  const billData = req.body;
  Bill.create(billData).then((doc) => {
    res.json({status: 'success', statusCode: 200});
  }).catch((err) => {
    console.error('Error creating bill:', err);
    res.status(500).json({ message: '添加账单失败' });
  });
});
// 首页
router.get('/', function(req, res, next) {
  // 如果用户已经登录，直接重定向到账单列表页面
  if (req.session.user) {
    return res.redirect('/list');
  }
  // 否则，重定向到登录页面
  res.redirect('/acount/login');
});

module.exports = router;
