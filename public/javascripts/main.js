/* 
* created by: momen_bhuiyan@yahoo.com
* date: 07-10-14
* version info:
* angular version="1.2.9"
* node version="0.10.29"
* dependency as defined in package.json
* remember: 1. localize strict
*           2. call apply to apply model change
*           3. usemin
*           4. jquery independent
*           5. efficiency over simplicity
* License: MIT.
*/

/*
* changelog:    1.generate algorithm for problem #im #solvedincpp
*               2.solution possibility check from wiki.mathematica #im #doesnotwork
*               3.connect pattern database with estimation #im
*/

// todo:1. separate game module #ig
//      2. add random move on cyclic move #im #notworkingforlongpath
//      3. add module for synchronous and asynchronous actions #ig
//      4. add issues to an extra file #ig
//      5. work on tdd instead of issue #im
//      6. rename all variable and function #ig
//      7. add ida star with backtracking 
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
        $scope.SPEED_OPTIONS=[1,2,3,4]; //speed options
        $scope._play_speed=1; //current speed
        $scope._p_d=[]; //pattern database
        $scope.PLAYING_MODES={"-1":"none","1":"autoplay","2":"manual play"};//playing modes
        $scope.EVENT_LIST={"timer":0x1001,"keypress":0x1002};
        $scope.PD_LEN=18440; // pattern database generation length
        $scope._prev_dir=""; // not previous directory :D
        $scope._moves=[]; // keep moves for other task
        $scope._can_be_solved="can not be solved";//solvability
        $scope._status=0;//status for http request
        $scope.ALGORITHM_OPTIONS=["generic solver with pattern database","ida* implementation with pattern database"];
        $scope._which_algo=$scope.ALGORITHM_OPTIONS[0];
        $scope._a_p_d=[];
        $scope._a_moves=[];

        // call before changing anything 
        $scope.clear_all_event=function () {
            $document.unbind("keyup",$scope.keypressed);
            $window.clearInterval($scope._timer_var);
            $scope._step_count=0;
            $scope._can_be_solved="can not be solved";
        };

        // starts event
        $scope.start_listening_for=function(_event_type){
            $scope.clear_all_event();
            //console.log($scope.speed);
            if($scope.EVENT_LIST[_event_type]==0x1001){
                if($scope._which_algo==$scope.ALGORITHM_OPTIONS[1])$scope._timer_var=$window.setInterval($scope.a_star,(+$scope.TIMEOUT/+$scope._play_speed));
                else $scope._timer_var=$window.setInterval($scope.generic_solver,(+$scope.TIMEOUT/+$scope._play_speed));
            }
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
                // for partitioned
                $scope._p_d=$scope.gen_dictionary(2,$scope._column);
                // for star
                $scope._a_p_d=$scope.gen_dictionary($scope._row,$scope._column);
                $scope.solvability();
                $scope._p_d_p=$scope._p_d[0];
                $scope._p_d_h=$scope._p_d[1];
                $scope._p_d_m=$scope._p_d[2];
                $scope.toggle_input_disable();
            }
            
        }

        // solvability of a nxn puzzle
        $scope.solvability=function(){
            var _cnt=0;
            var _pos;
            for (var i = 0; i < $scope._vals.length; i++) {
                if($scope._vals[i]==" "){_pos=Math.floor(i/$scope._column);continue;}
                for (var j = i+1; j < $scope._vals.length; j++) {
                    if($scope._vals[j]==" "||$scope._vals[j]<$scope._vals[i])_cnt++;
                };
            };
            if($scope._column%2==1){
                if(_cnt%2==0)$scope._can_be_solved="can be solved";
            }
            else if(_pos%2==0){
                if(_cnt%2==1)$scope._can_be_solved="can be solved";

            }else{
                if(_cnt%2==0)$scope._can_be_solved="can be solved";
            }

        }

        // generate random state of the board
        // todo: use any distribution e.g. poisson or normal
        $scope.gen_random=function () {
            if($scope._column>0 && $scope._row>0){
                $scope.clear_all_event();
                var _arr=[];
                var _temp,_ok={};
                var _mod=$scope._column*$scope._row;
                var _query=""+$scope._row+" "+$scope._column;
                for (var _i = 0; _i < _mod; _i++) {
                    while(true){
                        _temp=(Math.floor(Math.random()*10000))%_mod;
                        if (_temp==0) {_temp=" ";};
                        if(_ok[_temp])continue;
                        _ok[_temp]=1;
                        _arr.push(_temp);
                        if (_temp==" "){_query+=" 0";}
                        else _query+=" "+_temp;
                        break;
                    }
                }
                $scope._vals=_arr;
                $scope._divs=$scope._column;
                $scope.solvability();
                $scope._status=1;
                $http({
                    method: "GET",
                    url: "http://localhost:3002/?query"+_query,
                    params: {"query": _query}
                }).success(function(data, status) {
                    $scope._status=0;
                    if(!data.error)$scope._moves = data.data[0].split(" ");
                    console.log($scope._moves);
                });
            }
        }

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

            // a little intelligent one
            var _curr_distance=$scope.calc_manhattan_distance($scope._vals);
            if(!_curr_distance){$scope.clear_all_event();return;}
            // do pattern search if found play or do estimation
            var _ans=$scope.do_pattern_search();
            if(_ans){$scope.play_next_step(_ans,$scope._vals);}
            else $scope.play_next_step($scope.estimate_next_int(_curr_distance),$scope._vals);
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
        $scope.play_next_step=function (_arrow,_arr,_row,_column) {
            if(!_column)_column=$scope._column;
            if(!_row)_row=$scope._row;
            for (var _i = 0; _i < _arr.length; _i++) {
                if(_arr[_i]==" "){
                    if(_arrow=="Down"&&_i-_column>=0){
                        //console.log("d");
                        _arr[_i]=_arr[_i-_column];
                        _arr[_i-_column]=" ";
                    }
                    else if(_arrow=="Up"&&_i+_column<_column*_row){
                        //console.log("u");
                        _arr[_i]=_arr[_i+_column];
                        _arr[_i+_column]=" ";
                    }
                    else if(_arrow=="Right"&&_i>Math.floor(_i/_column)*(_column)){
                        //console.log("r");
                        _arr[_i]=_arr[_i-1];
                        _arr[_i-1]=" ";
                    }
                    else if(_arrow=="Left"&&_i+1<(Math.floor(_i/_column)+1)*(_column)){
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
        // based on four posible step e.g. min distance
        // performance very poor
        $scope.estimate_next=function (_base) {
            var _dist=[];
            var DIRECTIONS=["Down","Up","Right","Left"];
            var I_DIRECTIONS=["Up","Down","Left","Right"];
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
            //find which one changes state
            var _minErr=100000,_which=0;
            for (var _i = 0; _i < _dist.length; _i++) {
                if(_dist[_i]<_minErr&&_does_change[_i])_minErr=_dist[_i],_which=_i;
            }
            // random if cyclic
            if($scope._prev_dir!=""){
                if(DIRECTIONS[$scope._prev_dir]==I_DIRECTIONS[_which]){
                    for(var _i=0;_i<4;_i++){
                        _which=(_which+1)%4;
                        if(_does_change[_which])break;
                    }
                    $scope._prev_dir=_which;
                    console.log("found next move ");
                    return DIRECTIONS[$scope._prev_dir];
                }
            }
            $scope._prev_dir=_which;
            //console.log("found next move "+directions[which]);
            return DIRECTIONS[$scope._prev_dir];

        }
        // move piece to most right-down corner
        $scope.take_a_detour=function(){

        }

        // from right to left
        $scope.move_from_right_to_left=function(_arr,_a,_b,val){
            while(-_a+_b){
                if(val)_arr.push("Up");
                else _arr.push("Down");
                _arr.push("Right");
                _arr.push("Right");
                if(val)_arr.push("Down");
                else _arr.push("Up");
                _arr.push("Left");
                _b--;
            }
        }

        // from left to right
        $scope.move_from_left_to_right=function(_arr,_a,_b,val){
            while(-_a+_b){
                if(val)_arr.push("Up");
                else _arr.push("Down");
                _arr.push("Left");
                _arr.push("Left");
                if(val)_arr.push("Down");
                else _arr.push("Up");
                _arr.push("Right");
                _b++;
            }
        }

        // from bottom to top
        $scope.move_from_bottom_to_top=function(_arr,_a,_b,val){
            while(-_a+_b){
                if(!val)_arr.push("Left");
                else _arr.push("Right");
                _arr.push("Down");
                _arr.push("Down");
                if(!val)_arr.push("Right");
                else _arr.push("Left");
                _arr.push("Up");
                _b--;
            }
        }

        // from top to bottom
        $scope.move_from_top_to_bottom=function(_arr,_a,_b,val){
            while(-_a+_b){
                if(!val)_arr.push("Left");
                else _arr.push("Right");
                _arr.push("Up");
                _arr.push("Up");
                if(!val)_arr.push("Right");
                else _arr.push("Left");
                _arr.push("Down");
                _b++;
                   
            }
        }

        // bug:might chnage the position of the z 
        $scope.move_to=function (posx,posy,what_again) {
            var _ans=[];
            var pos0;
            for (var pos0 = 0; pos0 < $scope._vals.length; pos0++) {
                if($scope._vals[pos0]==" ")break;
            }
            var pos=$scope.calc_pos(pos0);
            if(what_again){
                var _temp=pos[0]-posx;
                if(_temp>0){
                    while(_temp--)_ans.push("Right");
                }
                else if(_temp<0){
                    while(_temp++)_ans.push("Left");
                }
                _ans.push("Left");
                _temp=pos[1]-posy;
                if(_temp>0){
                    while(_temp--)_ans.push("Down");
                }
                else if(_temp<0){
                    while(_temp++)_ans.push("Up");
                }
                _ans.push("Right");
            }else{
                var _temp=pos[1]-posy;
                if(_temp>0){
                    while(_temp--)_ans.push("Down");
                }
                else if(_temp<0){
                    while(_temp++)_ans.push("Up");
                }
                _ans.push("Up");
                _temp=pos[0]-posx;
                if(_temp>0){
                    while(_temp--)_ans.push("Right");
                }
                else if(_temp<0){
                    while(_temp++)_ans.push("Left");
                    
                }
                _ans.push("Down");
            }
            
            return _ans;
        }

        // intelligent one
        // not most efficient
        $scope.estimate_next_int=function (_base) {
            // idea: solve each row
            // for 1..n-2:solve independently
            // solve(n-1,n)
            // dont recalculate
            var _mm=$scope._moves[0];
            if(_mm){
                $scope._moves.splice(0,1);
                return _mm;
            }
            var _arr=$scope._vals;
            var _which,_should_be,_currently_in;
            var _curr_moves=[];
            for(var _i=1;_i<$scope._vals.length;_i++){
                if(_arr[_i-1]==_i||(((_i-1)%$scope._column)>=($scope._column-2)))continue;
                for (_which = 0; _which < $scope._vals.length; _which++) {
                    if( _arr[_which]==_i)break;
                }
                break;
            }
            
            _should_be=$scope.calc_pos(_arr[_which]-1);
            _currently_in=$scope.calc_pos(_which);
            //console.log(_should_be+" "+_currently_in);
            if(-_should_be[0]+_currently_in[0]){
                if(-_should_be[0]+_currently_in[0]>0){
                    _curr_moves=$scope.move_to(_currently_in[0]-1,_currently_in[1]);
                    // did position change
                    /*var _ok=$scope.calc_pos(_which);
                    if(_ok[0]!=_currently_in[0])_curr_moves+=$scope.move_to(_ok[0],_ok[1]-1);*/
                    _curr_moves.push("Left");
                    _currently_in[0]--;
                    if(_currently_in[1]==$scope.row-1)$scope.move_from_right_to_left(_curr_moves,_should_be[0],_currently_in[0],1);
                    else $scope.move_from_right_to_left(_curr_moves,_should_be[0],_currently_in[0]);
                }else{
                    _curr_moves=$scope.move_to(_currently_in[0]+1,_currently_in[1]);
                    /*var _ok=$scope.calc_pos(_which);
                    if(_ok[0]!=_currently_in[0])_curr_moves+=$scope.move_to(_ok[0],_ok[1]-1);*/
                    _curr_moves.push("Right");
                    _currently_in[0]++;
                    if(_currently_in[1]==$scope.row-1)$scope.move_from_left_to_right(_curr_moves,_should_be[0],_currently_in[0],1);
                    else $scope.move_from_left_to_right(_curr_moves,_should_be[0],_currently_in[0]);
                }
            }
            else if(-_should_be[1]+_currently_in[1]){
                if(-_should_be[1]+_currently_in[1]>0){
                    _curr_moves=$scope.move_to(_currently_in[0],_currently_in[1]-1,1);
                    /*var _ok=$scope.calc_pos(_which);
                    if(_ok[1]!=_currently_in[1])_curr_moves+=$scope.move_to(_ok[0],_ok[1]-1);*/
                    _curr_moves.push("Up");
                    _currently_in[1]--;
                    if(_currently_in[0]==$scope.column-1)$scope.move_from_bottom_to_top(_curr_moves,_should_be[1],_currently_in[1],1);
                    else $scope.move_from_bottom_to_top(_curr_moves,_should_be[1],_currently_in[1]);
                }else{
                    _curr_moves=$scope.move_to(_currently_in[0],_currently_in[1]+1,1);
                    /*var _ok=$scope.calc_pos(_which);
                    if(_ok[1]!=_currently_in[1])_curr_moves+=$scope.move_to(_ok[0],_ok[1]-1);*/
                    _curr_moves.push("Down");
                    _currently_in[1]++;
                    if(_currently_in[0]==$scope.column-1)$scope.move_from_top_to_bottom(_curr_moves,_should_be[1],_currently_in[1],1);
                    else $scope.move_from_top_to_bottom(_curr_moves,_should_be[1],_currently_in[1]);
                }
            }
            
            $scope._moves=_curr_moves;
            _mm=$scope._moves[0];
            if(_mm){
                $scope._moves.splice(0,1);
                return _mm;
            }
            return "";
            
        }

        // partitioned and pattern database based
        $scope.generic_solver=function () {
            // check state
            var _curr_distance=$scope.calc_manhattan_distance($scope._vals);
            if(!_curr_distance){$scope.clear_all_event();return;}
            // if data has not arrived yet
            if($scope._status)return;
            // return if already data is generated
            var _mm=$scope._moves[0];
            if(_mm){
                $scope._moves.splice(0,1);
                $scope._step_count++;
                $scope.play_next_step(_mm,$scope._vals);
                $scope.$apply();
                return;
            }
            
            var _ans=false;
            var _pat=$scope._vals.slice($scope._column*($scope._row-2),1000);
            var _minus=$scope._column*($scope._row-2);
            for (var i = 0; i < _pat.length; i++) {
                if(_pat[i]!=" ")_pat[i]-=_minus;
            };
            //console.log(_pat.toString());
            //console.log($scope._p_d_h[_pat]);
            if($scope._p_d_h[_pat]){
                _ans=$scope._p_d_m[$scope._p_d_h[_pat]];
            }else {
                $scope.clear_all_event();
                return;
            }
            $scope._step_count++;
            $scope.play_next_step(_ans,$scope._vals);
            $scope.$apply();
        }

        // a star manhattan distance
        $scope.a_calc_manhattan_distance=function(_arr){
            var _ans=0,_should_be,_currently_in,_k;
            for (var _i = 0; _i < _arr.length; _i++) {
                if(_arr[_i]!=" " && _arr[_i]!=_i+1){
                    _should_be=$scope.calc_pos(_i);
                    for(var _j=0;_j<_arr.length;_j++)if(_arr[_j]==_i+1){_currently_in=$scope.calc_pos(_i+1);break;}
                    _ans+=Math.abs(_should_be[0]-_currently_in[0])+Math.abs(_should_be[1]-_currently_in[1]);
                }
            }
            return _ans;
        }

        // ida* implementation with pattern database
        // dl 19
        $scope.a_star=function() {
            // check state
            if($scope._status)return;
            var _curr_distance=$scope.calc_manhattan_distance($scope._vals);
            if(!_curr_distance){$scope.clear_all_event();return;}
            // if ida star was done
            var _mm=$scope._a_moves.pop();
            if(_mm){
                $scope._moves.splice(0,1);
                $scope._step_count++;
                $scope.play_next_step(_mm,$scope._vals);
                $scope.$apply();
                return;
            }
            // look in the pattern database
            var _pat=$scope._vals.toString();
            if($scope._a_p_d[1][_pat]){
                var _ans=$scope._a_p_d[2][$scope._a_p_d[1][_pat]];
                $scope._step_count++;
                $scope.play_next_step(_ans,$scope._vals);
                $scope.$apply();
                return;
            }
            $scope._status=1;

            // else start ida star
            var _n=$scope._row,_m=$scope._column;
            var DIRECTIONS=["Down","Up","Right","Left"];
            var I_DIRECTIONS=["Up","Down","Left","Right"];
            var _arr=[];
            for (var _i = 0; _i < _m*_n; _i++) {
                _arr.push($scope._vals[_i]);
            }
            var _patterns=[];
            var _pattern_moves=[];
            _patterns.push(_arr);
            var _hash={};
            _hash[_arr]=-1;
            var _min=100000,_min_arr;
            var _arr1=[],_k,_j,_parent=[];
            for (var _i = 0;_i<_patterns.length && _i < 5000; _i++){
                for (_k = 0; _k < 4; _k++) {
                    _arr1=[];
                    for (_j = 0; _j < _patterns[_i].length; _j++) {
                        _arr1.push(_patterns[_i][_j]);
                    }
                    $scope.play_next_step(DIRECTIONS[_k],_arr1,_n,_m);
                    if(_hash[_arr1])continue;
                    // value of current state
                    _curr_distance=$scope.a_calc_manhattan_distance(_arr1);
                    _patterns.push(_arr1);
                    //hash_count++;
                    _pattern_moves.push(DIRECTIONS[_k]);
                    _hash[_arr1]=_pattern_moves.length-1;
                    _parent.push(_i);
                    if(_curr_distance<_min){
                        _min=_curr_distance;
                        _min_arr=_arr1;
                    }
                }
            }
            //console.log(_hash);
            console.log(_patterns);
            while(true){
                if(_hash[_min_arr]==-1)break;
                $scope._a_moves.push(_pattern_moves[_hash[_min_arr]]);
                _min_arr=_patterns[_parent[_hash[_min_arr]+1]];
            }
            $scope._status=0;
        }

        // generate pattern database
        // called from param_change
        $scope.gen_dictionary=function (_n,_m) {
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
            var _arr1=[],_k,_j;
            for (var _i = 0;_i<_patterns.length && _i < $scope.PD_LEN; _i++) {
                for (_k = 0; _k < 4; _k++) {
                    _arr1=[];
                    for (_j = 0; _j < _patterns[_i].length; _j++) {
                        _arr1.push(_patterns[_i][_j]);
                    }
                    $scope.play_next_step(DIRECTIONS[_k],_arr1,_n,_m);
                    if(_hash[_arr1])continue;
                    // value of current state
                    _patterns.push(_arr1);
                    //hash_count++;
                    _pattern_moves.push(I_DIRECTIONS[_k]);
                    _hash[_arr1]=_pattern_moves.length-1;
                };
            }
            console.log(_hash);
            //not now
            return [_patterns,_hash,_pattern_moves];
        }

        // manually call
        $scope.param_change();
    }]);
