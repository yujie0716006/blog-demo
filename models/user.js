// 这里是 user 用户信息的模型
const mongoose = require('mongoose')
// 设置用户的模型
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  created_time: { // 创建用户的时间
    type: Date,
    default: Date.now // 这里不加（）要不会立即调用，所有的时间都一样。这里给了一个方法Date.now。当你去new Model的时候，如果你没有传递create_time则会调用default制定的方法
  },
  last_modified_time: { // 最后修改的时间
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: '/public/img/logo3.png'
  },
  gender: {
    type: Number,
    enum: [-1, 0, 1], // 枚举，只能是这几个值
    default: -1
  },
  birthday: {
    type: Date
  },
  status: {
    type: Number,
    // 0:没有权限限制 1：不可以评论 2：不可以登录
    enum: [0, 1, 2],
    default: 0
  },
  bio: {
    type: String,
    default: ''
  }
})

// 向外暴露 模型函数
module.exports = mongoose.model('User', userSchema)
