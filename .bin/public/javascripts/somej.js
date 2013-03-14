var Test = {};
Test.loadafter = function loadAfter(){
	window.onunload = function(){
		var ie = document.all?true:false;
		if(ie){
			var n = window.event.screenX - window.screenLeft;
			var b = n > document.documentElement.scrollWidth - 20;
			if(b && window.event.clientY < 0 || window.event.altKey){
				opener.System.Integration.unload('m2');
			}
			else{
				alert('刷新');
			}
		}
		else{
			if(document.documentElement.scrollWidth!=0){
				opener.System.Integration.unload('m2');
			}else{
				alert('刷新')
			}
		}
	};
	// opener.System.Integration.unload('m2');
}

Test.loadafter();