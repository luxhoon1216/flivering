/**
 * LocationController
 *
 * @description :: Server-side logic for managing locations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	getLocationList: function(req, res) {
		Location.find()
		.sort({value: 'asc'})
		.exec(function(err, locations) {
			if(err) return res.json({ status: 'error', error: 'location, getLocationList, find: ' + err}, 500);

			if(locations)
			{
				return res.json({locations: locations});
			}
		});
	},

	resetLocationList: function(req, res) {
		var fs = require('fs');
		var states = [];

		fs.readFile('/Users/DannyK/Documents/Projects/Java/amo/assets/data/state_table.csv', 'utf8', function(err, data) {
			if (err) return res.json({ error: 'location, resetLocationList, reset location list: ' + err}, 500);
			
			var splitData = data.split('\n');
			splitData.forEach(function(stateRow) {
				if(stateRow.length > 0)
				{
					var splitRow = stateRow.split(',');
					if(splitRow[1] != '\"name\"')
					{
						console.log(splitRow[1]);
						states.push({'key': splitRow[2].substring(1, splitRow[2].length -1), 
							'value': splitRow[1].substring(1, splitRow[1].length -1), 'type': 'state'});
					}
				}
			});

			Location.create(states)
			.exec(function(err, createdState) {
				return res.json(createdState);
			});
		});
	}
};

