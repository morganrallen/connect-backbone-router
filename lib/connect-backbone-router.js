var path = require("path"),
	url = require("url");

module.exports = function(options) {
	if(!options.collections)
		throw new Error("collections needs to be defined in options");

	var collections = options.collections,
		prefix = path.normalize(options.path);

	var methods = {
		GET: function(collection, modelId, attribute) {
			try {
				if(!collections[collection]) {
					return {
						error: "collection not found"
					};
				};

				if(!modelId) {
					return collections[collection] || {};
				}

				if(!attribute || typeof attribute !== "string") {
					return collections[collection].get(modelId);
				};

				return collections[collection].get(modelId).get(attribute);
			} catch(e) {
				return {
					additional: e,
					error: "something went wrong",
					status: 418
				};
			};
		},
		POST: function(collection, modelId, attributes) {
			attributes = attributes || {};
			if(!attributes.id && modelId)
				attributes.id = modelId;

			return collections[collection].add(attributes);
		},

		PUT: function(collection, modelId, attributes) {
			attributes = attributes || {};
			return collections[collection].get(modelId).set(attributes);
		},

		DELETE: function(collection, modelId, attributes) {
			attributes = attributes || {};
			if(!attributes.id && modelId)
				attributes.id = modelId;

			return collections[collection].remove(attributes);
		}
	};

	return function(req, res, next) {
		if(req.url.slice(0, prefix.length) === prefix && req.url.length > prefix.length) {
			var p = url.parse(req.url.slice(prefix.length + 1)).pathname.split("/"),
				collection = p.shift(),
				modelId = p.shift(),
				attribute = p.shift() || req.body;

			res.setHeader("content-type", "application/json");

			var result = methods[req.method](collection, modelId, attribute) || {};

			if(result.error)
				res.statusCode = result.status || 404;

			return res.end(JSON.stringify(result));
		};

		return next();
	}
}
