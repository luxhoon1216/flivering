/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	getCategoryList: function(req, res) {
		Category.find()
		.sort({key: 'asc'})
		.exec(function(err, categories) {
			if(err) return res.json({ status: 'error', error: 'category, getCategoryList, find: ' + err}, 500);

			if(categories)
			{
				return res.json({categories: categories});
			}
		});
	}
};

