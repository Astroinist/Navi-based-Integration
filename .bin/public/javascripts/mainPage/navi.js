var MainNavi = {};

$.extend(MainNavi,{
	//开启和停止拖拽
	invokeDrag : function() {
		$('#main-nav').dragsort({dragSelector: 'li.navigator', dragEnd: function() { }, 
			dragBetween: true});
	},
	stopDrag : function() {
		$('#main-nav').dragsort('destroy');
	},

	beginEdit:function(me){
		if(me){
			me.addClass('select');
			me.text('完成');
		}
		$('#main-nav .delete').show();
		$('#hidden-menu-box .add').show();
		this.invokeDrag();
	},

	endEdit:function(me){
		if(me){
			me.removeClass('select');
			me.text('自定义');
		}
		$('#main-nav .delete').hide();
		$('#hidden-menu-box .add').hide();
		this.stopDrag();
	},

	init:function(){
		var h = $('#hidden-menu-box').height(),
			THIS = this;
		$('#display-menu-nav').delegate('#config-menu','click',function(){
			var style = $('#hidden-menu-box').css('display');
			if (style === 'none') {
				var offset = $('#display-menu-nav').offset();
				$('#hidden-menu-box').css('top', +(offset.top - h + 5)+'px');
				$('#hidden-menu-box').show();
			}
			else {
				$('#hidden-menu-box').hide();
				THIS.endEdit();
			}
		});
		$('#hidden-menu-box').delegate('.header .close', 'click', function() {
			$('#hidden-menu-box').hide();
			THIS.endEdit();
		});
		$('#hidden-menu-box').delegate('.header .setting', 'click', function() {
			var me = $(this);
			if (me.hasClass('select')) {
				THIS.endEdit(me);
				//To do ......
				//点击完成后需要把当前导航的按钮对象和顺序回传到后台
			}
			else {
				THIS.beginEdit(me);
			}
		});

		$('#hidden-menu-box').delegate('.add', 'click', function() {
			var me = $(this);
			var e = me.parent().clone(true);
			var id = me.parent().data('id');
			
			if ($('#main-nav li[data-id="'+id+'"]').length === 0) {
				e.find('.add').removeClass('add').addClass('delete');
				e.prepend('<span class="split left navi-icon"></span>');
				e.append('<span class="split right navi-icon"></span>');
				e.addClass('navigator');
				$('#main-nav').append(e);
			}
			else {
				alert('该按钮已经添加!');
			}
		});
		$('#display-menu-nav').delegate('#main-nav .navigator .delete', 'click', function() {
			var me = $(this);
			me.parent().remove();
		});

		$('#display-menu-nav').delegate('#main-nav #home','click',function(){
			System.Integration.unload('m2');
			$('#main-nav li').removeClass('select');
			$(this).addClass('select');
		});
		System.Integration.addListener('afterNavigate',function(evt){
			$('#main-nav li').removeClass('select');
			var op = evt.option,
				id = op.id;
			$('#main-nav li[data-id ='+id+']').addClass('select');
		});
	}
});

MainNavi.init();