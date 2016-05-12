var fs = require('fs');
var path = require('path');

var wechat = require('wechat');
var ejs = require('ejs');
//var alpha = require('alpha');
var VIEW_DIR = path.join(__dirname, '..', 'views');

var config = require('../config');

var oauth = new wechat.OAuth(config.appid, config.appsecret);

var List = require('wechat').List;
List.add('view', [
  ['没有找到相关API。输入模块名，方法名，事件名等都能获取到相关内容。\n回复{a}可以查看近期的活动', function (info, req, res) {
    res.nowait('暂无活动');
  }]
]);


var callbackTpl = ejs.compile(fs.readFileSync(path.join(VIEW_DIR, 'callback.html'), 'utf-8'));

exports.callback = function (req, res) {
  res.writeHead(200);
  oauth.getAccessToken(req.query.code, function (err, result) {
    res.end(callbackTpl(req.query));
  });
};

exports.reply = wechat(config.mp, wechat.text(function (message, req, res) {
  console.log(message);
  var input = (message.Content || '').trim();

  if (input === '活动') {
    res.reply([{
      title: '来玩吧',
      description: 'PS4线下体验活动',
      picurl: 'http://wechat.gamepoch.com/images/1-2.jpg',
      url: 'http://wechattest.gamepoch.com/users/matchDetail_0502'
    }]);
    return;
  }
/*
  if (input === '大王') {
    return res.reply("不要叫我大王，要叫我女王大人啊……");
  }
  if (input.length < 2) {
    return res.reply('内容太少，请多输入一点:)');
  }
*/
/*
  var data = alpha.search(input);
  var content = '';
  switch (data.status) {
  case 'TOO_MATCHED':
    content = '找到API过多，请精确一点：\n' + data.result.join(', ').substring(0, 100) + '...';
    break;
  case 'MATCHED':
    content = data.result.map(function (item) {
      var replaced = (item.desc || '')
        .replace(/<p>/ig, '').replace(/<\/p>/ig, '')
        .replace(/<code>/ig, '').replace(/<\/code>/ig, '')
        .replace(/<pre>/ig, '').replace(/<\/pre>/ig, '')
        .replace(/<strong>/ig, '').replace(/<\/strong>/ig, '')
        .replace(/<ul>/ig, '').replace(/<\/ul>/ig, '')
        .replace(/<li>/ig, '').replace(/<\/li>/ig, '')
        .replace(/<em>/ig, '').replace(/<\/em>/ig, '')
        .replace(/&#39;/ig, "'");

      return {
        title: item.path,
        description: item.textRaw + ':\n' + replaced,
        picurl: config.domain + '/assets/qrcode.jpg',
        url: config.domain + '/detail?id=' + item.hash
      };
    });
    if (data.more && data.more.length) {
      content.push({
        title: '更多：' + data.more.join(', ').substring(0, 200) + '...',
        description: data.more.join(', ').substring(0, 200) + '...',
        picurl: config.domain + '/assets/qrcode.jpg',
        url: config.domain + '/404'
      });
    }
    break;
  default:
    res.wait('view');
    return;
    break;
  }
  var from = message.FromUserName;
  if (!Array.isArray(content)) {
    if (from === 'oPKu7jgOibOA-De4u8J2RuNKpZRw') {
      content = '主人你好：\n' + content;
    }
    if (from === 'oPKu7jpSY1tD1xoyXtECiM3VXzdU') {
      content = '女王大人:\n' + content;
    }
  }
  console.log(content);
  res.reply(content);
}).image(function (message, req, res) {
  console.log(message);
  res.reply('还没想好图片怎么处理啦。');
}).location(function (message, req, res) {
  console.log(message);
  res.reply('想和我约会吗，不要的啦。');
}).voice(function (message, req, res) {
  console.log(message);
  res.reply('心情不好，不想搭理你。');
}).link(function (message, req, res) {
  console.log(message);
  res.reply('点连接进来的是吧！');
}).event(function (message, req, res) {
  console.log(message);
*/

  if (message.Event === 'subscribe') {
    // 用户关注的时候自动回复的消息
    res.reply('谢谢添加星游纪公共帐号:)\n回复"活动"可以获得最新的PS4相关信息！');
  } else if (message.Event === 'unsubscribe') {
    res.reply('Bye!');
  } else {
    res.reply('暂未支持! Coming soon!');
  }
}));

var tpl = ejs.compile(fs.readFileSync(path.join(VIEW_DIR, 'detail.html'), 'utf-8'));
exports.detail = function (req, res) {
  var id = req.query.id || '';
  var info = "detail";//alpha.access(alpha.getKey(id));
  if (info) {
    res.writeHead(200);
    res.end(tpl(info));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
};

var loginTpl = ejs.compile(fs.readFileSync(path.join(VIEW_DIR, 'login.html'), 'utf-8'));

exports.login = function (req, res) {
  res.writeHead(200);
  var redirect = 'http://wechattest.gamepoch.com/wechat/callback';
  res.end(loginTpl({authorizeURL: oauth.getAuthorizeURL(redirect, 'state', 'snsapi_userinfo')}));
};
