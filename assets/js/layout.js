app.controller('layoutController', function($rootScope) {
	var ctrl = this;
	this.activeTopMenuIndex = 0;

	getUserObject();

	this.setActiveTopMenu = function(index) {
		ctrl.activeTopMenuIndex = index;
	}

	this.isTopMenuActive = function(index)
	{
		return (ctrl.activeTopMenuIndex == index);
	}
});
