var Backbone = require("backbone"),
	connect = require("connect"),
	connect_backbone_router = require("./../"),
	
	request = require("request"),
	
	tap = require("tap"),
	test = tap.test;

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

var SpaceCouriers = Backbone.Collection.extend({
	name: "couriers"
});

var otherCollections = [
	new SpaceCouriers([{
		id: 0,
		name: "Fry"
	}, {
		id: 1,
		name: "Zoidburg"
	}])
];

app.use(connect_backbone_router({
	debug: true,
	path: "/data/c",
	collections: otherCollections
}));

//app.use(connect.logger());
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

tap.output.on("end", function() {
	//console.log("Done");
	server.close();
});

//console.log("\nListening on port ".green + String(port).red);

var url = "http://localhost:" + port + "/data/hitchhikers";
var courierUrl = "http://localhost:" + port + "/data/c/couriers";

test("Fetching Collection Data", function(t) {
	//console.log("Fetching Collection Data");

	t.plan(6);

	request.get(url + "", function(err, resp, body) {
		t.equal(body, JSON.stringify(collections.hitchhikers.toJSON()), "Returned JSON same as collection");
	});

	request.get(url + "/0", function(err, resp, body) {
		t.equal(body, JSON.stringify(collections.hitchhikers.get(0).toJSON()), "Returned JSON same as model");
	});

	request.get(url + "/0/name", function(err, resp, body) {
		var data = JSON.parse(body);
		t.equal(data, collections.hitchhikers.get(0).get("name"), "Returned String(name) same as models");
	});

	request.get(courierUrl + "", function(err, resp, body) {
		t.equal(body, JSON.stringify(otherCollections[0].toJSON()), "Returned JSON same as collection from Array");
	});

	request.get(courierUrl + "/0", function(err, resp, body) {
		t.equal(body, JSON.stringify(otherCollections[0].get(0).toJSON()), "Returned JSON same as model from Array");
	});

	request.get(courierUrl + "/0/name", function(err, resp, body) {
		console.log(body);
		var data = JSON.parse(body);
		t.equal(data, otherCollections[0].get(0).get("name"), "Returned String(name) same as models from Array");
	});
});

test("Creating New Model", function(t1) {
	//console.log("Creating New Model");
	var data = {
		id: 1,
		name: "Ford"
	};

	t1.plan(1);

	request({
		method: "post",
		url: url + "",
		json: data
	}, function(err, resp, body) {
		test("Updating Existing Model", function(t2) {
			t2.plan(1);

			//console.log("Updating Existing Model");
			request({
				method: "put",
				url: url + "/1",
				json: {
					drink: "Gangalactic Gargleblaster"
				}
			}, function(err, resp, body) {
				t2.equal(JSON.stringify(body), JSON.stringify(collections.hitchhikers.get(1).toJSON()), "Returned model matches updated model");
			});
		});

		t1.equal(JSON.stringify(body), JSON.stringify(collections.hitchhikers.toJSON()), "Returned data from POST same as in collection");
	});
});

test("Delete Model", function(t) {
	t.plan(1);

	request({
		method: "delete",
		url: url + "/0"
	}, function(err, rest, body) {
		t.equal(body, JSON.stringify(collections.hitchhikers.toJSON()), "Returned data matches collection");
	});
});
