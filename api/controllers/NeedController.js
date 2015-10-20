/**
 * NeedController
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
   * (specific to NeedController)
   */
  _config: {},

  index: function(req, res) {
    return res.view();
  },
  
  getNeedCnt: function(req, res) {
	  var needCntObj = {};

    // open needs
    Need.countByAuthor(req.session.user.username)
    .where({'$or': [
        {isclosed: false},
        {isclosed: null}
      ]})
    .exec(function(err, openNeeds) {
      if (err) return res.json({ error: 'getNeedCnt, get open needs cnt: ' + err}, 500);
      
      needCntObj.openNeedCnt = openNeeds;

      // open and has offers
      Need.countByAuthor(req.session.user.username)
      //.where({isclosed: false, isclosed: null})
      .where({'$or': [
        {isclosed: false},
        {isclosed: null}
      ]})
      .where({offercnt: {'>': 0}})
      .exec(function(err, hasofferNeeds) {
        if (err) return res.json({ error: 'getNeedCnt, get open and has offer needs: ' + err}, 500);

        needCntObj.hasofferNeedCnt = hasofferNeeds;

        // closed
        Need.countByAuthor(req.session.user.username)
        .where({isclosed: true})
        .exec(function(err, closedNeeds) {
          if (err) return res.json({ error: 'getNeedCnt, get close needs cnt: ' + err}, 500);

          needCntObj.closedNeedCnt = closedNeeds;

          //console.log(needCntObj);

          return res.json(needCntObj);
        });
      });
    });
  },

  getNeedCntMR: function (req, res) {
    Need.native(function (err, coll) {
      //console.log(coll);
      
      var m = function() {
        emit(this.isClosed, 1);
      }

      var r = function(k, v) {
        return Array.sum(v);
      }

      coll.mapReduce(
          m, r,
          {
            query: { author: req.session.user.username },
            out: { inline: 1 }
          },
          function(err, counts) {
            if (err) return res.json({ error: 'getNeedCntMR, get mapReduce count: ' + err}, 500);
            
            var needCntObj = {};

            needCntObj.openNeedCnt = 0;
            needCntObj.closedNeedCnt = 0;
            for(i in counts)
            {
              if(counts[i]._id)
              {
                needCntObj.closedNeedCnt += counts[i].value; 
              }
              else
              {
                needCntObj.openNeedCnt += counts[i].value; 
              }
            }
            return res.json(needCntObj);
          });
    });
  },

  getNeeds: function(req, res) {
    var needsColl = Need.findByAuthor(req.session.user.username);

    //console.log(req);
    if(req.query.status && req.query.status == 'closed')
    {
      needsColl = needsColl.where({isclosed: true});
    }
    else if(req.query.status && req.query.status == 'hasoffer')
    {
      needsColl = needsColl
                  .where({'$or': [
                      {isclosed: false},
                      {isclosed: null}
                    ]})
                  .where({offercnt : {'>': 0}});
    }
    else
    {
      needsColl = needsColl
                  .where({'$or': [
                      {isclosed: false},
                      {isclosed: null}
                    ]});
    }

    needsColl.exec(function(err, needs) {
      if (err) return res.json({ error: 'getNeeds, get needs: ' + err}, 500);

      //console.log(JSON.stringify(openNeeds));

      return res.json(needs);
    });
  },

  new: function(req, res) {
  	if(req.session.user)
  	{
  		res.view();
  	}
  },

  create: function(req, res) {
    if(req.body)
    {
      req.body.author = req.session.user.username;
      req.body.offercnt = 0;
      req.body.isclosed = false;

      Need.create(req.body).exec(function(err, newNeed) {
        if(err) return res.json({ status: 'error', error: 'NeedController, create, create new need: ' + err}, 500);

        if(newNeed)
        {
          //console.log(newNeed);
          return res.json({status: 'success', need: newNeed});
        }

        return;
      });
    }
  },

  update: function(req, res) {
    if(req.body)
    {
      Need.update({id: req.body.id}, req.body, function(err, updatedNeed) {
        if(err) return res.json({ status: "error", error: 'NeedController, update, update need by id: ' + err}, 500);

        return res.json({status: "success"});
      });
    }
  },

  destroy: function(req, res) {
    if(req.params.id)
    {
      Need.destroy(req.params.id).exec(function(err, deletedNeed) {
        if(err) return res.json({ status: 'error', error: 'NeedController, destroy, destroy need: ' + err}, 500);

        Offer.destroy({needid: req.params.id})
         .exec(function(err, deletedOffers) {
          if(err) return res.json({ status: 'error', error: 'NeedController, destroy, destroy offers: ' + err}, 500);

          //return res.json(oresult);
          return res.json({status: 'success'});
        });
      })
    }
    else
    {
      return res.json({ status: 'error', error: 'missing need id'});
    }    
  },

  detail: function(req, res) {    
    if(req.params.id)
    {
      //console.log(req.params);
      var previous = 0;
      Need.findOneById(req.params.id).exec(function (err, nd) {
        if(err) return res.json({ error: 'detail, get need by id: ' + err}, 500);

        //console.log(nd.id);
        if(nd)
        {
          Offer.findByNeedid(nd.id)
          .where({author: {'!': req.session.user.username}})
          .where({selected: false})
          .exec(function (err, ofrs) {

            if(err) return res.json({ error: 'detail, get offer by needid excluding my offer: ' + err}, 500);

            Offer.findByNeedid(nd.id)
            .where({author: req.session.user.username})
            //.where({selected: false})
            .exec(function (err, myofrs) {

                Offer.findByNeedid(nd.id)
                .where({selected: true})
                .exec(function (err, chosenofrs) {

                  // if detail of need was checked by author
                  // mark all new offers of the need
                  if(nd.author == req.session.user.username)
                  {
                    Offer.update({needid: nd.id}, {checkedbyneedauthor: true})
                    .exec(function(err, checkedOfr) {

                    });
                  }

                  for(i in chosenofrs)
                  {
                    if(chosenofrs[i].author == req.session.user.username)
                    {
                      //console.log(chosenofrs[i].id);
                      Offer.update({id: chosenofrs[i].id}, {checkedbyauthor: true})
                      .exec(function(err, checkedOfr) {
                        
                      });
                      break;
                    }
                  }

                return res.json({need: nd, myoffers: myofrs, offers: ofrs, chosenoffers: chosenofrs});
              });
            });  
          });        
        }
      });
    }
    else
    {
      res.redirect('/need');
    }
  }
};
