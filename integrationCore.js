(function(){
	if(!window.System){
		window.System = {};
	}
	if(!window.System.Integration){
		window.System.Integration ={
			 events : ["afterNavigate","afterUnLoad"]
		};

		$.extend(true,window.System.Integration,{

			/**
			* 加载ID序列
			**/
			loaderIds:[],
			/**
			* JS命名空间队列
			* type = map
			**/
			namespaceQueue : {},
			/**
			* 加载html队列
			* type = map
			**/
			loadedHtml :{},

			/**
			* 容纳Html片段的临时容器名
			**/
			htmlTmpContainer:'htmlTmpLoader',

			/**
			* 事件冒泡root对象选择器
			* @private
			**/
			evtRootSel:'body',

			/**
			* 打开的新窗口
			* type = map
			**/
			winsQueue:{},
			/**
			* 加载队列
			* type = map
			**/
			loadQueue:{},

			unloadAll:function(excludes){
				var exclude = $.isArray(excludes)?excludes:[excludes];
				for(var i=0;i < this.loaderIds.length;i++){
					var keep = false;
					for(var exi=0;exi < exclude.length;exi++){
						if(this.loaderIds[i]==exclude[exi]){
							keep = true;
							break;
						}
					}
					if(!keep){
						this.unload(this.loaderIds[i]);
						delete this.loaderIds[i];
						this.loaderIds.splice(i,1);
					}
				}
			},

			/**
			* 卸载加载的内容/关闭窗口
			**/
			unload:function(id){
				var target = false;
				if(this.loadQueue.App&&this.loadQueue.App[id]){
					this.release(this.loadQueue.App[id]);
					return ;
				}

				if(this.loadQueue.Win&&this.loadQueue.Win[id]){
					var wintar = this.loadQueue.Win[id];
					this.closeWindow(wintar);
					wintar = null;
					return ;
				}
				if(this.loadQueue.Data&&this.loadQueue.Data[id]){
					var loadObj = this.loadQueue.Data[id];
					if(typeof loadObj.container == 'object' && typeof loadObj.container.remove == 'function'){
						loadObj.container.remove.call(loadObj.container,loadObj);
						
						this.loadQueue.Data[releaseObj.id] = null;
						delete this.loadQueue.Data[releaseObj.id];
						loadObj = null;
					}
					this.fireEvent('afterUnLoad',{type:'Data',id:id});
					return ;
				}
			},

			closeWindow:function(releaseObj){
				var win = releaseObj.opener;
				if(win && win.close){
					win.close();
				}
				this.winsQueue[releaseObj.id] = null;
				delete this.winsQueue[releaseObj.id];
				win = null;

				this.loadQueue.Win[releaseObj.id] = null;
				delete this.loadQueue.Win[releaseObj.id];
				this.fireEvent('afterUnLoad',{type:'Win',id:releaseObj.id});
				delete releaseObj;
			},

			/**
			*	释放加载过的内容
			* 释放内容：【loadQueue，loadedHtml，namespaceQueue】
			* @releaseObj == loadObj.id
			**/
			release:function(releaseObj){
				if(releaseObj){
					if(typeof releaseObj.container == "string"){
						var containerId = releaseObj.container;
						$('#'+containerId).empty();
					}
					else if(typeof releaseObj.container == 'object' && typeof releaseObj.container.remove == 'function'){
						releaseObj.container.remove.call(releaseObj.container,releaseObj);
					}
					var nameSpace = releaseObj.namespace,
						nameSpaceHolder = this.loadedHtml[nameSpace];
					for(var ni = 0;ni < nameSpaceHolder.length;ni++){
						if(nameSpaceHolder[ni].id === releaseObj.id){
							nameSpaceHolder.splice(ni,1);
						}
					}
					if(nameSpaceHolder.length <= 0){
						//移除对应的htmlLoader
						this.loadedHtml[nameSpace] = null;
						delete this.loadedHtml[nameSpace];

						//Unload javaScript
						window[nameSpace] = null;
						delete window[nameSpace];
						
						this.namespaceQueue[nameSpace] = false;
					}
					this.loadQueue.App[releaseObj.id] = null;
					delete this.loadQueue.App[releaseObj.id];
					this.fireEvent('afterUnLoad',{type:'App',id:releaseObj.id});
				}
			},

			/**
			* 加载
			* @loadObj = {
						id:<identification>
			*			url:<string>,
						param:<object>,
						container:<string/Component>,
						namespace:<string>,
						type:<enum>[app,data],
						target:<enum>[newWin,inner]
			*		}
			**/
			load:function(loadobj){
				if(!loadobj)
					return "ERROR Empty Param";
				if(loadobj.target && loadobj.target === "newWin"){
					this.openNewWin(loadobj);
				}else{
					if(loadobj.type && loadobj.type === "data"){
						this.loadData(loadobj);
					}else{
						this.loadApp(loadobj);
					}
				}
			},

			regestLoader:function(type,loadObj){
				var me = this,
					exist = false;
				for(var i = 0 ; i < me.loaderIds.length; i++){
					if(me.loaderIds[i] === loadObj.id){
						exist = true;
						break;
					}
				}
				if(type === "newWin"){
					this.winsQueue[loadObj.id] = loadObj;
					if(!this.loadQueue.Win){
						this.loadQueue.Win = {};
					}
					this.loadQueue.Win[loadObj.id] = loadObj;
				}
				else if(type === "Data"){
					if(!me.loadQueue.Data){
						me.loadQueue.Data = {};
					}
					me.loadQueue.Data[loadObj.id] = loadObj;
				}else{
					me.namespaceQueue[loadObj.namespace] = true;
					if(!me.loadedHtml[loadObj.namespace])
						me.loadedHtml[loadObj.namespace] = [];
					me.loadedHtml[loadObj.namespace].push(loadObj);
					if(!me.loadQueue.App){
						me.loadQueue.App = {};
					}
					me.loadQueue.App[loadObj.id]=(loadObj);
				}
				exist||me.loaderIds.push(loadObj.id);
				me = null;
			},

			openNewWin:function(loadObj){
				var params = (loadObj.param && typeof loadObj.param == 'function')?loadObj.param():loadObj.param;
				if(loadObj&&loadObj.url && typeof loadObj.url == "string"){
					var url = loadObj.url;
					url += '?' + params;
					var opener = window.open(url, '_blank', '', 'false');
					loadObj['opener'] = opener;
					this.regestLoader('newWin',loadObj);
					this.fireEvent('afterNavigate',loadObj);
				}else{
					return "ERROR URL";
				}
			},

			/**
			* @loadObj = {
			*			url:<string>,
						param:<object>,
						container:<string/Component>,
						namespace:<string>,
						id:<identification>
			*		}
			**/
			loadApp:function(loadObj){
				if(loadObj&&loadObj.url && typeof loadObj.url == "string"){
					var url = loadObj.url;
					if ($('body').children('#' + this.htmlTmpContainer).length === 0) {
						$('body').append('<div id="'+this.htmlTmpContainer+'" style="display:none;"></div>');
					}

					var params = (loadObj.param && typeof loadObj.param == 'function')?loadObj.param():loadObj.param;
					var me = this;
					$('#'+this.htmlTmpContainer).load(url,params,function(res,stat,req){
						if(loadObj.container){
							var loadderObj = $('#'+me.htmlTmpContainer);
							if(typeof loadObj.container == "string"){
								var containerId = loadObj.container;
								$('#'+containerId).html(loadderObj.html());
								loadderObj.empty();
							}
							else if(typeof loadObj.container == 'object' && typeof loadObj.container.add == 'function'){
								loadObj.container.add.call(loadObj.container,loadderObj.html(),loadObj);
								loadderObj.empty();
							}
							else{
								return "Error Container";
							}
							me.regestLoader('App',loadObj);
							me.fireEvent('afterNavigate',loadObj);
						}
						me = null;
					});
				}
				else{
					return "Error URL";
				}
			},

			loadData:function(loadObj){
				if(loadObj&&loadObj.url && typeof loadObj.url == "string"){
					var url = loadObj.url;
					var params = (loadObj.param && typeof loadObj.param == 'function')?loadObj.param():loadObj.param;
					var me = this;
					$.ajax({
						url:url,
						data:params,
						type:loadObj.method?loadObj.method:'GET',
						dataType:'json',
						success: function(data, textStatus, jqXHR) {
							if(typeof loadObj.container == 'object' && typeof loadObj.container.add == 'function'){
								loadObj.container.add.call(loadObj.container,data,loadObj);
								loadObj['resData'] = data;

								me.regestLoader('Data',loadObj);
								me.fireEvent('afterNavigate',loadObj);
							}
							me = null;
						}
					});
				}
			},

			fireEvent:function(evtName,paramObj){
				var fireKey = false;
				for(var i=0; i < this.events.length ; i++){
					if(this.events[i] === evtName){
						fireKey = true;
						break;
					}
				}
				if(fireKey){
					var event = jQuery.Event(evtName);
					event.option = paramObj;
					$(this.evtRootSel).trigger(event);
				}
			},

			addListener:function(evtName,callback,scope){
				var fireKey = false;
				for(var i=0; i < this.events.length ; i++){
					if(this.events[i] === evtName){
						fireKey = true;
						break;
					}
				}
				if(fireKey){
					$(this.evtRootSel).on(evtName,$.proxy(callback,scope));
				}
			},

			winMonitor:function(){
				for(var key in this.winsQueue){
					if(!this.winsQueue[key].opener || this.winsQueue[key].opener === window || this.winsQueue[key].opener.closed){
						this.closeWindow(this.winsQueue[key]);
					}
				}
			}
		});
		/**
		* 自动产生一个导航核心实例
		**/
		// window.System.Integration.instance = new window.System.Integration();

		$(function(){
			$('body').delegate('.navigator', 'click', navigate);
			// window.onfocus = System.Integration.winMonitor;
			//添加监听
			// callback = typeof callback == 'function'?callback:window[callback];
			// window.System.Integration.addListener('afterNavigate',function(evt){
			// 	console.info(evt.option);
			// },this);
		});
		/**
		* 导航默认实现
		* 组装@loadObj = {
					id:<identification>
		*			url:<string>,
					param:<object>,
					container:<string/Component>,
					namespace:<string>,
					type:<enum>[app,data],
					target:<enum>[newWin,inner]，
					method:<enum>[POST,GET]
		*		}
		**/
		var navigate = function(e,option){
			var me = $(this);
			if(me.hasClass('select'))
				return false;
			var type = null,
			url = null,
			param = null,
			container = null,
			id = null,
			method = null,
			target = null,
			namespace = null,
			callback = null;
			if(me){
				type = me.data('type'),
				url = me.data('url'),
				param = me.data('param'),
				container = me.data('container'),
				id = me.data('id'),
				method = me.data('method'),
				target = me.data('target'),
				namespace = me.data('namespace'),
				callback = me.data('callback');
			}
			else if(option){
				type = option['type'],
				url = option['url'],
				param = option['param'],
				container = option['container'],
				id = option['id'],
				method = option['method'],
				target = option['target'],
				namespace = option['namespace'],
				callback = option['callback'];
			}
			else return false;

			var loadObj = {
					id:id,
					url:url,
					param:param,
					container:container,
					namespace:namespace,
					type:type,
					target:target,
					method:method
				};

			window.System.Integration.load(loadObj);
		}
	}else{
		return;
	}
})();