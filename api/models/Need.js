/**
 * Need
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

    author: {
    	type: 'string',
    	required: true
    },

    subject: {
      type: 'string',
      required: true,
      maxLength: 100
    },

    content: {
    	type: 'string',
    	required: true
    },

    category: {
    	type: 'json',
    	required: true
    },

    location: {
    	type: 'json',
    	required: true
    },

    offercnt: {
      type: 'integer',
      required: true
    },
    
    isclosed: {
    	type: 'boolean',
    	required: true
    },

    requredfields: {
      type: 'array',
      required: false
    }
  }

  /*beforeCreate: function (attrs, next) {
    var categoryArr = [];
    var locationArr = [];
    
    categoryArr.push(attrs.category);
    locationArr.push(attrs.location);
    
    attrs.category = categoryArr;
    attrs.location = locationArr;

    attrs.content = attrs.content;

    next();
  }*/
};
