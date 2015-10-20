/**
 * OtherneedsController
 *
 * @description :: Server-side logic for managing otherneeds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to NeedController)
   */
  _config: {},

  index: function(req, res) {
    return res.view();
  },
  
  getNeedCnt: function(req, res) {
	  var needCntObj = {};

    Need.count()
    .where({id: { '!': [req.session.user]}})
    .where({'$or': [
        {isclosed: false},
        {isclosed: null}
      ]})
    .exec(function(err, openNeeds) {
      if (err) return res.json({ error: 'getNeedCnt, get open needs cnt: ' + err}, 500);
      
      needCntObj.openNeedCnt = openNeeds;

      return res.json(needCntObj);
    });
  }, 

  getNeeds: function(req, res) {
    // get all needs which are in the both user's categories and locations
    if(req.session.user)
    {
      if(req.session.user.categories.length > 0 && req.session.user.locations.length > 0)
      { 
        // get instance of find object of Need; not run yet
        var needColl = Need.find();

        // apply users filters; categories
        var categoryQry = [];

        //console.log(req.body);
        if(req.body && req.body.category && req.body.category.key)
        {
            categoryQry.push(req.body.category.key);
        }

        if(categoryQry.length == 0)
        {
          req.session.user.categories.forEach(function(c) {
            categoryQry.push(c.key);
          });
        }

        // apply category filter if exists
        if(categoryQry.length > 0)
        {
          needColl = needColl.where({
                      'category.key': categoryQry
                    }) ;
        }

        // apply users filters; locations      
        var locationQry = [];

        if(req.body && req.body.location && req.body.location.key)
        {
            //locationQry.push({location: req.body.sellocations});
            locationQry.push(req.body.location.key);
        }

        if(locationQry.length == 0)
        {
          req.session.user.locations.forEach(function(l) {
            locationQry.push(l.key);
          });
        }

        // apply location filter if exists
        if(locationQry.length > 0)
        {
          needColl = needColl.where({
                      'location.key': locationQry
                    }) ;
        }

        // only open needs
        needColl = needColl.where({'$or': [
                  {isclosed: false},
                  {isclosed: null}
                ]});

        // remove already offered needs
        var ObjectID = require('mongodb').ObjectID;     // _id is ObjectID type in mongodb
        var offeredIds = [];
        Offer.findByAuthor(req.session.user.username).exec(function(err, offers) { 
          if (err) return res.json({ error: 'otherneeds, get my offers:' + err}, 500);
          
          if(offers)
          {
            //console.log(offers);
            for(i = 0; i < offers.length; i++)
            {
              //offeredIds.push(new ObjectID(offers[i].needid));
              offeredIds.push(offers[i].needid);
            }
          }

          // remove need having my offers already
          if(offeredIds.length > 0)
          {
            //console.log(offeredIds);
            needColl = needColl.where({
                        id: {'!': offeredIds}
                      }) ;
          }

          //console.log(req.session.user.username);
          //req.session.user.username  

          var authors = [];
          authors.push(req.session.user.username);
          needColl = needColl
          .where({
            author: {'!': authors}
          });

          //console.log(find._criteria.where.author);  

          needColl.exec(function(err, needs) {
            if (err) return res.json({ error: 'otherneeds, get other needs:' + err}, 500);

            return res.json(needs);
          });
        });
      } // if(req.session.user.category.length > 0 && req.session.user.location.length > 0)
      else
      {
        return res.json([]);
      }
    }
  } ,

  new: function(req, res) {
  	if(req.session.user)
  	{
  		res.view();
  	}
  },

  create: function(req, res) {
    Need.create(req.body).exec(function(err, result) {
      if(err) return res.json({ error: 'DB error'}, 500);

      if(result)
      {
        return res.redirect('/need/detail?id=' + result.id);
      }
      else
      {
        return res.redirect('/need');
      }
    });
  },

  destroy: function(req, res) {
    if(req.params.id)
    {
      Need.destroy(req.params.id).exec(function(err, result) {
        if(err) return res.json({ error: 'DB error'}, 500);

        if(result)
        {
           Offer.destroy()
           .where({
             needid: result.id
           })
           .exec(function(err, oresult) {
            if(err) return res.json({ error: 'DB error'}, 500);

            //return res.json(oresult);
            return res.redirect('/need'); 
          });
        }
        else
        {
          return res.redirect('/need');        
        }
      })
    }
    else
    {
      return res.redirect('/need');  
    }    
  },

  detail: function(req, res) {    
    if(req.params.id)
    {
      Need.findOneById(req.params.id).exec(function (err, nd) {
        if(err) return res.json({ status: 'error', error: 'OtherneedController, detail, find need by id: ' + err}, 500);

        //console.log(nd.id);

        Offer.findByNeedid(nd.id).exec(function (err, ofrs) {
          if(err) return res.json({ status: 'error', error: 'OtherneedController, detail, find offer by id: ' + err}, 500);

          if(nd && ofrs)
          {
            //console.log(nd);
            //res.view({need: nd, offers: ofrs, pre: previous});
            res.json({need: nd, offers: ofrs, pre: previous});
          }
          else
          {
            res.redirect('/need');
          }  
        })        
      });
    }
    else
    {
      res.redirect('/need');
    }
  }
};


