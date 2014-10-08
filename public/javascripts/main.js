/* 
* created by: momen_bhuiyan@yahoo.com
* date: 07-10-14
* remember: 1. localize strict
* 2. call apply to change model in view
* 3. usemin
* 4. jquery independent
* 5. efficiency over simplicity
* License: MIT.
*/

// todo:1. connect pattern database with estimation
// 2. separate game module
// 3. solution possibility check from wiki.mathematica
// 4. add random move on same thing again and again
// 5. add module for synchronous and asynchronous actions
// 6. add issues to an extra file
// 7. work on tdd instead of issue
// 8. rename all variable and function
angular.module('npuzzleApp', [])
    .controller('appController', ['$window','$document','$scope','$http', function($window,$document,$scope,$http) {
        'use strict';

        // init variables
        $scope._row=4; //default row number
        $scope._column=4; //default column number
        $scope._playing_mode=-1; //current playing mode
        $scope._vals=[]; //current array stat
        $scope._timer_var; //static to prevent mutiple run
        $scope.TIMEOUT=500; //default autoplay step time
        $scope._step_count=0; //played step count
        $scope._disable_i=false; //for synchronous actions
        $scope.SPEED_OPTIONS=[1,2,3,4]; //default speed options
        $scope._play_speed=1; //current speed
        $scope._p_d=[]; //pattern database
        $scope.PLAYING_MODES={"-1":"none","1":"autoplay","2":"manual play"};//playing modes
        $scope.EVENT_LIST={"timer":0x1001,"keypress":0x1002};
        $scope.PD_LEN=10096; // pattern database search length

        // call before changing aything 
        $scope.clear_all_event=function () {
            $document.unbind("keyup",$scope.keypressed);
            $window.clearInterval($scope._timer_var);
            $scope._step_count=0;
        };

        // starts the auto play timer
        $scope.start_listening_for=function(_event_type){
            $scope.clear_all_event();
            //console.log($scope.speed);
            if($scope.EVENT_LIST[_event_type]==0x1001)$scope._timer_var=$window.setInterval($scope.play_one_step,(+$scope.TIMEOUT/+$scope._play_speed));
            else if($scope.EVENT_LIST[_event_type]==0x1002)$document.bind("keyup",$scope.keypressed);
        }

        // disable input while changing parameter
        // needed for bigger pattern database
        $scope.toggle_input_disable=function(){
            $scope._disable_i=!$scope._disable_i;
        }

        // called at parameter change of the matrix height and width
        $scope.param_change=function(){
            if($scope._column>0 && $scope._row>0){
                $scope.toggle_input_disable();
                $scope.clear_all_event();
                var _arr=[];
                var _mod=$scope._column*$scope._row;
                for (var _i = 1; _i < _mod; _i++) {
                   _arr.push(_i);
                };
                _arr.push(" ");
                $scope._vals=_arr;
                $scope._divs=$scope._column;
                $scope._p_d=$scope.gen_dictionary();
                $scope._p_d_p=$scope._p_d[0];
                $scope._p_d_h=$scope._p_d[1];
                $scope._p_d_m=$scope._p_d[2];
                $scope.toggle_input_disable();
            }
            
        }

        // generate random state of the board
        // todo: use any distribution e.g. poisson or normal
        $scope.gen_random=function () {
            if($scope._column>0 && $scope._row>0){
                $scope.clear_all_event();
                var _arr=[];
                var _temp,_ok;
                var _mod=$scope._column*$scope._row;
                for (var _i = 0; _i < _mod; _i++) {
                    while(true){
                        _temp=(Math.floor(Math.random()*10000))%_mod;
                        if (_temp==0) {_temp=" ";};
                        _ok=true;
                        // costly in worst case
                        // remove this by hashing
                        for (var _j = 0; _j < _arr.length; _j++) {
                            if(_arr[_j]==_temp){_ok=false;break;}
                        };
                        if(_ok){_arr.push(_temp);break;}
                    }
                }
                $scope._vals=_arr;
                $scope._divs=$scope._column;
            }
        };

        // called on auto play button click
        $scope.auto_play=function () {
            $scope._playing_mode=1;
            $scope.start_listening_for("timer");
        }

        // called on manual play button click
        // use arrow keys to play
        $scope.manual_play=function () {
            $scope._playing_mode=2;
            $scope.start_listening_for("keypress");
        }

        // timer auto play function 
        $scope.play_one_step=function () {
            // test random
            //$scope.random_play();
            // test current distance if 0 return
            var _curr_distance=$scope.calc_manhattan_distance($scope._vals);
            if(!_curr_distance){$scope.clear_all_event();return;}
            // do pattern search if found play or do estimation
            var _ans=$scope.do_pattern_search()
            if(_ans){$scope.play_next_step(_ans,$scope._vals);}
            else $scope.play_next_step($scope.estimate_next(_curr_distance),$scope._vals);
            $scope._step_count++;
            $scope.$apply();
        }

        // random autoplay function
        $scope.random_play=function(){
            var _temp=(Math.floor(Math.random()*10000))%4;
            if(_temp==0)$scope.play_next_step("Down",$scope._vals);
            if(_temp==1)$scope.play_next_step("Up",$scope._vals);
            if(_temp==2)$scope.play_next_step("Right",$scope._vals);
            if(_temp==3)$scope.play_next_step("Left",$scope._vals);
            $scope.$apply();
        }

        // keypress event handler in manual play
        $scope.keypressed=function (event) {
            if(event.keyIdentifier=="Down"||event.keyIdentifier=="Up"||event.keyIdentifier=="Right"||event.keyIdentifier=="Left"){
                event.preventDefault();
                event.stopPropagation();
                var _arrow=event.keyIdentifier;
                $scope.play_next_step(_arrow,$scope._vals);
                $scope._step_count++;
                $scope.$apply();
            }
            return false;
        }

        // play one step function
        // arguments: arrow and current array
        // made generic
        $scope.play_next_step=function (_arrow,_arr) {
            for (var _i = 0; _i < _arr.length; _i++) {
                if(_arr[_i]==" "){
                    if(_arrow=="Down"&&_i-$scope._column>=0){
                        //console.log("d");
                        _arr[_i]=_arr[_i-$scope._column];
                        _arr[_i-$scope._column]=" ";
                    }
                    else if(_arrow=="Up"&&_i+$scope._column<$scope._column*$scope._row){
                        //console.log("u");
                        _arr[_i]=_arr[_i+$scope._column];
                        _arr[_i+$scope._column]=" ";
                    }
                    else if(_arrow=="Right"&&_i>Math.floor(_i/$scope._column)*($scope._column)){
                        //console.log("r");
                        _arr[_i]=_arr[_i-1];
                        _arr[_i-1]=" ";
                    }
                    else if(_arrow=="Left"&&_i+1<(Math.floor(_i/$scope._column)+1)*($scope._column)){
                        //console.log("l");
                        _arr[_i]=_arr[_i+1];
                        _arr[_i+1]=" ";
                    }
                    break;
                }
            };
            
        }

        //calculate x,y index of a position
        $scope.calc_pos=function (_pos) {
            var _x=(_pos%$scope._column);
            var _y=Math.floor(_pos/$scope._column);
            return [_x,_y];
        }

        // calcualate manhattan distance of an array of n-puzzle
        $scope.calc_manhattan_distance=function(_arr,_from){
            var _ans=0,_should_be,_currently_in,_k;
            for (var _i = 0; _i < _arr.length; _i++) {
                if(_arr[_i]!=" " && _arr[_i]-1!=_i){
                    if(_from){
                        for(_k=0;_k<_from.length;_k++)
                            if(_from[_k]==_arr[_i])break;
                        _should_be=$scope.calc_pos(_k);
                    }
                    else _should_be=$scope.calc_pos(_arr[_i]-1);
                    _currently_in=$scope.calc_pos(_i);
                    _ans+=Math.abs(_should_be[0]-_currently_in[0])+Math.abs(_should_be[1]-_currently_in[1]);
                }
            }
            return _ans;
        }

        // pattern search on the database if found returns next move
        $scope.do_pattern_search=function(){
            if($scope._p_d_h[$scope._vals]){
                return $scope._p_d_m[$scope._p_d_h[$scope._vals]];
            }
            return false;
        } 

        // estimation function of next step
        // currently based on four posible step
        // todo: add intelligent decision making
        // this is the main task
        $scope.estimate_next=function (_base) {
            var _dist=[];
            var DIRECTIONS=["Down","Up","Right","Left"];
            var _does_change=[];
            for (var _sign in DIRECTIONS){
                var _arr=[];
                for (var _i = 0; _i < $scope._vals.length; _i++) {
                    _arr.push($scope._vals[_i]);
                };
                $scope.play_next_step(DIRECTIONS[_sign],_arr);
                _does_change.push(0);
                for (var _j = 0; _j < _arr.length; _j++) {
                    if(_arr[_j]!=$scope._vals[_j]){_does_change[_does_change.length-1]=1;break;}
                };
                _dist.push($scope.calc_manhattan_distance(_arr));
            }
            //console.log(does_change);
            var _minErr=100000,_which=0;
            for (var _i = 0; _i < _dist.length; _i++) {
                if(_dist[_i]<_minErr&&_does_change[_i])_minErr=_dist[_i],_which=_i;
            }
            //console.log("found next move "+directions[which]);
            return DIRECTIONS[_which];

        }

        // generate pattern database
        // called from param_change
        $scope.gen_dictionary=function () {
            var _n=$scope._row,_m=$scope._column;
            var DIRECTIONS=["Down","Up","Right","Left"];
            var I_DIRECTIONS=["Up","Down","Left","Right"];
            var _arr=[];
            for (var _i = 0; _i < _m*_n-1; _i++) {
                _arr.push(_i+1);
            };
            _arr.push(" ");
            var _patterns=[];
            var _pattern_moves=[];
            _patterns.push(_arr);
            var _hash={};//hash_count=0;
            _hash[_arr]=1;//hash_count++;
            for (var _i = 0;_i<_patterns.length && _i < $scope.PD_LEN; _i++) {
                for (var _k = 0; _k < 4; _k++) {
                    var _arr1=[];
                    for (var _j = 0; _j < _patterns[_i].length; _j++) {
                        _arr1.push(_patterns[_i][_j]);
                    }
                    $scope.play_next_step(DIRECTIONS[_k],_arr1);
                    if(_hash[_arr1])continue;
                    // value of current state
                    _patterns.push(_arr1);
                    //hash_count++;
                    _pattern_moves.push(I_DIRECTIONS[_k]);
                    _hash[_arr1]=_pattern_moves.length-1;
                };
            }
            //console.log(patterns);
            //not now
            return [_patterns,_hash,_pattern_moves];
        }

        // manual call
        $scope.param_change();
    }]);