var express = require('express');
// router 是 Express 提供的一个路由模块，可以用来定义路由处理函数
var router = express.Router();
// 引入MongoDB账单模型
const Bill = require('../../db/moudles/acountMoudle');
// 引入登录检查中间件
// const checkLogin = require('../../middlewares/checklogin');


// 返回账单数据的 API 路由
router.get('/api/bills', function(req, res, next) {
  Bill.find().then((bills) => {
    res.json({ 
        status: 'success',
        statusCode: 200,
        bills: bills
    });
  }).catch((err) => {
    console.error('Error fetching bills:', err);
    res.json({ status: 'error', statusCode: 500, message: '获取账单数据失败' });
  });
});
// 删除账单的 API 路由
router.delete('/api/bills/:id', function(req, res, next) {
  const id = req.params.id;
  Bill.deleteOne({ _id: id }).then(() => {
    res.json({ status: 'success', statusCode: 200 });
  }).catch((err) => {
    console.error('Error deleting bill:', err);
    res.json({ status: 'error', statusCode: 500, message: '删除账单失败' });
  });
});


// 添加账单的 API 路由
router.post('/add',  function(req, res, next) {
  const billData = req.body;
  Bill.create(billData).then((doc) => {
    res.json({status: 'success', statusCode: 200});
  }).catch((err) => {
    console.error('Error creating bill:', err);
    res.json({ status: 'error', statusCode: 500, message: '添加账单失败' });
  });
});
// 更新账单的 API 路由
router.put('/api/bills/:id', function(req, res, next) {
  const id = req.params.id;
  const updatedData = req.body;
  Bill.updateOne({ _id: id }, updatedData).then(() => {
    res.json({ status: 'success', statusCode: 200 });
  }).catch((err) => {
    console.error('Error updating bill:', err);
    res.json({ status: 'error', statusCode: 500, message: '更新账单失败' });
  });
});

module.exports = router;
