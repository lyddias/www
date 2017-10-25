var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var mongoose=require('mongoose');
var User = require('../data/schema');
var router = express.Router();

// 定义局部变量
var jsonArray = [];
var numOfJson = 0;
var errorInfo;
var usernameInRequest;
var state;


router.get('/register',function (req, res) {
	res.render('register', {
		errorInfo:'请输入信息'
	});
});


router.get('/aboutme',function (req, res) {
	if (!req.session.logged_in) {
		res.render('aboutme', {
		state:"login"
	});
	} else {
		res.render('aboutme', {
		state:"logout"
	});
	}
});
router.get('/contact',function (req, res) {
	if (!req.session.logged_in) {
		res.render('contact', {
		state:"login"
	});
	} else {
		res.render('contact', {
		state:"logout"
	});
	}
});
router.get('/signin',function(req, res) {

	if (!req.session.logged_in) {
		res.render('signin', {
			errorInfo:"请输入信息"
		});
	} else {
		// loggedIn(req, res);
	
	req.session.logged_in = 0;
	res.render('index', {
	state:"login"
	});
	}
});


router.get('/',function(req, res) {
	if (!req.session.logged_in) {
		res.render('index', {
		state:"login"
	});
	} else {
		res.render('index', {
		state:"logout"
	});
	}
});

//退出登录
// router.get('/logout', function(req, res) {
// 	req.session.logged_in = 0;
// 	res.render('index', {
// 		state:"login"
// 	});
// });

//登录确认
router.post('/logincheck', urlencodedParser, function (req, res) {
	console.log("check password");
	var testuser = {
		username:req.body.username,
		password:req.body.password,

	};
	var d = getMD5Password(testuser.password);
  	console.log("加密的结果：(验证)"+d);
	testuser.password = d;
	User.find(testuser, function (err, detail) {
		if (detail.length) {
			signinCheckSuccess(detail, req, res);
		} else {
			console.log("wrong!");
			res.render('signin', {
		    errorInfo:"用户名或密码错误"
	});
		}
	});
});

//存储信息
router.post('/datasave', urlencodedParser, function(req, res) {
	console.log("Data from submit form");
	var user = new User({
		username:req.body.username,
		password:req.body.password
	});
	var d = getMD5Password(user.password);
	console.log("加密的结果："+d);
	user.password = d;
	console.log(user);
	var flag = user.username;
	errorInfo = "";
    var password = req.body.password;
	var passwordCheck = req.body.passwordCheck;
	if(password!=passwordCheck){
	res.render('register', {
		    errorInfo:"密码不一致"
	});
	}
	else{
	checkDataRep(user, flag, req, res);
    }
});



function dealWithDataSubmited (user, flag, req, res) {
	if (!(flag)) {
		repreload(res);
	} else {
		req.session.username = user.username;
		req.session.logged_in = 1;
		user.save(function(err) {
			if (err) {
				console.log('保存失败');
				return;
			}
			console.log('保存成功');
		});
		console.log(user.username + " has been added");
		res.render('index',{
			state:"logout"
		});
	}
}

// function findJson(name, res) {
// 	var testUsername = {username:name};
// 	User.find(testUsername,function (err, userDetail) {
// 		if (userDetail.length == 0) {
// 			console.log(userDetail);
// 			res.render('signin', {
// 				errorInfo:'用户名不存在'
// 			});

// 		} else {
// 			console.log(userDetail);
// 			console.log("Load user: " + name);
// 			console.log(userDetail[0]);
// 		}
// 	});
// }
// function Notlogin(req, res) {
// 	if (req.param("username") == undefined) {
// 		console.log("initial page");
// 		res.render('signin', {
// 			errorInfo:'请输入信息'
// 		});
// 	}
// 	 else {
// 		var username = req.param("username").toString();
// 		console.log("find user: " +  username);
		// findJson(username, res);
// 	}
// }
// function loggedIn(req, res) {
// 	if (req.param("username") == undefined) {
// 		findJson(req.session.username, res);
// 	} else {
// 		var username = req.param("username").toString();
// 		console.log(username);
// 		if (username != req.session.username) {
// 			var testUsername = {username:req.session.username};
// 			User.find(testUsername,function (err, userDetail) {
// 			});
// 		} else {
// 			var testUsername = {username:req.session.username};
// 			User.find(testUsername,function (err, userDetail) {
// 				// infoPage(res, userDetail, "用户详情");
// 			});
// 			res.render('index');
// 		}
// 	}
// }
function getMD5Password(content) {
  	var md5 = crypto.createHash('md5');//定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
  	md5.update(content);
  	var d = md5.digest('hex');  //加密后的值d
	return d;
}
function signinCheckSuccess(detail, req, res) {
	var userInDatabase = {
		username:detail[0].username
	};
	console.log("user in database :");
	console.log(userInDatabase);
	req.session.logged_in = 1;
	req.session.username = req.body.username;
	res.render('index', {
		state:"logout"
	});
}

function infoPage(res, userDetail, errorInfoDetail) {
	res.render('info', {
		username:userDetail[0].username,
		errorInfo:errorInfoDetail
	});
}

function showInfo(user, res) {
	res.render('info', {
		username:user.username,
		errorInfo:'用户详情'
	});
}

function checkDataRep(user, flag, req, res) {
	var testUsername = {username:user.username};
	User.find(testUsername, function (err, detail) {
		if (detail.length) {
			flag = 0;
			errorInfo = errorInfo + "用户名已注册\n";
		}
		dealWithDataSubmited(user, flag, req, res);
	});
}

function repreload(res) {
	res.render('register',{
		errorInfo:errorInfo
	});
}
module.exports = router;