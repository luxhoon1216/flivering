app.controller('userController', function($http) {
	var ctrl = this;
	this.signinMsg = '';
	this.signinfo = {};
	this.signinfo.username = '';
	this.signinfo.password = '';

	this.signin = function() {
		if(ctrl.signinfo.username == null || ctrl.signinfo.username.length == 0)
		{
			ctrl.signinMsg = 'enter use name';
		}
		else if(ctrl.signinfo.password == null || ctrl.signinfo.password.length == 0)
		{
			ctrl.signinMsg = 'enter password';
		}
		else
		{
			$http.post('/signin', ctrl.signinfo)
			.success(function(data) {
				if(data.status === 'success')
				{
					var bHasReturnURL = false;
					var query = location.search.split('?')[1];
					if(query)
					{
						var splitQuery = query.split('&');
						if(splitQuery.length > 0)
						{
							
							for(i = 0; i < splitQuery.length; i++) {
								var splitOption = splitQuery[i].split('=');
								if(splitOption.length == 2)
								{
									if(splitOption[0] === 'returnURL')
									{
										window.location.href = splitOption[1];
										bHasReturnURL = true;
										break;
									}
								}
							}
						}
					}
					
					if(!bHasReturnURL)
					{
						window.location.href = '/need';
					}
				}
				else
				{
					ctrl.signinMsg = data.msg;
				}
			});
		}
	};
});