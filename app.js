const session = require('express-session')
const express = require('express')
const app = express()

const router = require('./router/router')

app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.use(session({
    secret: "!@#$%^&*()",
    name: 'sessionId',
    cookie: { maxAge: 800000 }, //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true
}))

app.get('/', router.register)
app.get('/register', router.register)
app.get('/login', router.login)
app.get('/home', router.homePage)
app.get('/upload', router.upload)
app.get('/pic', router.pic)

app.post('/api/login', router.postLogin)
app.post('/api/register', router.postRegister)
app.post('/api/loginout', router.postLogOut)
app.post('/api/userInfo', router.postUserInfo)
app.post('/api/upload', router.postUpload)
app.post('/api/cut', router.postCut)
app.post('/api/submit', router.postSubmit)
app.post('/api/alllists', router.postAllLists)
app.post('/api/mylists', router.postMyLists)
app.post('/api/userlists', router.postUserLists)

app.listen(8088)