/**
 * Offer
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
    
    author: {
    	type: 'string',
    	required: true
    },

    needid: {
    	type: 'string',
    	required: true
    },

    needauthor: {
      type: 'string',
      required: true
    },

    content: {
    	type: 'string',
    	required: true
    },

    requiredfields: {
      type: 'array'
    },

    selected: {
      type: 'boolean',
      required: true
    },

    checkedbyneedauthor: {
      type: 'boolean',
      required: true
    },

    checkedbyauthor: {
      type: 'boolean',
      required: true
    }
  }
};
