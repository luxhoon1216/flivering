app.controller('registerController', function($http, $location) {
	var ctrl = this;
	this.bShowEmail = false;
	this.bShowCategory = false;
	this.bShowLocation = false;
	this.emailMsg = '';
	this.newUser = {};
	this.newUser.categories = [];
	this.newUser.locations = [];

	this.init = function() {
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

	this.addCategory = function() {
		ctrl.categoryMsg = '';
		var isExist = false;
		ctrl.newUser.categories.forEach(function(category) {
			if(category.key === ctrl.selectedCategory.key) {
				isExist = true;
			}
		});

		if(!isExist)
		{
			ctrl.newUser.categories.push({key: ctrl.selectedCategory.key, value: ctrl.selectedCategory.value});
		}
		else
		{
			ctrl.categoryMsg = ctrl.selectedCategory.value + ' was already added';
		}
	};

	this.deleteCategory = function(c) {
		for(i = 0; i < ctrl.newUser.categories.length; i++)
		{
			if(ctrl.newUser.categories[i].key === c.key)
			{
				ctrl.newUser.categories.splice(i, 1);
				break;
			}
		}
	};

	this.addLocation = function() {
		ctrl.locationMsg = '';
		var isExist = false;
		ctrl.newUser.locations.forEach(function(location) {
			if(location.key === ctrl.selectedLocation.key) {
				isExist = true;
			}
		});

		if(!isExist)
		{
			ctrl.newUser.locations.push({key: ctrl.selectedLocation.key, value: ctrl.selectedLocation.value});
		}
		else
		{
			ctrl.locationMsg = ctrl.selectedLocation.value + ' was already added';
		}
	};

	this.deleteLocation = function(c) {
		for(i = 0; i < ctrl.newUser.locations.length; i++)
		{
			if(ctrl.newUser.locations[i].key === c.key)
			{
				ctrl.newUser.locations.splice(i, 1);
				break;
			}
		}
	};

	this.register = function() {
		ctrl.usernameMsg = '';
		ctrl.passwordMsg = '';
		ctrl.tmppasswordMsg = '';
		ctrl.firstnameMsg = '';
		ctrl.lastnameMsg = '';
		ctrl.emailMsg = '';
		if(!ctrl.newUser.username || ctrl.newUser.username.length == 0)
		{
			ctrl.usernameMsg = 'please enter user id';
			return;
		}

		if(!ctrl.newUser.password || ctrl.newUser.password.length == 0)
		{
			ctrl.passwordMsg = 'please enter password';
			return;
		}

		if(!ctrl.tmppassword || ctrl.tmppassword.length == 0)
		{
			ctrl.tmppasswordMsg = 'please confirm password';
			return;
		}

		if(!ctrl.newUser.firstname || ctrl.newUser.firstname.length == 0)
		{
			ctrl.firstnameMsg = 'please enter first name';
			return;
		}

		if(!ctrl.newUser.lastname || ctrl.newUser.lastname.length == 0)
		{
			ctrl.lastnameMsg = 'please enter last name';
			return;
		}

		if(!ctrl.newUser.email || ctrl.newUser.email.length == 0)
		{
			ctrl.emailMsg = 'please enter email';
			return;
		}

		if(ctrl.newUser.password != ctrl.tmppassword)
		{
			ctrl.tmppasswordMsg = 'passwords do not match';
			return;
		}
		else
		{
			$http.post('/user/isUsernameExist', {username: ctrl.newUser.username})
			.success(function(data) {
				if(data.status === 'success')
				{
					if(data.result)
					{
						ctrl.usernameMsg = 'the user id already exists';
						return;
					}
					else
					{
						$http.post('/user/isEmailExist', {email: ctrl.newUser.email})
						.success(function(data) {
							if(data.status === 'success')
							{
								if(data.result)
								{
									ctrl.emailMsg = 'the email address already exists';
									return;
								}
								else
								{
									$http.post('/user/create/', ctrl.newUser)
									.success(function(data) {
										if(data.status === 'success')
										{
											alert('Registered successfully!');
											window.location.href = '/need';
										}
										else
										{
											alert(data.error);
										}
									})
									.error(function(data) {
										alert(data.error);
									})
								}
							}
						});
					}
				}
			});
		}
	};

	this.status = {
	    isCategoryOpen: false,
	    isLoationOpen: false
	};
});