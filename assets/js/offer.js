app.controller('offerController', function($http) {
	var ctrl = this;
	this.activeLeftMenuIndex = 0;
	this.isShowOfferDetail = false;
	this.isShowOfferList = true;
	this.selectedImages = [
		'/images/notselected.png',
		'/images/selected.png'
	];
	
	this.getNeedCnt = function() {
		$http.get('/offer/getNeedCnt')
		.success(function (data) {
			ctrl.openCnt = data.openNeedCnt;
			ctrl.closedCnt = data.closedNeedCnt;
			ctrl.selectedCnt = data.selectedNeedCnt;
		});
	}

	this.getNeeds = function(status, index) {
		// status = open or closed
		ctrl.isShowNeedDetail = false;
		ctrl.isShowNeedList = true;

		$http.get('/offer/getNeeds?status=' + status)
		.success(function (data) {
			ctrl.needs = data;
			ctrl.activeLeftMenuIndex = index;
		});
	}

	this.isLeftMenuActive = function(index) {
		return (ctrl.activeLeftMenuIndex == index);
	}

	this.showNeedList = function() {
		ctrl.need = null;
		ctrl.offers = null;

		ctrl.isShowNeedDetail = false;
		ctrl.isShowNeedList = true;
		ctrl.isShowCreateNeed = false;
	}

	this.showNeedDetail = function(id) {
		ctrl.isShowNeedDetail = true;
		ctrl.isShowNeedList = false;

		$http.get('/need/detail/' + id)
		.success(function (data){
			ctrl.need = data.need;
			ctrl.myoffers = data.myoffers;
			ctrl.offers = data.offers;
			ctrl.chosenoffers = data.chosenoffers;	
		})
		.error(function (err) {
			alert(err.error);
		});
	}

	this.deleteOffer = function(offer) {
		if(confirm('Do you want to remover your offer?'))
		{
			$http.post('/offer/destroy/', offer)
			.success(function (data) {
				ctrl.myoffers = [];
				// remove the need from needlist
				var i = -1;
				for(i in ctrl.needs)
				{
					if(ctrl.needs[i].id === ctrl.need.id)
					{
						break;
					}
				}

				if(i > -1)
				{
					ctrl.needs.splice(i, 1);
				}

				ctrl.getNeedCnt();
				ctrl.showNeedList();
			})
		}
	}
});