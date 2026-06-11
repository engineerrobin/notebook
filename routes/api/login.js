var express = require('express');
// 使用express.json中间件解析JSON请求体
var router = express.Router();
router.use(express.json());
// var router = express.Router();
// 引入user模型
const User = require('../../db/moudles/userMoudle');
// 引入MongoDB账单模型
const Bill = require('../../db/moudles/acountMoudle');
// 引入md5模块用于加密密码
const md5 = require('md5');
// 引入jsonwebtoken模块
const jwt = require('jsonwebtoken');
// 定义一个密钥，用于签名和验证JWT
const secretKey = 'your_secret_key';
// 引入token验证中间件
const authenticateToken = require('../../middlewares/tokencheck');

// 登录处理
router.post('/login', function(req, res, next) {
  const { username, password } = req.body;
  // 在数据库中查找用户
  // findOne:根据条件查询单个文档，如果找到多个匹配的文档，则返回第一个匹配的文档；如果没有找到匹配的文档，则返回null。
  User.findOne({ username, password: md5(password) }).then((user) => {
    console.log('Found user:', user);
    // 如果没有找到用户，返回错误信息
    if (!user) {
      return res.json({ status: 'error', statusCode: 400, message: '用户名或密码错误' });
    }
    // 登录成功
    // 设置JWT
    const token = jwt.sign({ username }, secretKey, { expiresIn: 60*60 }); // 1小时过期
    res.json({ status: 'success', statusCode: 200, message: '登录成功', token });
  }).catch((err) => {
    console.error('Error finding user:', err);
    res.json({ status: 'error', statusCode: 500, message: '登录失败' });
  });
});





// 返回账单数据的 API 路由
router.post('/lists', authenticateToken, function(req, res, next) {
  // // 获取Authorization头中的JWT
  // const authHeader = req.headers.authorization;
  // console.log('Authorization header:', authHeader);
  // if (!authHeader) {
  //   return res.json({ status: 'error', statusCode: 401, message: '缺少Authorization请求头' });
  // }

  // // 兼容两种格式：Bearer <token> 或纯 token
  // const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  // if (!token) {
  //   return res.json({ status: 'error', statusCode: 401, message: 'Token为空' });
  // }

  // // 验证JWT
  // jwt.verify(token, secretKey, (err, decoded) => {
  //   if (err) {
  //     console.log('JWT verification failed:', err);
  //     res.json({ status: 'error', statusCode: 401, message: err.message });
  //     return;
  //   }
  //   // JWT验证成功，继续处理请求
  //   Bill.find().then((bills) => {
  //     res.json({ 
  //         status: 'success',
  //         statusCode: 200,
  //         bills: bills
  //     });
  //   }).catch((err) => {
  //     console.error('Error fetching bills:', err);
  //     res.json({ status: 'error', statusCode: 500, message: '获取账单数据失败' });
  //   });
  // });
// 获取用户信息（从JWT解码后的数据中获取用户名）
  const username = req.user.username;
  console.log('Authenticated user:', username); 

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
// 添加了token验证的删除账单的 API 路由
router.delete('/lists/:id', authenticateToken, function(req, res, next) {
  const id = req.params.id;
  Bill.deleteOne({ _id: id }).then(() => {
    res.json({ status: 'success', statusCode: 200 });
  }).catch((err) => {
    console.error('Error deleting bill:', err);
    res.json({ status: 'error', statusCode: 500, message: '删除账单失败' });
  });
});

// 退出登录（使用 POST，避免通过跨站链接触发）
router.post('/logout', function(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.json({ status: 'error', statusCode: 500, message: '退出登录失败' });
    }
    res.clearCookie('sessionId');
    res.json({ status: 'success', statusCode: 200, message: '退出登录成功' });
  });
});


module.exports = router;
