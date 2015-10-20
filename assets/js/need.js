app.controller('needController', function($rootScope, $http, $modal) {
	var ctrl = this;
	this.activeLeftMenuIndex = 0;
	this.isShowCreateNeed = false;
	this.isShowNeedDetail = false;
	this.isShowNeedList = true;
	this.selectedImages = [
		'/images/notselected.png',
		'/images/selected.png'
	];

	// new need
	//resetNewNeedForm();
	
	this.getNeedCnt = function() {
		$http.get('/need/getNeedCnt')
		.success(function (data) {
			ctrl.openCnt = data.openNeedCnt;
			ctrl.closedCnt = data.closedNeedCnt;
			ctrl.hasofferCnt = data.hasofferNeedCnt;
		});
	}

	this.getNeeds = function(status, index) {
		ctrl.isShowNeedDetail = false;
		ctrl.isShowNeedList = true;

		$http.get('/need/getNeeds?status=' + status)
		.success(function (data) {
			ctrl.needs = data;
			ctrl.activeLeftMenuIndex = index;
		});
	}

	this.isLeftMenuActive = function(index) {
		return (ctrl.activeLeftMenuIndex == index);
	}

	this.openNewNeedForm = function(size) {
		var modalInstance = $modal.open({
      		templateUrl: 'newNeedForm.html',
      		controller: 'NewNeedFormCtrl',
      		size: size,
      		backdrop: 'static',
      		resolve: {
        		parentCtrl: function () {
          			return ctrl;
        		}
      		}
    	});

    	modalInstance.result.then(function (need) {
	      	ctrl.needs.push(need);
			ctrl.getNeedCnt();
	    });
	};

	this.showNeedList = function() {
		ctrl.need = null;
		ctrl.offers = null;

		ctrl.isShowNeedDetail = false;
		ctrl.isShowNeedList = true;
		ctrl.isShowCreateNeed = false;
	};

	this.showNeedDetail = function(id) {
		ctrl.isShowNeedDetail = true;
		ctrl.isShowNeedList = false;
		ctrl.isShowCreateNeed = false;
		
		$http.get('/need/detail/' + id)
		.success(function (data){
			ctrl.need = data.need;
			ctrl.offers = data.offers;
			ctrl.chosenoffers = data.chosenoffers;
		});
	}

	this.deleteNeed = function(id) {
		if(confirm('All offers of the need will be deleted, too. Do you want to delete the need?'))
		{
			$http.get('/need/destroy/' + id)
			.success(function (data){
				// remove the need from needlist
				var i = -1;
				for(i in ctrl.needs)
				{
					if(ctrl.needs[i].id === id)
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
			});
		}
	};

	this.acceptOffer = function(offer)
	{
		if(!offer.selected)
		{
			if(confirm('If you choose the offer, you may not be able to cancel it. Do you want to accept the offer?'))
			{
				offer.selected = true;

				$http.post('/offer/accept/', {id: offer.id})
				.success(function(data) {
					ctrl.getNeedCnt();
				})
				.error(function(err) {
					alert(JSON.stringify(err));
				})
			}
		}
		else
		{
			alert('you cannot cancel the selected offer');
		}
	}

	function resetNewNeedForm() {
		if(ctrl.categories && ctrl.categories.length > 0) {
			ctrl.newNeed.category = ctrl.categories[0];	
		}

		if(ctrl.locations && ctrl.locations.length > 0) {
			ctrl.newNeed.location = ctrl.locations[0];
		}
		ctrl.newNeed.subject = '';
		ctrl.newNeed.content = '';
	}
});		

app.controller('NewNeedFormCtrl', function ($scope, $http, $modalInstance, parentCtrl) {
	$scope.newNeed = {};
	$scope.newNeed.requiredfields = [];

	$scope.init = function() {
		getCategoryList();
		getLocationList();
	};

	$scope.addRequiredField = function() {
		if($scope.requiredfield == null || $scope.requiredfield.trim().length == 0)
		{
			alert('Please enter a required field');
			return;
		}
		$scope.newNeed.requiredfields.push($scope.requiredfield);
		$scope.requiredfield = '';
	};

	$scope.createNewNeed = function() {
		var param = {};
		param.category = {'key': $scope.newNeed.category.key, 'value': $scope.newNeed.category.value};
		param.location = {'key': $scope.newNeed.location.key, 'value': $scope.newNeed.location.value};
		param.subject = $scope.newNeed.subject;
		param.content = $scope.newNeed.content;
		param.requiredfields = $scope.newNeed.requiredfields;

		$http.post('/need/create/', param)
		.success(function (data) {
			if(data.status == 'success')
			{
				$modalInstance.close(data.need);
				//resetNewNeedForm();
				//ctrl.showNeedList();
				//parentCtrl.needs.push(data.need);
				//parentCtrl.getNeedCnt();
			}
		});
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	function getCategoryList() {
		$http.get('/category/getCategoryList')
		.success(function (data) {
			$scope.categories = data.categories;
			if($scope.categories.length > 0)
			{
				$scope.newNeed.category = $scope.categories[0];
			}
		});
	};

	function getLocationList() {
		$http.get('/location/getLocationList')
		.success(function (data) {
			$scope.locations = data.locations;
			if($scope.locations.length > 0)
			{
				$scope.newNeed.location = $scope.locations[0];
			}
		});
	};

	$scope.status = {
	    isCategoryOpen: false,
	    isLoationOpen: false
	};
});		