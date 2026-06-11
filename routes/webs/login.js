var express = require('express');
//  router是express.Router()的实例，提供了路由相关的方法，如get、post等，用于定义路由处理函数
var router = express.Router();
// 引入user模型
const User = require('../../db/moudles/userMoudle');
// 引入md5模块用于加密密码
const md5 = require('md5');
// 创建注册页面路由
router.get('/register', function(req, res, next) {
    res.render('register', { title: '注册页面'});
});
// 注册用户
router.post('/register', function(req, res, next) {
  // 查询数据库中是否已经存在相同用户名的用户
  User.findOne({ username: req.body.username }).then((existingUser) => {
    console.log('Existing user:', existingUser);
    if (existingUser) {
      // 如果用户已经存在，返回错误信息
      return res.json({ status: 'error', statusCode: 400, message: '用户名已存在' });
    }
    // 在数据库中注册用户
    // 使用md5加密密码
    User.create({...req.body,password: md5(req.body.password)}).then((user) => {
      res.json({ status: 'success', statusCode: 200, user });
      // 注册成功后，直接重定向到登录页面
    }).catch((err) => {
      console.error('Error creating user:', err);
      res.status(500).json({ message: '注册用户失败' }); 
    });
  });
});
// 登录用户
router.get('/login', function(req, res, next) {
    res.render('login', { title: '登录页面' });
});
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
    // 登录成功，设置会话
    // 将用户信息存储在session中，这样在后续的请求中就可以通过session来判断用户是否登录以及获取用户信息
    // 注意：这里存储在session中的用户信息应该尽量简化，避免存储敏感信息或者过多的数据，通常只需要存储用户的唯一标识（如用户名或用户ID）即可
    // 例如，这里我们只存储用户名，后续可以通过用户名来查询用户的其他信息
    req.session.user = { username: user.username };
    res.json({ status: 'success', statusCode: 200, message: '登录成功' });
  }).catch((err) => {
    console.error('Error finding user:', err);
    res.status(500).json({ message: '登录失败' });
  });
});
// 退出登录（使用 POST，避免通过跨站链接触发）
router.post('/logout', function(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('退出登录失败');
    }

    res.clearCookie('sessionId');
    res.redirect('/acount/login');
  });
});






module.exports = router;
