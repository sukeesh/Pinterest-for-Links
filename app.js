const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');
var redis_scanner = require('redis-scanner');

// Create a redis client
let client = redis.createClient();
client.on('connect', function(){
	console.log("Connected to redis");
});

redis_scanner.bindScanners(client);

const port = 3000;
const app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// methodOverride
app.use(methodOverride('_method'));

// Search Page
app.get('/search', function(req, res, next){
	res.render('searchusers');
});

// Search processing
app.post('/user/search', function(req, res, next){
	let id = req.body.id;

	client.hgetall(id, function(err, obj){
		if (!obj){
			res.render('searchusers', {
				error: 'User does not exist'
			});
		}else{
			obj.id = id;
			res.render('details', {
				user: obj
			});
		}
	});
});

// Home page
app.get('/', function(req, res, next){
	client.keys('*', function(err, keys){
		if (err){
			return console.log(err);
		}
		res.render('display', {
			key: keys
		});
	});
});

// Add board page
app.get('/user/add', function(req, res, next){
	res.render('adduser');
});

// Process Add board page
app.post('/user/add', function(req, res, next){
	let id = req.body.id;
	let link1 = req.body.link1;
	let link2 = req.body.link2;
	let link3 = req.body.link3;
	let link4 = req.body.link4;

	client.hmset(id, [
		'link1', link1,
		'link2', link2,
		'link3', link3,
		'link4', link4
	], function(err, reply){
		if (err){
			console.log(err);
		}
		res.redirect('/');
	});
});

// Delete user
app.delete('/user/delete/:id', function(req, res, next){
	client.del(req.params.id);
	res.redirect('/');
});

app.listen(port, function(){
	console.log("Server started in port " + port);
});