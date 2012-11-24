# Tieba wap sign for Opera #

**Opera** 版的贴吧 Wap 集体签到工具

## 脚本下载 ##
[TiebaWapSign.js](https://raw.github.com/izml/tws/master/TiebaWapSign.js)

## 主要功能 ##
1. 贴吧 Wap 集体签到
2. 支持多账号并保存签到信息[在本地储存中]
3. 自动为未加入的贴吧添加“喜欢”

## 使用方法 ##
###1. 每天签到提示###
该脚本每天会自动提示签到，确定后即可前往 Wap 页面进行签到
###2. 小书签 Bookmarklet：###
[贴吧Wap集体签到](javascript:(function(\){tws_wap_sign(\);}\)(\);)
```javascript
javascript:(function(){tws_wap_sign();})();
```
在贴吧页面运行这个书签可以手动集体签到，也可以在一些贴吧自动签到失败后运行这个书签来继续未完成的签到。
###3. 脚本中的相关设置：###
```javascript
var tws_tip = 1;		// 开启每日手机签到提示：0=关闭; 1=开启
var tws_auto_fav=1;		// 自动为未加入的贴吧添加“喜欢”
var tws_delay=800;		// 意外延时，毫秒
```
每日提示是根据用户名而定，每个账户每天提示一次

## 已知问题 ##
* 添加大量“喜欢”之后，服务器就会返回错误，无法继续！