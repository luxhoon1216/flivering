app.controller('otherneedController', function($http) {
	var ctrl = this;
	ctrl.activeLeftMenuIndex = 0;
	this.isShowNeedDetail = false;
	this.isShowNeedList = true;
	this.isShowNewOffer = true;
	this.selectedImages = [
		'/images/notselected.png',
		'/images/selected.png'
	];
	ctrl.filterCategory = {value: 'All'};
	ctrl.filterLocation = {value: 'All'};

	this.init = function() {
		$http.get('/user/getCurUser')
		.success(function(data) {
			ctrl.curUser = data.user;
		});	

		ctrl.getNeeds('open', 0);
	}

	this.getNeedCnt = function() {
		$http.get('/otherneed/getNeedCnt')
		.success(function (data) {
			ctrl.openCnt = data.openNeedCnt;	
		});
	}

	this.getNeeds = function(status, index) {
		ctrl.isShowNeedDetail = false;
		ctrl.isShowNeedList = true;

		$http.get('/otherneed/getNeeds?status=' + status)
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
			ctrl.isShowNewOffer = true;
			ctrl.need = data.need;
			ctrl.myoffers = [];
			ctrl.offers = data.offers;
			ctrl.pre = data.pre;
		});
	}

	this.submitNewOffer = function (need) {
		var hasEmptyRequiredField = false;
		$('.amo-offer-listbox').each(function(i, offerlistbox) {
			if($(offerlistbox).children('input').val().length == 0)
			{
				hasEmptyRequiredField = true;
			}
		});

		if(hasEmptyRequiredField)
		{
			alert('please fill out all of the required fields');
			return;
		}

		var param = {};
		if(ctrl.newOffer.content == null)
		{
			param.content = '';
		}
		else
		{
			param.content = ctrl.newOffer.content;
		}
		param.needid = need.id;
		param.needauthor = need.author;
		param.requiredfields = [];

		$('.amo-offer-listbox').each(function(i, offerlistbox) {
			param.requiredfields.push({
				field:$(offerlistbox).children('.amo-offer-label').html(),
				value:$(offerlistbox).children('input').val()
			});
			//alert($(offerlistbox).children('.amo-offer-label').html());
			//alert($(offerlistbox).children('input').val());
		});
		
		$http.post('/offer/create', param)
		.success(function(data) {
			if(data.status === "success")
			{
				ctrl.isShowNewOffer = false;
				ctrl.myoffers.push(data.data);
				ctrl.newOffer.content = "";

				// remove the need from needlist
				var i = -1;
				for(i in ctrl.needs)
				{
					if(ctrl.needs[i].id === need.id)
					{
						break;
					}
				}

				if(i > -1)
				{
					ctrl.needs.splice(i, 1);
				}
			}
		})
		.error(function(data) {
			alert('Error: ' + data.error);
		});
	}

	this.filterCategoryChanged = function(category) {
		ctrl.filterCategory = category;
		$http.post('/otherneed/getNeeds/', {category: ctrl.filterCategory, location: ctrl.filterLocation})
		.success(function (data) {
			ctrl.needs = data;
			if(!category)
			{
				ctrl.filterCategory = {value: "All"};
			}
		})
	};

	this.filterLocationChanged = function(location) {
		ctrl.filterLocation = location;
		$http.post('/otherneed/getNeeds/', {category: ctrl.filterCategory, location: ctrl.filterLocation})
		.success(function (data) {
			ctrl.needs = data;
			if(!location)
			{
				ctrl.filterLocation = {value: "All"};
			}
		})
	};

	this.status = {
	    isCategoryOpen: false,
	    isLoationOpen: false
	};
});