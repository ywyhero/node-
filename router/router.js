const formidable = require('formidable')
const CryptoJS = require('crypto-js')
const db = require('./../controller/db')
const path = require('path')
const fs = require('fs')
const sd = require('silly-datetime')
const gm = require('gm')

exports.homePage = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        db.total('alllists', (count => {
            res.render('index', {
                'imgurl': req.session.imgurl,
                'pages': Math.ceil(count / 12)
            })
        }))
    }
}
exports.register = (req, res, next) => {
    res.render('register')
}
exports.login = (req, res, next) => {
    res.render('login')
}
exports.pic = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
        return
    }
    res.render('pic', {
        'imgurl': req.session.imgurl
    })
}
exports.upload = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
        return
    }
    res.render('upload')
}

exports.postLogin = (req, res) => {
    let form = formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        if (err) {
            console.log(err)
            return;
        }
        let name = fields.name;
        let password = fields.password;
        db.find('users', {
            "name": name
        }, (err, result) => {
            if (err) {
                console.log(err)
                db.close()
                return
            }
            if (result.length !== 0) {
                if (result[0].password === password) {
                    req.session.userId = result[0].name
                    res.json({ 'code': 1 })
                } else {
                    res.json({ 'code': -5 })
                }
            } else {
                res.json({ 'code': -1 })
            }
        })
    })
}
exports.postRegister = (req, res) => {
    let form = formidable.IncomingForm();
    let key = CryptoJS.enc.Utf8.parse('VINEYAO!@#$%^&*=')
    form.parse(req, (err, fields) => {
        if (err) {
            console.log(err)
            return;
        }
        let name = fields.name;
        db.find('users', {
            "name": name
        }, (err, result) => {
            if (result.length !== 0) {
                res.json({ 'code': -5 })
            } else {
                let password = fields.password;
                password = CryptoJS.AES.encrypt(password, key, {
                    mode: CryptoJS.mode['ECB'],
                    padding: CryptoJS.pad['ZeroPadding'],
                    iv: key
                }).toString();
                db.insertOne('users', {
                    'name': name,
                    'password': password,
                    'imgurl': 'images/default.jpg'
                }, (err, result) => {
                    if (err) {
                        res.json({ "code": -1 })
                    } else {
                        res.json({ "code": 1 })
                    }
                })
            }
        })
    })
}
exports.postLogOut = (req, res) => {
    req.session.userId = null
    res.json({ 'code': 1 })
}
exports.postUserInfo = (req, res) => {
    if (req.session.userId) {
        let username = req.session.userId;
        db.find('users', { 'name': username }, (err, result) => {
            if (err) {
                console.log(err);
                db.close();
                return
            }
            res.json({
                'username': username,
                'imgurl': req.session.imgurl || result[0].imgurl
            })
        })

    }

}
exports.postUpload = (req, res) => {
    let form = formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + '/../public/images');
    form.parse(req, (err, fields, files) => {
        let extname = path.extname(files.upload.name)
        let oldpath = files.upload.path
        let time = sd.format(new Date(), 'YYYYMMDDHHmm');
        let newpath = path.normalize(__dirname + '/../public/images/' + time + extname);
        req.session.imgurl = '/images/' + time + extname;
        fs.rename(oldpath, newpath, (err) => {
            if (err) {
                res.send('改名失败')
                return
            }
            res.json({ 'code': 1 })
        })
    })
}

exports.postCut = (req, res) => {
    let form = formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        let x = fields.x;
        let y = fields.y;
        let w = fields.w;
        let h = fields.h;
        let imgurl = path.normalize(__dirname + '/../public') + req.session.imgurl
        gm(imgurl)
            .crop(w, h, x, y)
            .resize(100, 100, '!')
            .write(imgurl, function(err) {
                if (err) {
                    res.json({
                        'code': -1
                    })
                } else {
                    let username = req.session.userId;

                    db.update('users', { 'name': username }, { 'imgurl': req.session.imgurl }, (err, result) => {
                        if (err) {
                            console.log(err)
                            db.close();
                            return
                        }
                        req.session.imgurl = req.session.imgurl
                        res.json({
                            'code': 1
                        })
                    })


                }
            });
    })
}

exports.postSubmit = (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        if (err) {
            console.log(err)
            return
        }
        let content = fields.content;
        let name = fields.name;
        let time = fields.time;
        db.insertOne('alllists', { 'content': content, 'name': name, 'time': time }, (err, result) => {
            if (err) {
                res.json({ 'code': -1 })
                db.close();
                return
            }
            res.json({ 'code': 1 })
        })
        db.find('userlists', { 'name': name }, (err, result) => {
            if (result.length === 0) {
                db.insertOne('userlists', { 'name': name }, (err, result) => {
                    if (err) {
                        console.log(err)
                        db.close();
                        return
                    }
                })
            }
        })
    })
}

exports.postAllLists = (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        if (err) {
            cosole.log(err)
            return
        }
        let limit = parseInt(fields.limit);
        let page = parseInt(fields.page);
        let total = 0;
        db.total('alllists', (count) => {
            total = count
        })
        db.find('alllists', {}, { 'limit': limit, 'page': (page - 1), "sort": { "time": -1 } }, (err, result) => {
            if (err) {
                res.json({ 'code': -1 });
                return
            }
            res.json({
                'code': 1,
                'result': {
                    'lists': result,
                    'total': total
                }
            })
        })
    })
}

exports.postMyLists = (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fileds) => {
        if (err) {
            console.log(err)
            return
        }
        let name = fileds.name;
        db.find('alllists', { 'name': name }, (err, result) => {
            if (err) {
                res.json({ 'code': -1 });
                return
            }
            res.json({ 'code': 1, 'result': { 'lists': result.reverse() } })
        })
    })
}

exports.postUserLists = (req, res) => {
    db.find('alllists', {}, (err, result) => {
        if (err) {
            res.json({ 'code': -1 });
            return
        }
        let users = []
        result.reverse().map(v => {
            users.push(v.name)
        })
        users = new Set(users)
        users = Array.from(users)
        res.json({ 'code': 1, 'result': { 'lists': users } })
    })
}