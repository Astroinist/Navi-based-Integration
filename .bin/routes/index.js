
/*
 * GET home page.
 */

exports.index = function(req, res){
  	res.render('index', { title: 'WebSocket' ,appUrl:req.host+':'+req.app.get('port')});
};