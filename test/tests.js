var Backbone = require("Backbone"),
	connect = require("connect"),
	color = require("colors"),
	connect_backbone_router = require("./../"),
	
	request = require("request");

var port = 8080;

var app = connect();

var collections = {
	hitchhikers: new Backbone.Collection([
		new Backbone.Model({
			id: 0,
			name: "Zaphod"
		})
	])
};

app.use(connect.logger());
app.use(connect.bodyParser());

app.use(connect_backbone_router({
	debug: true,
	path: "/data",
	collections: collections
}));

app.use(function(req,res,next) {
	res.end("That's all folks!");
});

var server = app.listen(port);

console.log("\nListening on port ".green + String(port).red);

var url = "http://localhost:" + port + "/data/hitchhikers";

asyncTest("Fetching Collection Data", 3, function() {
	console.log("Fetching Collection Data");
	stop();
	request.get(url + "", function(err, resp, body) {
		var data = JSON.parse(body);
		deepEqual(data, collections.hitchhikers.toJSON(), "Returned JSON same as collection");
		start();
	});

	request.get(url + "/0", function(err, resp, body) {
		var data = JSON.parse(body);
		deepEqual(data, collections.hitchhikers.get(0).toJSON(), "Returned JSON same as model");
		start();
	});

	request.get(url + "/0/name", function(err, resp, body) {
		var data = JSON.parse(body);
		equal(data, collections.hitchhikers.get(0).get("name"), "Returned String(name) same as models");
		start();
	});
});

asyncTest("Updating Existing Model", 1, function() {
	console.log("Updating Existing Model");
	request({
		method: "put",
		url: url + "/1",
		json: {
			drink: "Gangalactic Gargleblaster"
		}
	}, function(err, resp, body) {
		deepEqual(body, collections.hitchhikers.get(1).toJSON(), "Returned model matches updated model");
		start();
	});
});

asyncTest("Creating New Model", 1, function() {
	console.log("Creating New Model");
	var data = {
		id: 1,
		name: "Ford"
	};

	request({
		method: "post",
		url: url + "",
		json: data
	}, function(err, resp, body) {
		deepEqual(body, collections.hitchhikers.toJSON(), "Returned data from POST same as in collection");
		start();
	});
});

asyncTest("Delete Model", 1, function() {
	request({
		method: "delete",
		url: url + "/0"
	}, function(err, rest, body) {
		deepEqual(JSON.parse(body), collections.hitchhikers.toJSON(), "Returned data matches collection");
		start();
	});
});

QUnit.done(function() {
	server.close();
});
