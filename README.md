Usage

```javascript
var Backbone = require("Backbone"),
	connect = require("connect"),
	color = require("colors"),
	connect_backbone_router = require("./../"),
	
	request = require("request");

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

var server = app.listen(8080);
```

Now you should be able to get the whole collection at http://localhost:8080/data/hitchhikers
The single model at http://localhost:8080/data/hitchhikers/0
Or an attribute at http://localhost:8080/data/hitchhikers/0/name
