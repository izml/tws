// ==UserScript==
// @name		Tieba wap sign for Opera
// @author		izml
// @description	Opera 版贴吧 Wap 批量签到
// @version		0.2.1.1
// @created		2012-11-23
// @lastUpdated	2012-11-27
// @namespace	https://github.com/izml/
// @homepage	https://github.com/izml/tws
// @downloadURL	https://raw.github.com/izml/tws/master/TiebaWapSign.js
// @updateURL	https://raw.github.com/izml/tws/master/TiebaWapSign.meta.js
// @run-at	document-start
// @grant	none
// @include		http://wapp.baidu.com/*
// @include		http://tieba.baidu.com/*
// ==/UserScript==

var tws_tip = 1;		// 开启每日手机签到提示：0=关闭; 1=开启
var tws_auto_fav=1;		// 自动为未加入的贴吧添加“喜欢”
	//	说明：0=关闭; 1=已有签到信息的贴吧不会自动添加"喜欢"; 2=强制添加
var tws_delay=1200;		// 签到延时，毫秒
var tws_retry=1;		// 签到失败重试次数，0为不重试。
var tws_storage=window.localStorage;
var tws_let=tws_getState();
window.addEventListener('DOMContentLoaded',tws_show_tip,false);

function tws_getState(){
	if(location.hostname!='wapp.baidu.com') return 0;
	var lets=tws_storage['tws_let_sign'];
	if(Number(lets)==1) return 1;
	if(window.opener){
		lets=Number(window.name);
		if(lets==0 || lets==1){
			window.name='我喜欢的吧';
			return lets;
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
	var abc=info[info.cid];
	if(tws_tip==1){
		if(abc.tips==1) return;
		var t=confirm('每日提示，是否开始手机签到：\n　通过修改脚本中的值可以关闭提示！\n\n'
			+'　　确定：进行手机签到(若提示有弹出窗口请单击打开)\n　　取消或Esc键：不进行签到',1);
		abc.tips=1;
		tws_setInfo(info);
		if(!t) return;
	} else {
		abc.tips=0;
		tws_setInfo(info);
		return;
	}
	tws_wap_sign();
}

function tws_wap_sign(){
	if(location.href.search(/wapp\.baidu\.com\/.+tab=favorite/)<0){
		var url='http://wapp.baidu.com/f/m?tn=bdFBW&tab=favorite';
		if(location.hostname=='wapp.baidu.com'){
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
		var now=new Date();
		return now.toDateString();
	}
	var bid='';
	switch(location.hostname){
		case 'wapp.baidu.com':
			var xhr=new XMLHttpRequest();
			xhr.onreadystatechange=function(){
				if(xhr.readyState==4){
					var b=xhr.responseXML.lastChild;
					var a=b.getElementsByTagName('a');
					for(var i=0;i<a.length;i++){
						var u=a[i].href;
						if(/[?&]un=/.test(u)){
							n=u.match(/[?&]un=([^&]+)/)[1];
							bid=decodeURI(n);
							break;
						}
					}
				}
			}
			xhr.open('GET','http://wapp.baidu.com/',false);
			xhr.send();
			break;
		case 'tieba.baidu.com':
			var ss=document.getElementsByTagName('script');
			var url=ss[ss.length-1].innerHTML.match(/var url\s*=\s*\'([^\']+)/);
			if(url==null){
				bid=PageData.user.name;
			} else {
				var xhr=new XMLHttpRequest();
				xhr.onreadystatechange=function(){
					if(xhr.readyState==4){
						var u=JSON.parse(xhr.responseText);
						bid=u.user.name;
					}
				}
				xhr.open('GET',url[1],false);
				xhr.send();
			}
			break;
		default:break;
	}
	if(bid==''){
		var bid=prompt('错误，暂时找不到账号名\n\n或者手动输入名称','');
	}
	var info={cid:bid};
	info[bid]={tips:0,date:getNow(),list:{}}
	var infos=tws_storage['tws_wap_sign_info'];
	if(typeof infos!='undefined'){
		var infos=JSON.parse(infos);
		if(typeof infos[bid]!='undefined' && infos[bid].date==getNow()){
			if(tws_let==1) infos[bid].tips=0;
		} else {
			infos[bid]=info[bid];
		}
		infos.cid=bid;
	} else infos=info;
	tws_setInfo(infos);
	return infos;
}

function tws_setInfo(info){
	window.localStorage['tws_wap_sign_info']=JSON.stringify(info);
}

function tws_signStart(info){
	var tws_delay_x=tws_delay;
	var abc=info[info.cid];
	tws_storage['tws_let_sign']=0;
	if(document.body.textContent.indexOf('对不起,您没有访问权限!')==0) return;
	var tr=document.getElementsByTagName('table')[0].rows;
	var xhrLinks=[],xhrSigns=[],xhrFavs=[];
	abc.tips=1;
	for(var i=0; i<tr.length; i++){
		var td=getCell(i,3);
		var a=tr[i].firstElementChild.firstElementChild;
		var exp=abc.list[a.textContent];
		if(typeof exp=='undefined' || tws_auto_fav==2){
			td.innerHTML='正在获取当前贴吧相关信息。。。';
			var obj={id:i,url:a.href,t:a.textContent,f:xhrLinkChange};
			getXHR(obj, xhrLinks, 0);
		} else if(Number(exp)>0) td.innerHTML='<span class="light">已签到！经验值+'+exp+'</span>';
		else td.innerHTML='之前已签到！获得的经验值未知';
	}
	function getCell(i,j){
		var td=tr[i].cells[j];
		if(typeof td!='object')
			td=tr[i].insertCell(-1);
		return td;
	}
	function setCell(td,s,url,t){
		var a=document.createElement('a');
		a.href=url;
		a.innerHTML=t;
		td.innerHTML=s;
		td.appendChild(a);
	}
	function setXHR(obj, xhr){
		this.obj = obj;
		this.xhr = xhr;
	}
	function getXHR(obj, xhrs, delay){
		if(delay>0){
			setTimeout(function(){getXHR_nd(obj, xhrs, delay);},tws_delay_x);
			tws_delay_x+=tws_delay;
		} else getXHR_nd(obj, xhrs);
	}
	function getXHR_nd(obj, xhrs){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange = obj.f;
		xhr.open('GET',obj.url,false);
		xhrs.push(new setXHR(obj, xhr));
		xhr.send();
	}
	function xhrLinkChange(){
		for(var i=0; i<xhrLinks.length; i++){
			if(xhrLinks[i].xhr.readyState==4){
				var a = xhrLinks[i].obj;
				var exp=abc.list[a.t];
				var td=getCell(a.id,3);
				var xml = xhrLinks[i].xhr.responseXML;
				xhrLinks.splice(i,1);
				var sign=xml.getElementsByClassName('bc')[0].lastChild.lastChild;
				if(typeof sign=='object' && sign!=null){
					switch(sign.textContent){
						case '签到':
							td.innerHTML='正在进行签到。。。';
							var obj={id:a.id,url:sign.lastChild.href,t:a.t,f:xhrSignChange,r:tws_retry}
							getXHR(obj, xhrSigns, 1);
							break;
						case '已签到':
							if(exp>0){
								td.innerHTML='<span class="light">已签到！经验值+'+exp+'</span>';
								break;
							}
							abc.list[a.t]=0;
							tws_setInfo(info);
							td.innerHTML='之前已签到！获得的经验值未知';
							break;
						case '喜欢本吧':	// 可能会有问题
							if(exp){
								td.innerHTML='已签到，获得经验值'
								if(exp>0) td.innerHTML+='+'+exp;
								else td.innerHTML+='未知';
							} else {
								td.innerHTML='正在签到。'
								var url=sign.href.replace(/favolike\?uid=\d+\&itb_/,'sign?');
								var obj={id:a.id,url:url,t:a.t,f:xhrSignChange,r:tws_retry};
								getXHR(obj, xhrSigns, 1);
							}
							if(tws_auto_fav<1) break;
						//	setCell(td,'请手动',sign.href,'加喜欢');
						/*	自动加喜欢过多会出错	*/
							td.previousSibling.innerHTML='正在加为喜欢！';
							var obj2={id:a.id,url:sign.href,t:a.t,f:xhrFavChange};
							getXHR(obj2, xhrFavs, 1);
						/**/
							break;
						default:
							td.innerHTML='未知错误！请手动签到';
					}
				} else {
					td.innerHTML='错误，可能不支持签到！';
				}
			}
		}
	}
	function xhrSignChange(){
		for(var i=0; i<xhrSigns.length; i++){
			if(xhrSigns[i].xhr.readyState==4){
				var a=xhrSigns[i].obj;
				var exp=abc.list[a.t];
				var td=getCell(a.id,3);
				if(exp){
					if(exp>0){
						td.innerHTML='<span class="light">已签到！经验值+'+exp+'</span>';
					} else td.innerHTML='之前已签到！经验值未知';
					return;
				}
				var xml=xhrSigns[i].xhr.responseXML;
				tws_delay_x-=tws_delay;
				xhrSigns.splice(i,1);
				var light=xml.getElementsByClassName('light');
				var text='';
				if(light.length>0)
					text=light[0].textContent;
				if(text.indexOf('签到成功')<0){
					var sign=xml.getElementsByClassName('bc')[0].lastChild.lastChild;
					switch(sign.textContent){
						case '签到':
							a.r--;
							if(a.r>0){
							td.innerHTML='签到失败，正在重新签到！。。。'+text;
							var obj={id:a.id,url:sign.lastChild.href,t:a.t,f:xhrSignChange,r:a.r};
							getXHR(obj, xhrSigns, 1);
							} else {
								setCell(td,'汗，'+(tws_retry+1)+'次签到失败，或者试试',a.url,'手动签到');
							}
							break;
						case '已签到':
							abc.list[a.t]=0;
							tws_setInfo(info);
							td.innerHTML='之前已签到！获得的经验值未知';
							break;
						case '喜欢本吧':
							setCell(td,'未加入本吧，无法判断签到状态，或者试试',a.url,'手动签到');
							setCell(td.previousSibling,'请手动',sign.href,'加喜欢');
							break;
						default:
							td.innerHTML='未知错误！请尝试手动签到';
					}
				} else {
					abc.list[a.t]=Number(light[1].textContent);
					td.innerHTML='<span class="light">'+text+'</span>';
				}
				tws_setInfo(info);
			}
		}
	}
	function xhrFavChange(){
		for(var i=0; i<xhrFavs.length; i++){
			if(xhrFavs[i].xhr.readyState==4){
				var a=xhrFavs[i].obj;
				var exp=abc.list[a.t]
				var td=getCell(a.id,2);
				var xml=xhrFavs[i].xhr.responseXML;
				tws_delay_x-=tws_delay;
				xhrFavs.splice(i,1);
				var light=xml.getElementsByClassName('light');
				var sign=xml.getElementsByClassName('bc')[0].lastChild.lastChild;
				var text='';
				if(light.length>0)
					text=light[0].textContent;
				if(text.indexOf('恭喜你成为')<0){
					if(sign.textContent.indexOf('签到')>=0){
						td.innerHTML='已加入本吧！';
					} else {
						td.innerHTML='加入失败！信息：'+text;
					}
				} else {
					td.innerHTML='<span class="light">'+text+'</span>';
				}
				try{
					var t=sign.previousSibling.lastChild.textContent;
					if(/\(等级\d+\)/.test(t))
						td.previousSibling.innerHTML=t;
				} catch(e){
					console.log('等级获取失败：\n'+sign.parentNode.innerHTML);
				}
			}
		}
	}
}
