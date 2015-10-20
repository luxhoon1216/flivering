/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  //adapter: 'mongo',
  //schema: true,

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
    
    username: {
    	type: 'string',
    	required: true,
    	unique: true
    },

    password: {
    	type: 'string',
    	required: true    	
    },

    firstname: {
    	type: 'string',
    	required: true
    },

    lastname: {
    	type: 'string',
    	required: true
    },

    email: {
    	type: 'email',
    	required: true,
    	unique: true
    },

    categories: {
      type: 'array'
    },

    locations: {
      type: 'array'
    }
  }
};
