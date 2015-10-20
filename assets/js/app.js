var app = angular.module('amoModule', ['ui.bootstrap']);

app.run(function($rootScope, $http, $timeout) {
	var pollNewOffers = function() {
		var tick = 3000;
		$http.get('/offer/getNewOfferCnt')
		.success(function(data) {
			$rootScope.newOfferCnt = data.newOfferCnt;
			if(data.newOfferCnt > 0)
			{
				$rootScope.bNewOfferExist = true;
			}
			else
			{
				$rootScope.bNewOfferExist = false;	
			}

			$timeout(pollNewOffers, tick);
		})
		.error(function(data) {
			$timeout(pollNewOffers, tick);
		});	
	}

	var pollNewSelectedOffers = function() {
		var tick = 3000;
		$http.get('/offer/getNewSelectedOfferCnt')
		.success(function(data) {
			$rootScope.newSelectedOfferCnt = data.newSelectedOfferCnt;
			if(data.newSelectedOfferCnt > 0)
			{
				$rootScope.bNewSelectedOfferExist = true;
			}
			else
			{
				$rootScope.bNewSelectedOfferExist = false;	
			}

			$timeout(pollNewSelectedOffers, tick);
		})
		.error(function(data) {
			$timeout(pollNewSelectedOffers, tick);
		});	
	}

	pollNewOffers();
	pollNewSelectedOffers();
});