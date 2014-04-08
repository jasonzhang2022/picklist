
describe(
		"test inst directives.js",
		function() {
			angular.module("testapp", ['fxpicklist']);
			var $rootScope = null;
			var $http = null;
			var $controller = null;
			var $myInjector = null;
			var $compile = null;

			// Load the myApp module, which contains the directive
			beforeEach(module('testapp'));

			// Store references to $rootScope and $compile
			// so they are available to all tests in this describe block
			beforeEach(inject(function($injector) {

				$http = $injector.get("$httpBackend");
				$rootScope = $injector.get("$rootScope");
				$controller = $injector.get('$controller');
				$myInjector = $injector;
				$compile = $injector.get("$compile");
			}));

			afterEach(function() {
				$http.verifyNoOutstandingRequest();
				$http.verifyNoOutstandingExpectation();
			});
			function setupPickListTestScope(){
				$scope=$rootScope.$new();
				
				$scope.toptions=new Array();
				
				for(var i=0; i<10; i++){
					$scope.toptions.push({
						name: " display name"+i,
						value: "value"+i, 
						index: i
					});
				}
				
				$scope.tselected=[$scope.toptions[4], $scope.toptions[5]];
				return $scope;
			}

			
			it("pick list: test initialization", function() {
				var templateCache = $myInjector.get("$templateCache");
				var template="<form name='test'>" +
						"<select name='pktest'  size='20' data-ng-options='v.name for v in toptions' data-picklist data-ng-model='tselected'/>" +
						"</form>"
						;
				var $compile=$myInjector.get("$compile");
				var $scope=setupPickListTestScope();
			
				
				//DO we have template
				expect(templateCache.get("picklist.html")).toBeDefined();
				
				//intialization
				element=$compile(template)($scope);
				$scope.$digest();
				
				//make sure all state is set correctly.
				var first=angular.element(element.find("select")[0]);
				var second=angular.element(element.find("select")[1]);
				expect(first.find("option").length).toBe(8);
				expect(second.find("option").length).toBe(2);
				

			});
			it("pick list: observe original options", function() {
				var templateCache = $myInjector.get("$templateCache");
				var template="<form name='test'>" +
						"<select name='pktest'  size='20' data-ng-options='v.name for v in toptions' data-picklist data-ng-model='tselected'/>" +
						"</form>"
						;
				var $compile=$myInjector.get("$compile");
				var $scope=setupPickListTestScope();
			
				
				//DO we have template
				expect(templateCache.get("picklist.html")).toBeDefined();
				
				//intialization
				element=$compile(template)($scope);
				$scope.$digest();
				
				//make sure all state is set correctly.
				var first=angular.element(element.find("select")[0]);
				var second=angular.element(element.find("select")[1]);
				var pickscope=first.scope();
				
				$scope.toptions.pop();
				$scope.toptions.pop();
				$scope.$digest();
				expect(pickscope.srcoptions.length).toBe(6);
				expect(first.find("option").length).toBe(6);
				
			});
			
			it("pick list: observe model", function() {
				var templateCache = $myInjector.get("$templateCache");
				var template="<form name='test'>" +
						"<select name='pktest'  size='20' data-ng-options='v.name for v in toptions' data-picklist data-ng-model='tselected'/>" +
						"</form>"
						;
				var $compile=$myInjector.get("$compile");
				var $scope=setupPickListTestScope();
			
				
				//DO we have template
				expect(templateCache.get("picklist.html")).toBeDefined();
				
				//intialization
				element=$compile(template)($scope);
				$scope.$digest();
				
				//make sure all state is set correctly.
				var first=angular.element(element.find("select")[0]);
				var second=angular.element(element.find("select")[1]);
				var pickscope=first.scope();
				
				$scope.tselected.pop();
				$scope.$digest();
				expect(pickscope.srcoptions.length).toBe(9);
				expect(first.find("option").length).toBe(9);
				expect(second.find("option").length).toBe(1);
				
				
				$scope.tselected.push($scope.toptions[1]);
				$scope.$digest();
				expect(pickscope.srcoptions.length).toBe(8);
				expect(first.find("option").length).toBe(8);
				expect(second.find("option").length).toBe(2);
				
			});
			it("pick list: right shift", function() {
				var templateCache = $myInjector.get("$templateCache");
				var template="<form name='test'>" +
						"<select name='pktest'  size='20' data-ng-options='v.name for v in toptions' data-picklist data-ng-model='tselected'/>" +
						"</form>"
						;
				var $compile=$myInjector.get("$compile");
				var $scope=setupPickListTestScope();
			
				
				//DO we have template
				expect(templateCache.get("picklist.html")).toBeDefined();
				
				//intialization
				element=$compile(template)($scope);
				$scope.$digest();
				
				var first=angular.element(element.find("select")[0]);
				var second=angular.element(element.find("select")[1]);
				
				var pickscope=first.scope();
				
				//-------------right shift;
				var firstopt=pickscope.srcoptions[1];
				pickscope.picklist_src.push(firstopt);
				pickscope.rightShift();
				$scope.$digest();
				
				
				expect(first.find("option").length).toBe(7);
				expect(second.find("option").length).toBe(3);
				expect($scope.tselected.length).toBe(3);
				expect($scope.tselected[2]).toBe(firstopt);
				
				//-----------right shift all
				pickscope.rightShiftAll();
				$scope.$digest();
				
				
				expect(first.find("option").length).toBe(0);
				expect(second.find("option").length).toBe(10);
				expect($scope.tselected.length).toBe(10);
				
			});
			
			it("pick list: left shift", function() {
				var templateCache = $myInjector.get("$templateCache");
				var template="<form name='test'>" +
						"<select name='pktest'  size='20' data-ng-options='v.name for v in toptions' data-picklist data-ng-model='tselected'/>" +
						"</form>"
						;
				var $compile=$myInjector.get("$compile");
				var $scope=setupPickListTestScope();
			
				
				//DO we have template
				expect(templateCache.get("picklist.html")).toBeDefined();
				
				//intialization
				element=$compile(template)($scope);
				$scope.$digest();
				
				var first=angular.element(element.find("select")[0]);
				var second=angular.element(element.find("select")[1]);
				
				var pickscope=first.scope();
				
				//-------------left shift;
				var firstopt=pickscope.tselected[0];
				pickscope.picklist_dest.push(firstopt);
				pickscope.leftShift();
				$scope.$digest();
				
				
				expect(first.find("option").length).toBe(9);
				expect(second.find("option").length).toBe(1);
				expect($scope.tselected.length).toBe(1);
				expect($scope.tselected[0]).toBe($scope.toptions[5]);
				
				
				//-----------left shift all: one element
				pickscope.leftShiftAll();
				$scope.$digest();
				
				expect(first.find("option").length).toBe(10);
				expect(second.find("option").length).toBe(0);
				expect($scope.tselected.length).toBe(0);
				
				//-----------left shift all: many element
				pickscope.rightShiftAll();
				$scope.$digest();
				pickscope.leftShiftAll();
				$scope.$digest();
				
				expect(first.find("option").length).toBe(10);
				expect(second.find("option").length).toBe(0);
				expect($scope.tselected.length).toBe(0);
			});
			
			it("pick list: up", function() {
				var templateCache = $myInjector.get("$templateCache");
				var template="<form name='test'>" +
						"<select name='pktest'  size='20' data-ng-options='v.name for v in toptions' data-picklist data-ng-model='tselected'/>" +
						"</form>"
						;
				var $compile=$myInjector.get("$compile");
				var $scope=setupPickListTestScope();
			
				
				//DO we have template
				expect(templateCache.get("picklist.html")).toBeDefined();
				
				//intialization
				element=$compile(template)($scope);
				$scope.$digest();
				
				var first=angular.element(element.find("select")[0]);
				var second=angular.element(element.find("select")[1]);
				
				var pickscope=first.scope();
				
				//-----------has all elements in model
				while($scope.tselected.length>0){
					$scope.tselected.pop();
				}
				for (var i=0; i<$scope.toptions.length; i++){
					$scope.tselected.push($scope.toptions[i]);
				}
				$scope.$digest();
				
				//right now we have 10 element
				pickscope.picklist_dest.push($scope.toptions[1]);
				pickscope.picklist_dest.push($scope.toptions[3]);
				
				
				
				pickscope.arrowUp();
				$scope.$digest();
				
				expect($scope.tselected[0]).toBe($scope.toptions[1]);
				expect($scope.tselected[1]).toBe($scope.toptions[0]);
				expect($scope.tselected[2]).toBe($scope.toptions[3]);
				expect($scope.tselected[3]).toBe($scope.toptions[2]);
			});
			it("pick list: up edge case", function() {
				var templateCache = $myInjector.get("$templateCache");
				var template="<form name='test'>" +
						"<select name='pktest'  size='20' data-ng-options='v.name for v in toptions' data-picklist data-ng-model='tselected'/>" +
						"</form>"
						;
				var $compile=$myInjector.get("$compile");
				var $scope=setupPickListTestScope();
			
				
				//DO we have template
				expect(templateCache.get("picklist.html")).toBeDefined();
				
				//intialization
				element=$compile(template)($scope);
				$scope.$digest();
				
				var first=angular.element(element.find("select")[0]);
				var second=angular.element(element.find("select")[1]);
				
				var pickscope=first.scope();
				
				//-----------left shift all: many element
				//-----------has all elements in model
				while($scope.tselected.length>0){
					$scope.tselected.pop();
				}
				for (var i=0; i<$scope.toptions.length; i++){
					$scope.tselected.push($scope.toptions[i]);
				}
				$scope.$digest();
				
				//right now we have 10 element
				pickscope.picklist_dest.push($scope.toptions[0]);
				pickscope.picklist_dest.push($scope.toptions[3]);
				
				
				
				pickscope.arrowUp();
				$scope.$digest();
				//frist element  does not move
				expect($scope.tselected[0]).toBe($scope.toptions[0]);
				expect($scope.tselected[1]).toBe($scope.toptions[1]);
				expect($scope.tselected[2]).toBe($scope.toptions[3]);
				expect($scope.tselected[3]).toBe($scope.toptions[2]);
			});
			it("pick list: down", function() {
				var templateCache = $myInjector.get("$templateCache");
				var template="<form name='test'>" +
						"<select name='pktest'  size='20' data-ng-options='v.name for v in toptions' data-picklist data-ng-model='tselected'/>" +
						"</form>"
						;
				var $compile=$myInjector.get("$compile");
				var $scope=setupPickListTestScope();
			
				
				//DO we have template
				expect(templateCache.get("picklist.html")).toBeDefined();
				
				//intialization
				element=$compile(template)($scope);
				$scope.$digest();
				
				var first=angular.element(element.find("select")[0]);
				var second=angular.element(element.find("select")[1]);
				
				var pickscope=first.scope();
				
				//-----------left shift all: many element
				//-----------has all elements in model
				while($scope.tselected.length>0){
					$scope.tselected.pop();
				}
				for (var i=0; i<$scope.toptions.length; i++){
					$scope.tselected.push($scope.toptions[i]);
				}
				$scope.$digest();
				
				//right now we have 10 element
				pickscope.picklist_dest.push($scope.toptions[1]);
				pickscope.picklist_dest.push($scope.toptions[3]);
				
				
				
				pickscope.arrowDown();
				$scope.$digest();
				
				expect($scope.tselected[0]).toBe($scope.toptions[0]);
				expect($scope.tselected[1]).toBe($scope.toptions[2]);
				expect($scope.tselected[2]).toBe($scope.toptions[1]);
				expect($scope.tselected[3]).toBe($scope.toptions[4]);
				expect($scope.tselected[4]).toBe($scope.toptions[3]);
			});
			it("pick list: down edge case", function() {
				var templateCache = $myInjector.get("$templateCache");
				var template="<form name='test'>" +
						"<select name='pktest'  size='20' data-ng-options='v.name for v in toptions' data-picklist data-ng-model='tselected'/>" +
						"</form>"
						;
				var $compile=$myInjector.get("$compile");
				var $scope=setupPickListTestScope();
			
				
				//DO we have template
				expect(templateCache.get("picklist.html")).toBeDefined();
				
				//intialization
				element=$compile(template)($scope);
				$scope.$digest();
				
				var first=angular.element(element.find("select")[0]);
				var second=angular.element(element.find("select")[1]);
				
				var pickscope=first.scope();
				
				//-----------left shift all: many element
				//-----------has all elements in model
				while($scope.tselected.length>0){
					$scope.tselected.pop();
				}
				for (var i=0; i<$scope.toptions.length; i++){
					$scope.tselected.push($scope.toptions[i]);
				}
				$scope.$digest();
				
				//right now we have 10 element
				pickscope.picklist_dest.push($scope.toptions[7]);
				pickscope.picklist_dest.push($scope.toptions[9]);
				
				
				
				pickscope.arrowDown();
				$scope.$digest();
				
				expect($scope.tselected[9]).toBe($scope.toptions[9]);
				expect($scope.tselected[7]).toBe($scope.toptions[8]);
				expect($scope.tselected[8]).toBe($scope.toptions[7]);
			});
});
