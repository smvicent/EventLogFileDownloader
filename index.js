const jsforce = require("jsforce");
const fetch = require("node-fetch");
const fs = require("fs");
const { callbackify } = require("util");

const conn = new jsforce.Connection();
const userName = "username";
const password = "pasword+token";

conn.login(userName, password, function (err, res) {
	if (err) {
		return console.error(err);
	}

	console.log("User ID: " + res.id);
	console.log("Org ID: " + res.organizationId);

	conn.query(
		"SELECT LogFile, EventType, CreatedDate FROM EventLogFile WHERE EventType IN ('API', 'RestApi', 'APITotalUsage')"
	).then((result) => {
		result.records.forEach((record) => {
			const filename = record.CreatedDate + "_Log.csv";
			const dataPath = record.LogFile;
			const headers = {
				Authorization: "Bearer " + conn.accessToken,
				"Content-Type": "csv",
			};
			const options = {
				method: "GET",
				headers: headers,
			};
			console.log("Downloading: " + filename);
			fetch(conn.instanceUrl + dataPath, options)
				.then((result) => {
					result.body.pipe(fs.createWriteStream(filename));
				})
				.catch((error) => {
					console.log(error);
				});
		});
	});
});
