/**
 * UserController
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
   * (specific to UserController)
   */
  _config: {},

  create: function(req, res) {
  	var bcrypt = require('bcrypt');
  	var user = req.body;
    
    if(user.email)
    {
	    user.email = user.email.toLowerCase();
	}
	else
	{
		return res.json({status: 'fail', error: '101:Invalid email address'});
	}

  	bcrypt.genSalt(10, function(err, salt) {
  		if(err) return res.json({ status: 'error', error: 'user, encrypt password: ' + err}, 500);

  		bcrypt.hash(user.password, salt, function(err, hash) {
  			if(err) return res.json({ status: 'error', error: 'user, encrypt password2: ' + err}, 500);

  			user.password = hash;

  			User.create(user).exec(function(err, usr) {
		    	if(err) return res.json({ status: 'error', error: 'create, insert new user: ' + err}, 500);

		    	delete usr.id;
		    	delete usr.password;

		    	req.session.user = usr;
		    	return res.json({status: 'success', user: usr});
		    });		
  		});
  	});
  },

  signin: function (req, res) {  	
  	var bcrypt = require('bcrypt');

  	if(req.method == 'GET')
  	{
  		//console.log(req);
		res.view({
			 locals: {msg: ''}
		//,layout: 'signinlayout' 	 						 
		 });
  	}
  	else
  	{
	  	if(req.body.username)
	  	{
		 	User.findOneByUsername(req.body.username).exec(function (err, usr) {
		 		if(err) return res.json({ status: 'error', error: 'user, signin, find user by username: ' + err}, 500);

		 		if(usr) {
		 			bcrypt.compare(req.body.password, usr.password, function (err, match) {
		 				if(err) return res.json({ status: 'error', error: 'user, signin, compare password: ' + err}, 500);

		 				if (match) {
		 					delete usr.password;
		 					delete usr.id;
		 					req.session.user = usr;
		 					res.json({status: 'success'});
		 				}
		 				else
		 				{
		 					if (req.session.user) req.session.user = null;
		 					//res.json({ error: 'Invalid UserId'}, 400);		
		 					res.json({status: 'fail', msg: 'Invalid username or password'});
		 				}
		 			}); 			
		 		}
		 		else
		 		{
		 			//res.json({ error: 'User not found' }, 404);
		 			res.json({status: 'fail', msg: 'Invalid username or password'});
		 		}
		 	});
		 }
		 else
		 {
		 	res.json({status: 'fail', msg: 'Enter user name'});
		 }
	}
 },

 signout: function (req, res) {
 	if(req.session.user)
 	{
 		req.session.user = null;
 	}

 	res.redirect('/');
 },

 update: function (req, res) {
 	if(req.body)
 	{
 		//console.log(req.body);
 		User.update({username: req.body.username}, req.body, function (err, updatedUser) {
 			if(err) return res.json({ status: 'error', error: 'user, update, update user: ' + err}, 500);

 			if(updatedUser) {
 				delete updatedUser[0].password;
 				delete updatedUser[0].id;

 				req.session.user = updatedUser[0];
 				return res.json({status: 'success', user: updatedUser[0]});
 			}
 		});
 	}
 },

 profile: function(req, res) {
 	if(req.session.user)
 	{
 		return res.view();
  	}
  },

 getCurUser: function(req, res) {
  	User.findOneByUsername(req.session.user.username)
  	.exec(function(err, curUser) {
  		if(err) return res.json({ status: 'error', error: 'user, get cur user: ' + err}, 500);

  		if(curUser) {
  			delete curUser.id;
  			delete curUser.password;
  			req.session.user = curUser;

  			return res.json({user: curUser});
  		}
  	});
  },

  isUsernameExist: function(req, res) {
  	if(req.body && req.body.username)
  	{
		User.countByUsername(req.body.username)
		.exec(function(err, usernameCnt) {
			if(err) return res.json({ status: 'error', error: 'user, isUsernameExist, get username cnt: ' + err}, 500);

			if(usernameCnt > 0)
			{
				return res.json({status: 'success', result: true});
			}
			else
			{
				return res.json({status: 'success', result: false});	
			}
		});
	}
	else
	{
		return res.json({status: 'fail', msg: 'Invalid access'});
	}
  },

  isEmailExist: function(req, res) {
  	if(req.body && req.body.email)
  	{
		User.countByEmail(req.body.email)
		.exec(function(err, emailCnt) {
			if(err) return res.json({ status: 'error', error: 'user, isEmailExist, get email cnt: ' + err}, 500);

			if(emailCnt > 0)
			{
				return res.json({status: 'success', result: true});
			}
			else
			{
				return res.json({status: 'success', result: false});	
			}
		});
	}
	else
	{
		return res.json({status: 'fail', msg: 'Invalid access'});
	}
  }
};
