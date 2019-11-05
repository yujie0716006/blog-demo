const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const md5 = require('blueimp-md5')

// 引入用户的模型函数
const userModel = require('../models/user')


// 链接数据库
mongoose.connect('mongodb://localhost/blog', {useNewUrlParser: true})

// 这个是中间件，任何路径都会经过。不考虑他的路径和其他因素
/*router.use((req, res, next) => {
  console.log('所有的内容不考虑，全部经过这个中间件')
  // 表示 让出权利，使下面的中间件可以使用
  next()
})*/

// 首页
router.get('/', (req, res) => {
  res.render('index.html', {
    user: req.session.user
  })
})
// 渲染登陆页面
router.get('/login', (req, res) => {
  res.render('login.html')
})

// 发送登陆页面请求
router.post('/login', (req, res) => {
  const body = req.body
//  查找数据库中是否存在这个用户，如果存在这个用户，user会有数据
  userModel.findOne({
    email: body.email,
    password: md5(md5(body.password)) // 因为存储在数据库中的用户密码是加密的，所以在做对比时也要进行加密比较
  }, (err, user) => {
    if (err) {
      return res.status(500).json({
        err_code: 500,
        msg: '查找用户是否在数据库中出现错误'
      })
    }
    if (!user) {
      // 表示没有查到这个用户
      return res.status(200).json({
        err_code: 1,
        msg: '用户或是密码错误，没有找到此用户'
      })
    } else {
    //  在数据库中查到了这个用户，用户存在，登陆成功，要用 session 记录用户的登陆状态.将这个用户记录下来
      req.session.user = user
      return res.status(200).json({
        err_code: 0,
        msg: '登陆成功'
      })
    }
  })
})

// 渲染 注册 页面
router.get('/register', (req, res) => {
  res.render('register.html')
})

// 发送 注册 页面的请求
router.post('/register', (req, res) => {
  const body = req.body
//  判断是否有存在的邮箱和昵称
  userModel.findOne({
    email: body.email
  }, function (err, data) {
    if (err) {
      return res.status(200).json({err_code: 500, msg: 'server is error'})
    }
    if (data) {
      return res.status(200).json({
        err_code: 601,
        msg: 'email is already'
      })
    }
  })
  userModel.findOne({
    nickname: body.nickname
  }, (err, data) => {
    if (err) {
      return res.status(200).json({err_code: 500, msg: 'server is error'})
    }
    // 说明已经存在有相同的昵称了
    if (data) {
      return res.status(200).json({
        err_code: 602,
        msg: 'nickname is already'
      })
    }
  })

//  使用md5给密码加密
  body.password = md5(md5(body.password))
//  上面的代码中如果有相同的邮件和昵称的时候，就会return跳出函数了。所以执行到这里就是没有相同的邮件和昵称，就可以注册在数据库中了
//  userModel是创建的模型，new userModel创建模型的实例，body是要传入数据库中的数据，然后模型实例调用save进行保存
  new userModel(body).save((err) => {
    if (err) {
      return res.status(200).json({err_code: 500, msg: 'save is error'})
    }
    // session是存储在客户端的内容，所以使用的是 req.session.
    req.session.user = user
    res.status(200).json({err_code: 0, msg: 'save is success'})
    /*当把req.session.user = user放在这时，服务器是获取不到信息的。因为上面的这句话已经将信息返回给客户端了。所以如果要有什么信息的修改要放到前面*/
  })

})

// 退出登陆状态的地址。当点击退出后会请求这个地址。这时候服务器给出响应
router.get('/logout', (req, res) => {
  // 这时候浏览器会记住session的状态是登陆的，所以当地址对的话，显示的还是登陆状态。所以当登出的时候也学要将浏览器的session清空
  req.session.user = null
  res.redirect('/login')
})

// 用户设置接口,渲染页面
router.get('/settings/profile', (req, res, next) => {
  let user = req.session.user
  console.log('user怎么护士', user)
  res.render('settings/profile.html', {
    user
  })
})

// 用户设置接口用来 修改基本信息
router.post('/settings/profile', (req, res, next) => {
  const body = req.body
  body.last_modified_time = Date.now()
  userModel.findByIdAndUpdate(body.id, body, (err, user) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      // 表示在数据库中没有找到这个用户
      return res.status(200).json({
        err_code: 1,
        msg: '没有找到这个用户'
      })
    }
    return res.status(200).json({
      err_code: 2,
      msg: '修改用户基本信息成功'
    })
  })
  userModel.findOne({
    email: body.email
  }, (err, person) => {
    if (err) {
      return next(err)
    }
    req.session.user = person
  })
})

// 将设置的路由暴露出去
module.exports = router
