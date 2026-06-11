var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/webs/index');
// 引入api路由
var apiRouter = require('./routes/api/acount');
// 引入登录路由
var loginRouter = require('./routes/webs/login');
// 引入添加了token验证的登录路由
var loginTokenRouter = require('./routes/api/login');
// 引入中间件express-session
const session = require('express-session');
// 引入connect-mongo中间件，用于将session存储在MongoDB中
// 注意：MongoStore的暴露方式可能会根据版本有所不同，这里使用的是connect-mongo@6.x版本的用法（如果你使用的是其他版本，请参考对应版本的文档）
const { MongoStore } = require('connect-mongo');
// 使用express-session中间件
app.use(session({
    name: 'sessionId', // 设置cookie的名称，默认为connect.sid
    secret: 'mysecret', // 用于加密session ID的字符串
    resave: false, // 是否在每次请求时重新保存session
    saveUninitialized: true, // 是否保存未初始化的session
    cookie: { 
        maxAge: 1000 * 60 * 60, // 设置cookie的过期时间，单位是毫秒，这里设置为1小时
        httpOnly: true // 设置cookie为httpOnly，防止客户端JavaScript访问cookie
    },
        store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/sessionDB' }), // 将session存储在MongoDB中
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 设置静态文件目录为 public 文件夹
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// 使用 api 路由，所有以 /api 开头的请求都会被 apiRouter 处理
app.use('/api', apiRouter);
// 使用登录路由，所有以 /acount 开头的请求都会被 loginRouter 处理
app.use('/acount', loginRouter);
// 使用添加了token验证的登录路由，所有以 /api/token 开头的请求都会被 loginTokenRouter 处理
app.use('/api/token', loginTokenRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));
  // 修改为直接渲染404页面，而不是通过错误处理中间件来处理
  res.status(404).render('404', { title: '页面未找到' });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
