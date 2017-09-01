const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017/ywy'
let _connectDB = (callback) => {
    MongoClient.connect(url, (err, db) => {
        callback(err, db)
    })
}

exports.insertOne = (collectionName, json, callback) => {
    _connectDB((err, db) => {
        if (err) {
            console.log('链接失败')
            db.close();
            return
        }
        db.collection(collectionName).insertOne(json, (err, reslut) => {
            callback(err, reslut)
        })
    })
}

exports.find = function(collectionName, json, C, D) {
    if (arguments.length === 3) {
        var callback = C;
        var skipnum = 0;
        var limitnum = 0;
    } else if (arguments.length === 4) {
        var args = C;
        var callback = D;
        var skipnum = args.page * args.limit || 0;
        var limitnum = args.limit || 0;
        var sort = args.sort || {}
    } else {
        console.log('find参数数量不正确')
    }
    let result = []
    _connectDB((err, db) => {
        if (err) {
            console.log('链接失败')
            db.close();
            return
        }
        let cursor = db.collection(collectionName).find(json).limit(limitnum).skip(skipnum).sort(sort);
        cursor.each((err, v) => {
            if (v !== null) {
                result.push(v);
            } else {
                callback(err, result)
            }
        })
    })
}


exports.update = (collectionName, json, setJson, callback) => {
    _connectDB((err, db) => {
        if (err) {
            console.log('链接失败')
            db.close();
            return
        }
        db.collection(collectionName).update(json, { $set: setJson }, (err, result) => {
            callback(err, result)
        });
    })
}

exports.total = (collectionName, callback) => {
    _connectDB((err, db) => {
        if (err) {
            console.log(err);
            return
        }
        db.collection(collectionName).count({}).then((count) => {
            callback(count);
            db.close();
        });
    })
}