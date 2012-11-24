// ==UserScript==
// @name	Tieba wap sign for Opera
// @author	izml
// @description	Opera 版贴吧 wap 批量签到
// @version		0.1.1.2
// @created		2012-11-23
// @lastUpdated	2012-11-23
// @include		http://wapp.baidu.com/f/*
// @include		http://tieba.baidu.com/*
// @exclude		http://wapp.baidu.com/f/*sign?*
// @run-at document-start
// @grant none
// ==/UserScript==

var tws_tip = 1;		// 开启每日手机签到提示：0=关闭; 1=开启
var tws_storage=window.localStorage;
var tws_let=tws_getState();
tws_show_tip();

function tws_getState(){
	var let=tws_storage['tws_let_sign'];
	if(let=='1') return 1;
	if(window.opener){
		let=Number(window.name);
		if(let==0 || let==1){
			window.name='我喜欢的吧';
			return let;
		}
	}
	return 0;
}

function tws_show_tip(){
	if(tws_let==1){
		tws_wap_sign();
		return;
	}
	var info=tws_getInfo();
	if(tws_tip==1){
		if(info.start==1) return;
		var t=confirm('每日提示，是否开始手机签到：\n　通过修改脚本中的值可以关闭提示！\n\n'
			+'　　确定：进行手机签到(若提示有弹出窗口请单击打开)\n　　取消或Esc键：不进行签到',1);
		info.start=1;
		tws_setInfo(info);
		if(!t) return;
	} else {
		info.start=0;
		tws_setInfo(info);
		return;
	}
	tws_wap_sign();
}

function tws_wap_sign(){
	if(location.href.search(/wapp\.baidu\.com\/f\/.*tab=favorite/)<0){
		var url='http://wapp.baidu.com/f/m?tn=bdFBW&tab=favorite';
		if(location.href.search(/wapp\.baidu\.com\/.*/)>0){
			tws_storage['tws_let_sign']=1;
			window.open(url)
		} else
			window.open('http://wapp.baidu.com/f/m?tn=bdFBW&tab=favorite',1);
		return;
	}
	if(document.readyState=='complete') tws_signStart(tws_getInfo());
	else
		document.addEventListener('DOMContentLoaded',function(){
			tws_signStart(tws_getInfo());
		},false);
}

function tws_getInfo(){
	function getNow(){
		now=new Date();
		return now.toDateString();
	}
	var info={start:0,date:getNow(),list:{}};
	var infos=tws_storage['tws_wap_sign_info'];
	if(typeof infos!='undefined'){
		var infos=JSON.parse(infos);
		if(infos.date==getNow()){
			info=infos;
			if(tws_let==1) info.start=0;
		}
	}
	return info;
}

function tws_setInfo(info){
	window.localStorage['tws_wap_sign_info']=JSON.stringify(info);
}

function tws_signStart(info){
	tws_storage['tws_let_sign']=0;
	if(document.body.textContent.indexOf('对不起,您没有访问权限!')==0) return;
	var tr=document.getElementsByTagName('table')[0].rows;
	var xhrLinks=[],xhrSigns=[];
	info.start=1;
	for(var i=0; i<tr.length; i++){
		if(typeof tr[i].cells[3]=='object')
			return;
		var td=tr[i].insertCell(-1);
		var a=tr[i].firstElementChild.firstElementChild;
		var exp=info.list[a.textContent];
		if(typeof exp=='undefined'){
			td.innerHTML='正在获取签到信息。。。';
			var obj={id:i,url:a.href,t:a.textContent,f:xhrLinkChange};
			xhrGet(obj, xhrLinks);
		} else if(exp>0) td.innerHTML='<span class="light">已签到！获得经验值+'+exp+'</span>';
		else td.innerHTML='之前已签到！获得的经验值未知';
	}
	function xhrSet(obj, xhr){
		this.obj = obj;
		this.xhr = xhr;
	}
	function xhrGet(obj, xhrs){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange = obj.f;
		xhr.open("GET",obj.url,false);
		xhrs.push(new xhrSet(obj, xhr));
		xhr.send();
	}
	function xhrLinkChange(){
		for(var i=0; i<xhrLinks.length; i++){
			if(xhrLinks[i].xhr.readyState==4){
				var obj = xhrLinks[i].obj;
				var div=document.createElement('div');
				var sign=xhrLinks[i].xhr.responseXML.getElementsByTagName('table')[0].lastChild.firstChild;
				var td=tr[obj.id].cells[3];
				if(sign.textContent=='签到'){
					td.innerHTML='正在进行签到。。。';
					obj.url=sign.href;
					obj.f=xhrSignChange;
					xhrGet(obj, xhrSigns);
				}else if(sign.textContent=='已签到'){
					info.list[obj.t]=0;
					tws_setInfo(info);
					td.innerHTML='之前已签到！获得的经验值未知';
				} else td.innerHTML='未知错误！请<a href='+sign.href+'>手动签到</a>';
				xhrLinks.splice(i,1);
			}
		}
	}
	function xhrSignChange(){
		for(var i=0; i<xhrSigns.length; i++){
			if(xhrSigns[i].xhr.readyState==4){
				var obj=xhrSigns[i].obj;
				var xml=xhrSigns[i].xhr.responseXML;
				var text=xml.getElementsByClassName('light');
				if(text[0].textContent.indexOf('签到成功')<0){
					text='未知错误！之前已签到！';
					if(xml.getElementsByTagName('table')[0].lastChild.textContent!='已签到')
						text='签到失败，请<a href='+obj.url+'>手动签到</a>';
					else info.list[obj.t]=0;
				} else {
					info.list[obj.t]=Number(text[1].textContent);
					text='<span class="light">'+text[0].textContent+'</span>';
				}
				tws_setInfo(info);
				tr[obj.id].cells[3].innerHTML=text;
				xhrSigns.splice(i,1);
			}
		}
	}
}
