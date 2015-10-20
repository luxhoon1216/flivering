/**
 * MainController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to MainController)
   */
  _config: {},

  index: function(req,res) {
  	var myneeds = [];
  	var needsforoffer = [];

  	if(req.session.user)
  	{
      Need.findByAuthor(req.session.user.username).limit(3).exec(function(err, needs) {        
        if (err) return res.json({ error: 'DB error'}, 500);

        if(needs)
        {
	        myneeds = needs;        

	        if(req.session.user.category.length > 0 && req.session.user.location.length > 0)
		  	  {  	  	
		  	  	var categoryQry = [];
		  	  	var locationQry = [];

		        if(categoryQry.length == 0)
		        {
		     	  	for(i = 0; i < req.session.user.category.length; i++)
		    	  	{
		    	  		//categoryQry.push({category: req.session.user.category[i]});
		         	   categoryQry.push(req.session.user.category[i]);
		    	  	}
		        }

		        if(locationQry.length == 0)
		        {
		    	  	for(i = 0; i < req.session.user.location.length; i++)
		    	  	{
		    	  		//locationQry.push({location: req.session.user.location[i]});
		            	locationQry.push(req.session.user.location[i]);
		    	  	}
		        }

		  	  	Need.find()		  	  	
				.where({
			        category: categoryQry
			    })
			    .where({          
			        location: locationQry
			    })
		  	  	.where({
		  	  		author: {'!': req.session.user.username}
		  	  	})
		  	  	.limit(3)
		  	  	.exec(function(err, needsoff) {
			      	if (err) return res.json({ error: 'DB error'}, 500);

			      	if(needsoff)
			      	{
			      		needsforoffer = needsoff;
			      		return res.view({needs: myneeds, needsforoffer: needsforoffer});
			      	}
			      	else
			      	{
			      		return res.view({needs: myneeds, needsforoffer: needsforoffer});	
			      	}
			      	
			     });
		  	  }  
		  	  else
		  	  {
		  	  	return res.view({needs: myneeds, needsforoffer: needsforoffer});
		  	  }
	  	}
	  	else
	  	{
	  		return res.view({needs: myneeds, needsforoffer: needsforoffer});
	  	}
      });  	  
  	}
  }
  
};
