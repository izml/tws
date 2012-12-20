# Tieba wap sign for Opera #

**Opera** 版的贴吧 Wap 集体签到工具

## 脚本下载 ##
[TiebaWapSign.js](https://raw.github.com/izml/tws/master/TiebaWapSign.js)

## 主要功能 ##
1. 贴吧 Wap 集体签到
2. 支持多账号并保存签到信息[在本地储存中]
3. 可以自动为未加入的贴吧添加“喜欢”

## 使用方法 ##

###1. 每天签到提示###
该脚本每天会自动提示签到，确定后即可前往 Wap 页面进行签到

###2. 小书签 Bookmarklet：###
1. [贴吧Wap集体签到](javascript:a;)
```javascript
javascript:(function(){tws_wap_sign();})();
```
在贴吧页面运行这个书签可以手动集体签到，也可以在一些贴吧自动签到失败后运行这个书签来继续未完成的签到。

2. [强制加入贴吧并签到](javascript:a;)
```javascript
javascript:(function(){tws_auto_fav=2;tws_wap_sign();})();
```

###3. 脚本中的相关设置：###
```javascript
	tip:		1,		// 开启每日手机签到提示：0=关闭; 1=开启
	auto_sign:	1,		// 打开wapp.baidu.com/*tab=favorite*后自动签到(而不需要显示提示)
	auto_fav:	1,		// 自动为未加入的贴吧添加“喜欢”
		//	说明：0=关闭; 1=已有签到信息的贴吧不会自动添加"喜欢"; 2=强制添加
	delay:		1234,		// 签到延时，毫秒
	retry:		2,		// 签到失败重试次数，0为不重试。
```
每日提示是根据用户名而定，每个账户每天提示一次

## 已知问题 ##
* 短时间内大量签到、加入请求之后，服务器就会返回错误，严重的当天无法继续！(推荐设为1.2秒左右)
* 如果服务器返回大量“系统开小差了，请稍后再试~”，那么这个账号今天就可能无法再使用 Wap 签到了。
