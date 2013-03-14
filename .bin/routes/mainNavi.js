exports.mainNavi = function(rq,res){
    var menus =[];
	var o2 = {};
        o2["id"]= "m2";
        o2["name"]= "新启";
        o2["class"] ="new";
        o2["url"] ="/loadScript";
        o2["contianer"] ="contents";
        o2["target"] ="newWin";

    var o1 = {};
    	o1['id'] = "m1";
    	o1['name'] = '浏览';
    	o1['url'] = '/loadScript';
    	o1['contianer'] = "top-left";
    	o1['target'] = 'inner';
    menus.push(o1,o2);
    for(var i = 0; i< 4;i++){
        var clone = {};
        clone['id'] = "m1"+i;
        clone['name'] = '浏览';
        clone['url'] = '/loadScript';
        clone['contianer'] = "top-left";
        clone['target'] = 'inner';
        menus.push(clone);
    }
	res.render('mainNavi',{menus:menus,externalLinks:[]});
};