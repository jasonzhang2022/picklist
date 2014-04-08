angular.module("fxpicklist", []).directive("picklist", function($compile, $templateCache){
	
	/*
	 * what do we need
	 * 1. source options: the ngoptiond
	 * 2. dest inst to put the select values: ng-model
	 */
	return {
		replace:true,
		priority:99,
		templateUrl:"picklist.html",
		restrict: 'A',
		terminal:true,
		scope:true, //do not pollute parent scope
		controller: function($scope, $element, $attrs, $parse){
			$scope.size=$attrs.size
			if (!angular.isDefined($scope.size)){
				$scope.size=10;
			}
			$scope.formname=$attrs.name;
			$scope.ngOptions=$attrs.ngOptions;
			$scope.ngModel=$attrs.ngModel;
			
			$scope.picklist_src=[];
			$scope.picklist_dest=[];
			var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;
			//
			$scope.srcoptionsExp = $scope.ngOptions.match(NG_OPTIONS_REGEXP)[7];
			
			$scope.rightShift=function(){
				var models=$parse($scope.ngModel)($scope);
				for (var i=0; i<$scope.picklist_src.length; i++){
					models.push($scope.picklist_src[i]);
				}
				$scope.removeLeftFromRight($scope.picklist_src, $scope.srcoptions);
				$scope.picklist_src=[];
			};
			$scope.rightShiftAll=function(){
				var models=$parse($scope.ngModel)($scope);
				for (var i=0; i<$scope.srcoptions.length; i++){
					models.push($scope.srcoptions[i]);
				}
				$scope.picklist_src=[];
				while($scope.srcoptions.length>0){
					$scope.srcoptions.pop();
				}
			};
			$scope.leftShift=function(){
				for (var i=0; i<$scope.picklist_dest.length; i++){
					$scope.srcoptions.push($scope.picklist_dest[i]);
				}
				var models=$parse($scope.ngModel)($scope);
				$scope.removeLeftFromRight($scope.picklist_dest, models);
			};
			
			$scope.leftShiftAll=function(){
				var models=$parse($scope.ngModel)($scope);
				for (var i=0; i<models.length; i++){
					$scope.srcoptions.push(models[i]);
				}
				$scope.picklist_dest=[];
				//do not call this
				while(models.length>0){
					models.pop();
				}
			};
			$scope.arrowUp=function(){
				var models=$parse($scope.ngModel)($scope);
				var idxs=[];
				for (var i=0; i<$scope.picklist_dest.length; i++){
					for (var j=0; j<models.length; j++){
						if($scope.picklist_dest[i]==models[j]){
							idxs.push(j);
						}
					}
				}
				idxs.sort();
				for (var i=0; i<idxs.length; i++){
					var idx=idxs[i];
					if (idx>0){
						var temp=models[idx-1];
						models[idx-1]=models[idx];
						models[idx]=temp;
					}
				}
			};
			$scope.arrowDown=function(){
				var models=$parse($scope.ngModel)($scope);
				var idxs=[];
				for (var i=0; i<$scope.picklist_dest.length; i++){
					for (var j=0; j<models.length; j++){
						if($scope.picklist_dest[i]==models[j]){
							idxs.push(j);
						}
					}
				}
				idxs.sort();
				for (var i=idxs.length-1; i>=0; i--){
					var idx=idxs[i];
					if (idx<models.length-1){
						var temp=models[idx+1];
						models[idx+1]=models[idx];
						models[idx]=temp;
					}
				}
				
			};
			
			
			/**
			 * Remove from right all elements in left;
			 */
			$scope.removeLeftFromRight=function(left, right){
				for(var i=0; i<left.length; i++){
					for (var j=0; j<right.length; j++){
						if (left[i]===right[j]){
							right.splice(j, 1);
							break;
						}
					}
				}
			};
			
			$scope.srcoptions=[];
			//set it to $scope.srcoptions
			$scope.init=function(){
				var getter = $parse($scope.srcoptionsExp);
				var options=getter($scope);
				while($scope.srcoptions.length>0){
					$scope.srcoptions.pop();
				}
				for(var i=0; i<options.length; i++){
					$scope.srcoptions.push(options[i]);
				}
				var models=$parse($scope.ngModel)($scope);
				$scope.removeLeftFromRight(models, $scope.srcoptions);
			};
			//TODO remove watcher during destruction.
			$scope.$watchCollection($scope.srcoptionsExp, $scope.init);
			$scope.$watchCollection($scope.ngModel, $scope.init);
		},
	}
}).directive("picklistForm", function($compile, $templateCache){
	
	/*
	 * what do we need
	 * 1. source options: the ngoptiond
	 * 2. dest inst to put the select values: ng-model
	 */
	return {
		require: "^picklist",
		priority:99,
		restrict: 'A',
		controller: function($scope, $element, $attrs){
			if (angular.isDefined($attrs.ngForm) && angular.isDefined($scope.formname)){
				$attrs.ngForm=$scope.formname;
			}
			
		}
	}
}).directive("picklistSrc", function($compile, $templateCache){
	
	/*
	 * what do we need
	 * 1. source options: the ngoptiond
	 * 2. dest inst to put the select values: ng-model
	 */
	return {
		require: "^picklist",
		priority:99,
		restrict: 'A',
		controller: function($scope, $element, $attrs){
			$attrs.ngOptions=$scope.ngOptions;
			$attrs.size=$scope.size;
			$element.attr("size", $scope.size);
			$attrs.name=$scope.formname+"_src";
			$attrs.ngOptions=$scope.ngOptions.replace($scope.srcoptionsExp, "srcoptions");
			
			
		}
	}
}).directive("picklistDest", function($compile, $templateCache){
	
	/*
	 * what do we need
	 * 1. source options: the ngoptiond
	 * 2. dest inst to put the select values: ng-model
	 */
	return {
		require: "^picklist",
		priority:99,
		restrict: 'A',
		controller: function($scope, $element, $attrs){
			$attrs.size=$scope.size;
			$element.attr("size", $scope.size);
			$attrs.ngOptions=$scope.ngOptions.replace($scope.srcoptionsExp, $scope.ngModel);
			$attrs.name=$scope.formname+"_dest";
		}
	}
}).run(["$templateCache", function($templateCache) {
	  $templateCache.put("picklist.html", 
"			  <div style=\"display: table;\" data-ng-form=\"fake\" data-picklist-form>"+
"		<div style=\"display: table-row;\">"+
"			<div style=\"display: table-cell; width: 40%;\">"+
"				<select multiple size=\"5\" class=\"form-control\" data-ng-options=\"fake\" name=\"fake\" data-ng-model=\"picklist_src\" data-picklist-src>"+
"				</select>"+
"			</div>"+
"			<div style=\"display: table-cell; width: 10%; vertical-align: middle;\" class=\"btn-group-vertical\">"+
"				<div>"+
"					<button type=\"button\" class=\"btn btn-info\" data-ng-click=\"rightShift();\">"+
"						<span class=\"glyphicon glyphicon-step-forward\"></span>"+
"					</button>"+
"				</div>"+
"				<div>"+
"					<button type=\"button\" class=\"btn btn-default\" data-ng-click=\"rightShiftAll();\">"+
"						<span class=\"glyphicon glyphicon-fast-forward\"></span>"+
"					</button>"+
"				</div>"+
"				<div>"+
"					<button type=\"button\" class=\"btn btn-info\" data-ng-click=\"leftShift();\">"+
"						<span class=\"glyphicon glyphicon-step-backward\"></span>"+
"					</button>"+
"				</div>"+
"				<div>"+
"					<button type=\"button\" class=\"btn btn-default\" data-ng-click=\"leftShiftAll();\">"+
"						<span class=\"glyphicon glyphicon-fast-backward\"></span>"+
"					</button>"+
"				</div>"+
"			</div>"+
"			<div style=\"display: table-cell; width: 40%;\">"+
"				<select multiple size=\"5\" class=\"form-control\" data-ng-options=\"fake\" name=\"fake\" data-ng-model=\"picklist_dest\" data-picklist-dest>"+
"				</select>"+
"			</div>"+
"			<div style=\"display: table-cell; width: 10%; vertical-align: middle;\" class=\"btn-group-vertical\">"+
"				<div>"+
"					<button type=\"button\" class=\"btn btn-default\" data-ng-click=\"arrowUp();\">"+
"						<span class=\"glyphicon glyphicon-arrow-up\"></span>"+
"					</button>"+
"				</div>"+
"				<div>"+
"					<button type=\"button\" class=\"btn btn-default\" data-ng-click=\"arrowDown();\">"+
"						<span class=\"glyphicon glyphicon-arrow-down\"></span>"+
"					</button>"+
"				</div>"+
"			</div>"+
"		</div>"+
"	</div>	  "
	  
	  );
			  
}]);
