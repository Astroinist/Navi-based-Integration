Index={
	homBoxMargin:10 * 2,
	top_bottom_margin:10,
	left_right_box_width:320 * 2,
	left_right_box_margin:10 * 2,
	resize:function(){
		$('#home-box').css('height', ($('#mainCenter').height() -Index.homBoxMargin) + 'px');
		$('#home-box .clearfix').css('height',($('#home-box').height() - Index.top_bottom_margin)/2 +'px');
		$('#top-center,#bottom-center').css('width',($('#home-box .clearfix').width() - Index.left_right_box_width - Index.left_right_box_margin)+'px')
	}
};
$(function(){
	Index.resize();
	$(window).resize(Index.resize);
	System.Integration.load(
				{
					id:'MainNavi',
					url:'/navi',
					container:'mainBottom',
					namespace:'MainNavi',
					type:'app',
					target:'inner',
					method:'POST'
				});
});