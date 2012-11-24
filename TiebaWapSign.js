// ==UserScript==
// @name	Tieba wap sign for Opera
// @author	izml
// @description	Opera 版贴吧 wap 批量签到
// @version		0.2.0
// @created		2012-11-23
// @lastUpdated	2012-11-23
// @include		http://wapp.baidu.com/f/*
// @include		http://tieba.baidu.com/*
// @exclude		http://wapp.baidu.com/f/*sign?*
// @run-at document-start
// @grant none
// ==/UserScript==

var tws_tip = 1;		// 开启每日手机签到提示：0=关闭; 1=开启
var tws_delay=800;
var tws_storage=window.localStorage;
var tws_let=tws_getState();
window.addEventListener('DOMContentLoaded',tws_show_tip,false);

function tws_getState(){
	var let=tws_storage['tws_let_sign'];
	if(Number(let)==1) return 1;
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
	if(location.href.search(/wapp\.baidu\.com\/f\/.*tab=favorite/)<0){
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
		now=new Date();
		return now.toDateString();
	}
	var bid='';
	switch(location.hostname){
		case 'wapp.baidu.com':
			var xhr=new XMLHttpRequest();
			xhr.onreadystatechange=function(){
				if(xhr.readyState==4){
					var a=xhr.responseXML.getElementsByClassName('s')[0].firstElementChild.firstElementChild;
					if(a.textContent=='>>我的i贴吧'){
						var n=a.href.match(/[?&]un=([^&]+)/)[1];
						bid=decodeURI(n);
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
		var bid=prompt('错误，暂时找不到账号名\n\n或者手动输入一个当前账号名','');
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
	var abc=info[info.cid];
	tws_storage['tws_let_sign']=0;
	if(document.body.textContent.indexOf('对不起,您没有访问权限!')==0) return;
	var tr=document.getElementsByTagName('table')[0].rows;
	var xhrLinks=[],xhrSigns=[];
	abc.tips=1;
	for(var i=0; i<tr.length; i++){
		var td=getCell(tr[i]);
		var a=tr[i].firstElementChild.firstElementChild;
		var exp=abc.list[a.textContent];
		if(typeof exp=='undefined'){
			td.innerHTML='正在获取签到信息。。。';
			var obj={id:i,url:a.href,t:a.textContent,f:xhrLinkChange};
			getXHR(obj, xhrLinks);
		} else if(Number(exp)>0) td.innerHTML='<span class="light">已签到！获得经验值+'+exp+'</span>';
		else td.innerHTML='之前已签到！获得的经验值未知';
	}
	function getCell(tr){
		var td=tr.cells[3];
		if(typeof td!='object')
			td=tr.insertCell(-1);
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
	function getXHR(obj, xhrs){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange = obj.f;
		xhr.open('GET',obj.url,true);
		xhrs.push(new setXHR(obj, xhr));
		xhr.send();
	}
	function xhrLinkChange(){
		for(var i=0; i<xhrLinks.length; i++){
			if(xhrLinks[i].xhr.readyState==4){
				var a = xhrLinks[i].obj;
				var xml = xhrLinks[i].xhr.responseXML;
				var sign=xml.getElementsByClassName('bc')[0].lastChild.lastChild;
				var td=getCell(tr[a.id]);
				xhrLinks.splice(i,1);
				if(typeof sign=='object' && sign!=null){
					switch(sign.textContent){
						case '签到':
							td.innerHTML='正在进行签到。。。';
							var obj={id:a.id,url:sign.lastChild.href,t:a.t,f:xhrSignChange}
							getXHR(obj, xhrSigns);
							break;
						case '已签到':
							abc.list[a.t]=0;
							tws_setInfo(info);
							td.innerHTML='之前已签到！获得的经验值未知';
							break;
						case '喜欢本吧':	// 可能会有问题
							var light=xml.getElementsByClassName('light');
							if(light.length>0){
								var text=light[0].textContent;
								if(text.indexOf('汗，操作未成功')==0){
									setCell(td,'汗，操作未成功,请手动',sign.href,'加喜欢');
									break;
								}
							}
						//	setCell(td,'请手动',sign.href,'加喜欢');
						/*	自动加喜欢过多会出错	*/
							td.innerHTML='正在加为喜欢，稍后自动签到！';
							var obj={id:a.id,url:sign.href,t:a.t,f:a.f};
							window.setTimeout(function(){
								getXHR(obj, xhrLinks);
							},tws_delay);
							tws_delay+=tws_delay;
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
				var xml=xhrSigns[i].xhr.responseXML;
				xhrSigns.splice(i,1);
				var light=xml.getElementsByClassName('light');
				var td=getCell(tr[a.id]);
				var text='';
				if(light.length>0)
					text=light[0].textContent;
				if(text.indexOf('签到成功')<0){
					var sign=xml.getElementsByClassName('bc')[0].lastChild.lastChild;
					if(sign.textContent!='已签到'){
						if(text.indexOf('汗，操作未成功')==0){
							setCell(td,'汗，操作未成功,请手动',sign.lastChild.href,'签到'+text);
							return;
						}
						td.innerHTML='操作失败，正在重新签到！'+text;
						var obj={id:a.id,url:sign.lastChild.href,t:a.t,f:a.f};
						window.setTimeout(function(){
							getXHR(obj, xhrLinks);
						},tws_delay);
					} else {
						td.innerHTML='未知错误，之前已签到！';
						abc.list[a.t]=0;
					}
				} else {
					abc.list[a.t]=Number(light[1].textContent);
					td.innerHTML='<span class="light">'+text+'</span>';
				}
				tws_setInfo(info);
			}
		}
	}
}
