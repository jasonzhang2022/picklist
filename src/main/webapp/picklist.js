
		
function fxPickList($compile, $templateCache){
	
	/*
	 * what do we need
	 * 1. source options: the ngoptiond
	 * 2. dest inst to put the select values: ng-model
	 */
	return {
		replace:true,
		priority:99,
		templateUrl:"picklist.html",
		restrict: 'E',
		terminal:false,
		scope:true, //do not pollute parent scope
		controller: function($scope, $element, $attrs, $parse){
			
			//size
			$scope.size=$attrs.size;
			if (!angular.isDefined($scope.size)){
				$scope.size=10;
			}
			
			//name
			$scope.formname=$attrs.name;
			
			
			$scope.ngOptions=$attrs.pickOptions;
			
			$scope.ngModel=$attrs.ngModel;
			if (!angular.isDefined($attrs.ngModel)){
				$scope.ngModel=$attrs.pickModel;
			}
			/*
			 * model directive is never processed.
			 * The new ctrl is the subform.
			 */
			 delete($attrs['ngModel']);
	         $element.removeAttr('data-ng-model');
	         $element.removeAttr('ng-model');
			
			
			//hold the selection.
			$scope.picklist_src=[];
			$scope.picklist_dest=[];
			
			// match parsing is from angular js
			var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;
			var match= $scope.ngOptions.match(NG_OPTIONS_REGEXP);
			$scope.srcoptionsExp = match[7];
			var displayFn = $parse(match[2] || match[1]),
			valueName = match[4] || match[6],
			keyName = match[5],
			groupByFn = $parse(match[3] || ''),
			valueFn = $parse(match[2] ? match[1] : valueName),
			valuesFn = $parse(match[7]),
			track = match[8],
			trackFn = track ? $parse(match[8]) : null;
			
			var hasValueFn=match[2]?true:false;
			
			var modelFn=$parse($scope.ngModel);
			var models=modelFn($scope);
			//give models an empty array if needed.
			if (!angular.isDefined(models) || models==null){
				modelFn.assign($scope, []);
			}
			
			  $scope.srcoptions=[];
			  $scope.destoptions=[];
			 
			 
	         $scope.valueToItem=function(value){
	            if (!hasValueFn){
	            	return value;
	            }	
	            return $scope.valueMap[value];
	         };
	       
	        $scope.itemToValue=function(item){
	        	 if (!hasValueFn){
		            	return item;
		           }	
	        	 var local={};
	        	 local[valueName]=item;
	        	return valueFn($scope, local);
	        };
	        //set it to $scope.srcoptions
	        $scope.init=function(){
	        	$scope.srcoptions.length=0;
	        	$scope.destoptions.length=0;
	        	$scope.valueMap={};
	        	
	        	
	        	var getter = $parse($scope.srcoptionsExp);
	        	var options=getter($scope);
	        	if (!options){
	        		return;
	        	}
	        	for(var i=0; i<options.length; i++){
	        		$scope.srcoptions.push(options[i]);
	        		//map option value to object
	        		if (hasValueFn){
	        			var value=$scope.itemToValue(options[i]);
	        			$scope.valueMap[value]=options[i];
	        		}
	        	}
	        	var models=$parse($scope.ngModel)($scope);
	        	angular.forEach(models, function(v){
	        		$scope.destoptions.push($scope.valueToItem(v));
	        	});
	        	$scope.removeLeftFromRight($scope.destoptions, $scope.srcoptions);
	        };
	        
	        
	        $scope.$watchCollection($scope.srcoptionsExp, $scope.init);
	        $scope.$watchCollection($scope.ngModel, $scope.init);
	        
			//always assign to model and expect destoptions is updated from model.
	        //do not update desttoptions to model.
			$scope.rightShift=function(){
				 var models=modelFn($scope);
				for (var i=0; i<$scope.picklist_src.length; i++){
					models.push($scope.itemToValue($scope.picklist_src[i]));
				}
				$scope.removeLeftFromRight($scope.picklist_src, $scope.srcoptions);
				$scope.picklist_src.length=0;
			};
			$scope.rightShiftAll=function(){
				 var models=modelFn($scope);
				for (var i=0; i<$scope.srcoptions.length; i++){
					models.push($scope.itemToValue($scope.srcoptions[i]));
				}
				$scope.picklist_src.length=0;
				$scope.srcoptions.length=0;
			};
			$scope.leftShift=function(){
				 var models=modelFn($scope);
				for (var i=0; i<$scope.picklist_dest.length; i++){
					$scope.srcoptions.push($scope.picklist_dest[i]);
				}
				$scope.removeLeftFromRight($scope.picklist_dest, $scope.destoptions);
				while(models.length>0){
					models.pop();
				}
				angular.forEach($scope.destoptions, function(item){
					models.push($scope.itemToValue(item));
				});
				$scope.picklist_dest.length=0;
			};
			
			$scope.leftShiftAll=function(){
				for (var i=0; i<$scope.destoptions.length; i++){
					$scope.srcoptions.push($scope.destoptions[i]);
				}
				$scope.picklist_dest.length=0;
				$scope.destoptions.length=0;
				while(models.length>0){
					models.pop();
				}
			};
			$scope.arrowUp=function(){
				var idxs=new Array();
				for (var i=0; i<$scope.picklist_dest.length; i++){
					for (var j=0; j<$scope.destoptions.length; j++){
						if($scope.picklist_dest[i]==$scope.destoptions[j]){
							idxs.push(j);
						}
					}
				}
				idxs.sort();
				for (var i=0; i<idxs.length; i++){
					var idx=idxs[i];
					if (idx>0){
						var temp=$scope.destoptions[idx-1];
						$scope.destoptions[idx-1]=$scope.destoptions[idx];
						$scope.destoptions[idx]=temp;
					}
				}
				while(models.length>0){
					models.pop();
				}
				angular.forEach($scope.destoptions, function(item){
					models.push($scope.itemToValue(item));
				});
			};
			$scope.arrowDown=function(){
				var idxs=new Array();
				for (var i=0; i<$scope.picklist_dest.length; i++){
					for (var j=0; j<$scope.destoptions.length; j++){
						if($scope.picklist_dest[i]==$scope.destoptions[j]){
							idxs.push(j);
						}
					}
				}
				idxs.sort();
				for (var i=idxs.length-1; i>=0; i--){
					var idx=idxs[i];
					if (idx<$scope.destoptions.length-1){
						var temp=$scope.destoptions[idx+1];
						$scope.destoptions[idx+1]=$scope.destoptions[idx];
						$scope.destoptions[idx]=temp;
					}
				}
				while(models.length>0){
					models.pop();
				}
				angular.forEach($scope.destoptions, function(item){
					models.push($scope.itemToValue(item));
				});
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
			
			
		},
	};
}


		
function fxPickListForm($compile, $templateCache){
	
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
	};
}

		
function fxPickListSrc($compile, $templateCache){
	
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
			//always use item as value.
			$attrs.ngOptions=$scope.ngOptions.replace($scope.srcoptionsExp, "srcoptions").replace(/^.+\s+as\s+/, "");
		}
	};
}

function fxPickListDest($compile, $templateCache){
	
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
			//always use item as value. real valye is synchoinized to model by watcher function
			$attrs.ngOptions=$scope.ngOptions.replace($scope.srcoptionsExp, "destoptions").replace(/^.+\s+as\s+/, "");
			$attrs.name=$scope.formname+"_dest";
		}
	};
}

var fxPickListTpl=
"			  <div style=\"display: table;width:100%\" data-ng-form=\"fake\" data-picklist-form>"+
"		<div style=\"display: table-row;\">"+
"			<div style=\"display: table-cell; width: 40%;vertical-align: middle;\">"+
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
"			<div style=\"display: table-cell; width: 40%;vertical-align: middle;\">"+
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
;

		

angular.module("fxpicklist", [])
.directive("picklist", fxPickList)
.directive("picklistForm", fxPickListForm)
.directive("picklistSrc", fxPickListSrc) 
.directive("picklistDest", fxPickListDest)
.run(["$templateCache", function($templateCache) {
	 $templateCache.put("picklist.html", fxPickListTpl);
}]);
	 