const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Theme = require('../models/theme')
var url = require('url');
const upload = require('../utilis/upload')
var fs = require('fs');

module.exports = (app, passport) => {
    var order_home, order_user, order_cate
    var keyword, category
    var filter_home, filter_user, filter_cate

    router.get('/', function(req, res) {
        res.render('index', { user: req.user });
    })

    router.get('/home', function(req, res) {
        //Model.find(condition, fields, { sort: [['_id', -1]] }, callback);
        //Model.find().sort({ '_id': -1 }).limit(1).exec(function (err, docs) { })
        var params = url.parse(req.url, true).query;
        keyword = params.s
        if (keyword == null) {
            filter_home = {}
        } else filter_home = {
            name: eval("/" + keyword + "/i")
                //name: { $regex: title, $Option: "$i" }   
        }
        var x = params.orderby;
        switch (x) {
            case 'price':
                order_home = { 'price': 1 };
                break;
            case 'price-desc':
                order_home = { 'price': -1 };
                break;
            case '_id':
                order_home = { '_id': 1 };
                break;
            case '_id_desc':
                order_home = { '_id': -1 };
                break;
            case 'name':
                order_home = { 'name': 1 };
                break;
            case 'date':
                order_home = { 'date': 1 };
                break;
            case 'date_desc':
                order_home = { 'date': -1 };
                break;
            default:
                order_home = { '_id': 1 };
        }
        Theme.find(filter_home).sort(order_home).exec(function(err, allThemes) {
            if (err) {
                console.log(err);
            } else {
                res.render('home', { user: req.user, videos: allThemes });
            }
        });
    })

    router.get('/user/:username', function(req, res) {
        var params = url.parse(req.url, true).query;
        keyword = params.s;
        var x = params.orderby;
        if (keyword == null) {
            filter_user = { username: req.params.username };
        } else filter_user = {
            name: eval("/" + keyword + "/i"),
            username: req.params.username
                //name: { $regex: title, $Option: "$i" }  
        }
        switch (x) {
            case 'price':
                order_user = { 'price': 1 };
                break;
            case 'price-desc':
                order_user = { 'price': -1 };
                break;
            case '_id':
                order_user = { '_id': 1 };
                break;
            case '_id_desc':
                order_user = { '_id': -1 };
                break;
            case 'name':
                order_user = { 'name': 1 };
                break;
            case 'date':
                order_home = { 'date': 1 };
                break;
            case 'date_desc':
                order_home = { 'date': -1 };
                break;
            default:
                order_user = { '_id': 1 };
        }
        Theme.find(filter_user).sort(order_user).exec(function(err, classThemes) {
            if (err) {
                console.log(err);
                res.redirect('home')
            } else {
                res.render('user', { user: req.user, videos: classThemes });
            }
        })
    })

    router.get('/signup', function(req, res) {
        res.render('signup')
    })

    router.post('/signup', function(req, res) {
        User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, function(err, user) {
            if (err) {
                console.log(err);
                res.render('signup')
            }
            passport.authenticate('local')(req, res, function() {
                req.flash('注册成功！')
                res.redirect('/home')
            })
        })
    })

    router.get('/signin', function(req, res) {
        res.render('signin')
    })

    router.post('/signin', passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/signin',
    }))

    router.get('/logout', function(req, res) {
        req.logout()
        req.flash('成功退出！')
        res.redirect('/home')
    });

    /* GET newtheme page. */
    router.get('/newtheme', function(req, res) {
        res.render('newtheme', { user: req.user });
    });
    /* POST newtheme logic. */
    router.post('/newtheme', upload.single('file'), function(req, res) {

        var newvid = {
            name: req.file.filename,
            video: req.file.path.replace("magic", "").split("\\").join("/"),
            username: req.user.username,
            price: req.body.price,
            classification: req.body.classification,
            date: new Date(),
            description: req.body.description
        };
        Theme.create(newvid, function(err) {
            if (err) {
                console.log(err);
                res.render('newtheme');
            } else {
                res.redirect('home');
            }
        });
    });

    router.get('/official-themes', function(req, res) {
        res.render('official-themes', { user: req.user });
    });

    /* GET product page. */
    router.get('/product/:id', function(req, res) {
        Theme.findById(req.params.id, function(err, foundTheme) {
            if (err) {
                console.log(err);
            } else {
                res.render('product', { user: req.user, video: foundTheme });
            }
        });
    });

    router.get('/product/:id/edit', function(req, res) {
        Theme.findById(req.params.id, function(err, foundTheme) {
            if (err) {
                console.log(err);
            } else {
                res.render('edit', { user: req.user, video: foundTheme });
            }
        });
    });

    router.put('/product/:id', function(req, res) {
        var newvid = {
            name: req.body.name,
            video: req.body.video,
            username: req.user.username,
            price: req.body.price,
            classification: req.body.classification,
            date: new Date(),
            description: req.body.description
        };
        Theme.findByIdAndUpdate(req.params.id, newvid,
            function(err, updated) {
                if (err) {
                    console.log(err);
                    res.redirect('/home')
                } else {
                    res.redirect('/product/' + req.params.id);
                }
            });
    });

    router.delete('/product/:id', function(req, res) {
        Theme.findByIdAndDelete(req.params.id, function(err) {
            if (err) {
                res.redirect('/home')
            } else {
                res.redirect('/home');
            }
        });
    });

    router.get('/sell', function(req, res) {
        res.render('sell', { user: req.user });
    });

    router.get('/category/:category', function(req, res) {
        var params = url.parse(req.url, true).query;
        keyword = params.s
        category = req.params.category
        if (keyword == null) {
            filter_cate = { classification: category }
        } else filter_cate = {
            name: eval("/" + keyword + "/i"),
            classification: category
                //name: { $regex: title, $Option: "$i" }   
        }
        var x = params.orderby;
        switch (x) {
            case 'price':
                order_cate = { 'price': 1 };
                break;
            case 'price-desc':
                order_cate = { 'price': -1 };
                break;
            case '_id':
                order_cate = { '_id': 1 };
                break;
            case '_id_desc':
                order_cate = { '_id': -1 };
                break;
            case 'name':
                order_cate = { 'name': 1 };
                break;
            case 'date':
                order_home = { 'date': 1 };
                break;
            case 'date_desc':
                order_home = { 'date': -1 };
                break;
            default:
                order_cate = { '_id': 1 };
        }
        Theme.find(filter_cate).sort(order_cate).exec(function(err, classThemes) {
            if (err) {
                console.log(err);
                res.redirect('home')
            } else {
                res.render('category', { user: req.user, videos: classThemes });
            }
        });
    });

    router.post('/category', function(req, res) {
        fs.readFile('./public/category.json', function(err, data) {
            if (err) {
                return console.error(err);
            }
            var cate = data.toString(); //将二进制的数据转换为字符串
            cate = JSON.parse(cate); //将字符串转换为json对象
            cate.categories.push(req.body); //将传来的对象push进数组对象中
            var str = JSON.stringify(cate); //因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
            fs.writeFile('./public/category.json', str, function(err) {
                if (err) {
                    console.error(err);
                }
                console.log('----------新增成功-------------');
            })
        })
        res.redirect('newtheme');
    });
    app.use('/', router)
}