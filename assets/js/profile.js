app.controller('profileController', function($http, $location) {
	var ctrl = this;
	this.bShowEmail = false;
	this.bShowCategory = false;
	this.bShowLocation = false;
	this.emailMsg = '';

	this.init = function() {
		$http.get('/user/getCurUser')
		.success(function(data) {
			ctrl.curUser = data.user;
			ctrl.tempEmail = data.user.email;
		});

		$http.get('/category/getCategoryList')
		.success(function (data) {
			ctrl.categories = data.categories;
			if(ctrl.categories.length > 0)
			{
				ctrl.selectedCategory = ctrl.categories[0];
			}
		});

		$http.get('/location/getLocationList')
		.success(function (data) {
			ctrl.locations = data.locations;
			if(ctrl.locations.length > 0)
			{
				ctrl.selectedLocation = ctrl.locations[0];
			}
		});
	}

	this.updateEmail = function() {
		ctrl.emailMsg = ''
		$http.post('/user/isEmailExist', {email: ctrl.tempEmail})
		.success(function(data) {
			if(data.status === 'success')
			{
				if(data.result)
				{
					ctrl.emailMsg = 'The email address is being used by another user';
				}
				else
				{
					ctrl.curUser = data.user;
					ctrl.bShowEmail = false;
				}
			}
		})
		.error(function(data) {
			alert(data.error);
		});
	}

	this.cancelEmail = function() {
		ctrl.emailMsg = '';
		ctrl.tempEmail = ctrl.curUser.email;
		ctrl.bShowEmail = false;
	}

	this.addCategory = function() {
		ctrl.categoryMsg = '';
		var isExist = false;
		ctrl.curUser.categories.forEach(function(category) {
			if(category.key === ctrl.selectedCategory.key) {
				isExist = true;
			}
		});

		if(!isExist)
		{
			ctrl.curUser.categories.push({key: ctrl.selectedCategory.key, value: ctrl.selectedCategory.value});
			/*$http.post('/user/update', ctrl.curUser)
			.success(function(data) {
				ctrl.curUser = data.user;
			})
			.error(function(data) {
				alert(data.error);
				ctrl.categoryMsg = 'Failed to add category';
			});*/
		}
		else
		{
			ctrl.categoryMsg = ctrl.selectedCategory.value + ' was already added';
		}
	}

	this.deleteCategory = function(c) {
		for(i = 0; i < ctrl.curUser.categories.length; i++)
		{
			if(ctrl.curUser.categories[i].key === c.key)
			{
				ctrl.curUser.categories.splice(i, 1);
				break;
			}
		}

		/*$http.post('/user/update', ctrl.curUser)
			.success(function(data) {
				ctrl.curUser = data.user;
			})
			.error(function(data) {
				ctrl.categoryMsg = 'Failed to remove category';
			});*/
	}

	this.addLocation = function() {
		ctrl.locationMsg = '';
		var isExist = false;
		ctrl.curUser.locations.forEach(function(location) {
			if(location.key === ctrl.selectedLocation.key) {
				isExist = true;
			}
		});

		if(!isExist)
		{
			ctrl.curUser.locations.push({key: ctrl.selectedLocation.key, value: ctrl.selectedLocation.value});
			/*$http.post('/user/update', ctrl.curUser)
			.success(function(data) {
				ctrl.curUser = data.user;
			})
			.error(function(data) {
				ctrl.categoryMsg = 'Failed to add location';
			});*/
		}
		else
		{
			ctrl.locationMsg = ctrl.selectedLocation.value + ' was already added';
		}
	}

	this.deleteLocation = function(c) {
		for(i = 0; i < ctrl.curUser.locations.length; i++)
		{
			if(ctrl.curUser.locations[i].key === c.key)
			{
				ctrl.curUser.locations.splice(i, 1);
				break;
			}
		}

		/*$http.post('/user/update', ctrl.curUser)
			.success(function(data) {
				ctrl.curUser = data.user;
			})
			.error(function(data) {
				ctrl.categoryMsg = 'Failed to remove location';
			});*/
	}

	this.register = function() {
		$http.post('/user/update/', ctrl.curUser)
		.success(function(data) {
			if(data.status === 'success')
			{
				alert('Updated successfully!');
			}
			else
			{
				alert(data.error);
			}
		})
		.error(function(data) {
			alert(JSON.stringify(data));
		})
	}

	this.cancelUpdateProfile = function() {
		window.location.href = '/profile';
	}

	this.status = {
	    isCategoryOpen: false,
	    isLoationOpen: false
	};
});