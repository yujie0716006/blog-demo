const express = require('express')
const path = require('path')
const bodyParser = require('body-parser') // 使用的是express的中间件
const session = require('express-session')

const router = require('./router/router')

// 创建server实例
const app = express()

// 向外面暴露可以获取的文件
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')))

// express默认使用views下面的页面模版，我们通过设置更改他的默认页面路径
app.set('views', path.join(__dirname, 'views'))

// 设置使用express-art-template解析页面
app.engine('html', require('express-art-template'))

// 设置express的中间件post请求的设置
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// 配置 session用来信息，这样是存在缓存中了，重启服务器就会重写
app.use(session({
  secret: 'password', // 当去加密的时候，加密的内容和他拼串，再去加密。提高安全性
  resave: false,
  saveUninitialized: true // true表示默认的时候，自动分配一个session值。
}))

// 挂载路由
app.use(router)

// 服务器的错误处理机制，必须要4个参数。如果调用next传递参数时，直接就是跳到这个中间件上面
app.use((err, req, res, next) => {
  if (err) {
    return res.status(500).json({
      err_code: 500,
      msg: '服务器有错误，请稍后再试～'
    })
  }
})

// 启动服务器
app.listen(5000, () => {
  console.log('启动成功！')
})
