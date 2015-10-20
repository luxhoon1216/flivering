/**
 * OfferController
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
   * (specific to OfferController)
   */
  _config: {},

  index: function(req, res) {
    return res.view();
  },

  getNeedCnt: function(req, res) {
    var needCntObj = {};

    Offer.findByAuthor(req.session.user.username)
    .exec(function(err, offers) {
      if (err) return res.json({ error: 'Offer, getNeedCnt, get my offers : ' + err}, 500);

      if(offers)
      {
        var needIdsOfMyOffers = [];
        var needIdsOfSelectedOffers = [];

        //console.log(offers);

        for(i in offers)
        {
          needIdsOfMyOffers.push(offers[i].needid);
          if(offers[i].selected)
          {
            needIdsOfSelectedOffers.push(offers[i].needid);
          }
        }

        //console.log(needIdsOfSelectedOffers);

        if(needIdsOfMyOffers.length > 0)
        {
          //console.log(needIdsOfMyOffers);

          Need.countById(needIdsOfMyOffers)
          .where({'$or': [
                  {isclosed: false},
                  {isclosed: null}
                ]})
          .exec(function(err, openNeeds) {
            if (err) return res.json({ error: 'Offer, getNeedCnt, get open needs : ' + err}, 500);
            
            needCntObj.openNeedCnt = openNeeds;

            Need.countById(needIdsOfMyOffers)
            .where({isclosed: true})
            .exec(function(err, closedNeeds) {
              if (err) return res.json({ error: 'Offer, getNeedCnt, get closed needs : ' + err}, 500);

              needCntObj.closedNeedCnt = closedNeeds;

              if(needIdsOfSelectedOffers.length > 0)
              {
                Need.countById(needIdsOfSelectedOffers)
                .exec(function(err, selectedNeeds) {
                  if (err) return res.json({ error: 'Offer, getNeedCnt, get selected needs : ' + err}, 500);

                  needCntObj.selectedNeedCnt = selectedNeeds;

                  return res.json(needCntObj);
                });
              }
              else
              {
                needCntObj.selectedNeedCnt = 0;

                return res.json(needCntObj);
              }
            });
          });
        }
        else
        {
          needCntObj.openNeedCnt = 0;
          needCntObj.closedNeedCnt = 0;
          needCntObj.selectedNeedCnt = 0;
          return res.json(needCntObj);
        }
      }
    });
  },

  getNeeds: function(req, res) {
    var offerColl = Offer.findByAuthor(req.session.user.username);

    if(req.query.status && req.query.status == 'selected')
    {
      offerColl = offerColl.where({selected: true});
    }

    offerColl.exec(function(err, offers) {
      if (err) return res.json({ error: 'Offer.getNeeds, get my offers : ' + err}, 500);

      if(offers)
      {
        var needIdsOfMyOffers = [];

        //console.log(offers);

        for(i in offers)
        {
          needIdsOfMyOffers.push(offers[i].needid);
        }

        //console.log(needIdsOfMyOffers);

        //console.log(needIdsOfMyOffers);
        if(needIdsOfMyOffers.length > 0)
        {
          var need = Need.findById(needIdsOfMyOffers);

          //console.log(req);
          if(!req.query.status || req.query.status != 'selected')
          {
            if(req.query.status && req.query.status == 'closed')
            {
              need = need.where({isclosed: true});
            }
            else
            {
              need = need.where({'$or': [
                        {isclosed: false},
                        {isclosed: null}
                      ]});
            }
          }

          need.exec(function(err, needs) {
            if (err) return res.json({ error: 'Offer.getNeeds, get needs : ' + err}, 500);

            //console.log(JSON.stringify(openNeeds));

            return res.json(needs);
          });
        }
        else
        {
          return res.json([]);
        }
      }
    });
  },

  getNewOfferCnt: function(req, res) {
    Offer.countByNeedauthor(req.session.user.username)
    .where({checkedbyneedauthor: false})
    .exec(function(err, newOfferCnt) {
      if(err) return res.json({ status: "error", error: 'offer, getNewOfferCnt, get new offer cnt: ' + err}, 500);

      return res.json({newOfferCnt: newOfferCnt});
    });
  },

  getNewSelectedOfferCnt: function(req, res) {
    Offer.countByAuthor(req.session.user.username)
    .where({selected: true})
    .where({checkedbyauthor: false})
    .exec(function(err, newSelectedOfferCnt) {
      if(err) return res.json({ status: "error", error: 'offer, getNewSelectedOfferCnt, get new selected offer cnt: ' + err}, 500);

      //console.log(newSelectedOfferCnt);

      return res.json({newSelectedOfferCnt: newSelectedOfferCnt});
    });
  },

  create: function(req, res) {
    if(req.body)
    {
      req.body.author = req.session.user.username;
      req.body.selected = false;
      req.body.checkedbyneedauthor = false;
      req.body.checkedbyauthor = false;
      //console.log(req.body);
      Offer.create(req.body).exec(function(err, result) {
        if(err) return res.json({ status: "error", error: 'create, add new offer: ' + err}, 500);

        if(result)
        {
          // offer cnt ++
          Need.findOneById(result.needid)
          .exec(function(err, need) {
            if(err) return res.json({ status: "error", error: 'create, increase offer cnt of need: ' + err}, 500);

            if(need)
            {
              //console.log(need);
              Need.update({id: need.id}, {offercnt: need.offercnt + 1}, function(err, upatedNeed) {
                return res.json({status: "success", data: result});
              });
            }
            else
            {
              return res.json({status: "fail"});
            }
          });
        }
        else
        {
          return res.json({status: "fail"});
        }
      });
    }
  },

  destroy: function(req, res) {
    if(req.body)
    {
      Offer.destroy(req.body.id).exec(function(err, deletedOffer) {
        if(err) return res.json({ status: "error", error: 'offercontroller, destroy, destroy offer by id: ' + err}, 500);

          Need.findOneById(req.body.needid).exec(function(err, need) {
            if(err) return res.json({ status: "error", error: 'offercontroller, destroy, find need of offer: ' + err}, 500);

            if(need)
            {
              //console.log(need);
              Need.update({id: need.id}, {offercnt: need.offercnt  - 1}, function(err, upatedNeed) {
                return res.json({status: "success"});
              });
            }
            else
            {
              return res.json({status: "fail"});
            }
          });
      });
    }
  },

  update: function(req, res) {
    if(req.body)
    {
      Offer.update({id: req.body.id}, req.body, function(err, updatedOffer) {
        if(err) return res.json({ status: "error", error: 'offercontroller, update, update offer by id: ' + err}, 500);

        return res.json({status: "success"});
      });
    }
  },

  accept: function(req, res) {
    if(req.body)
    {
      Offer.update({id: req.body.id}, {selected: true}, function(err, updatedOffer) {
        if(err) return res.json({ status: "error", error: 'offercontroller, accept, offer set selected: ' + err}, 500);
        Need.update({id: updatedOffer[0].needid}, {isclosed: true}, function(err, updatedNeed) {
          if(err) return res.json({ status: "error", error: 'offercontroller, accept, need set isclosed: ' + err}, 500);

          return res.json({status: "success"});
        });
      });
    }
  }
};
