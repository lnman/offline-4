/*
* created by: momen_bhuiyan@yahoo.com
* date: 14-10-14
* version: 0.0.1
* what does it do:solves all but last two row of an n x m puzzle 
* License: MIT.
* issues: 1.bug in the solve_last_2 when one of them is already in place #im
*/


#include <bits/stdc++.h>
using namespace std;

#define pb push_back
#define mp make_pair
#define clr(x) x.clear()
#define sz(x) ((int)(x).size())
#define F first
#define S second
#define rep(i,a,b) for(int i=a;i<b;i++)
#define rep0(i,b) for(int i=0;i<b;i++)
#define rep1(i,b) for(int i=1;i<=b;i++)
#define repi(i,a,b) for(int i=a;i>=b;i--)
#define repx(i,a,b,dx) for(int i=a;i<b;i+=dx)
#define pdn(n) printf("%d\n",n)
#define pds(n) printf("%d ",n)
#define sl(n) scanf("%lld",&n)
#define sd(n) scanf("%d",&n)
#define pn  printf("\n")

typedef pair<int,int> PII;
typedef vector<PII> VPII;
typedef vector<int> VI;
typedef vector<VI> VVI;
typedef long long i64;
typedef string st;
#define MOD 1000000007
#define MX 105

const int inf = 0x3f3f3f3f;
int n,m;
int arr[MX][MX];
bool is_free[MX][MX];

void printall(){
	rep0(k,m){
		//printf("%s","---");
	}
	//pn;
	rep0(j,n){
		rep0(k,m)
		{
			//pds(arr[j][k]);
		}
		//pn;
	}
}

struct position
{
	int _x,_y;
	
};
int curr;
position _pos_should_be;
position _pos_in;
position _0_p;
position get_pos(int which){
	position pp;
	rep0(i,n){
		rep0(j,m){
			if(arr[i][j]==which){
				pp._x=j;
				pp._y=i;
				return pp;
			}
		}
	}
}

void move(string ss){
	
	if(ss=="left"){
		if(is_free[_0_p._y][_0_p._x-1]){
			move("up");
		}
		cout<<"Left"<<endl;
		if(_0_p._x!=m-1){
			int val_x=arr[_0_p._y][_0_p._x];
			arr[_0_p._y][_0_p._x]=arr[_0_p._y][_0_p._x+1];
			arr[_0_p._y][_0_p._x+1]=val_x;
		}
	}
	if(ss=="right"){
		cout<<"Right"<<endl;
		if(_0_p._x!=0){
			int val_x=arr[_0_p._y][_0_p._x];
			arr[_0_p._y][_0_p._x]=arr[_0_p._y][_0_p._x-1];
			arr[_0_p._y][_0_p._x-1]=val_x;
		}
	}
	if(ss=="top"){
		cout<<"Up"<<endl;
		if(_0_p._y!=n-1){
			int val_x=arr[_0_p._y][_0_p._x];
			arr[_0_p._y][_0_p._x]=arr[_0_p._y+1][_0_p._x];
			arr[_0_p._y+1][_0_p._x]=val_x;
		}
	}
	if(ss=="bottom"){
		if(is_free[_0_p._y-1][_0_p._x]){
			move("left");
		}
		cout<<"Down"<<endl;
		if(_0_p._y!=0){
			int val_x=arr[_0_p._y][_0_p._x];
			arr[_0_p._y][_0_p._x]=arr[_0_p._y-1][_0_p._x];
			arr[_0_p._y-1][_0_p._x]=val_x;
		}
	}
	_pos_in=get_pos(curr);
	_0_p=get_pos(0);
	printall();
}

bool are_in_same_row(position a,position b){
	if(a._y==b._y)return true;
	return false;
}

bool is_it_in_left(position a,position b){
	if(a._x<b._x)return true;
	return false;
}
bool need_to_go_to_left(position a){
	if(a._x>=_pos_should_be._x)return true;
	return false;
}

bool in_same_column(position a,position b){
	if(a._x==b._x)return true;
	return false;
}

bool need_to_go_to_up(position a){
	if(a._y>=_pos_should_be._y)return true;
	return false;
}

bool is_in_last_row(position a){
	if(a._y==n-1)return true;
	return false;
}

bool is_in_last_column(position a){
	if(a._x==m-1)return true;
	return false;
}

void move_next_to(int i){
	// get positions
	_pos_in=get_pos(i);
	_0_p=get_pos(0);
	// where it should be
	_pos_should_be._x=(i-1)%m;
	_pos_should_be._y=(i-1)/m;
	if(!are_in_same_row(_pos_in,_0_p)){
		if(in_same_column(_pos_in,_0_p)){
			if(is_in_last_column(_pos_in)){
				move("right");
			}else{
				move("left");
			}
		}
		if(_pos_in._y>=_0_p._y){
			while(_pos_in._y!=_0_p._y){
				move("top");
			}

		}else{
			while(_pos_in._y!=_0_p._y){
				move("bottom");
			}
		}
	}
	//same row now
	if(is_it_in_left(_pos_in,_0_p)){
		while(_pos_in._x+1<_0_p._x){
			move("right");
		}
		if(_pos_in._x==0){move("down");move("right");}
		else if(_pos_in._x<_0_p._x){
			if(is_in_last_row(_pos_in)){
				move("bottom");
				move("right");
				move("right");
				move("top");
			}else{
				move("top");
				move("right");
				move("right");
				move("bottom");
			}
			
		}
		
	}else{
		while(_pos_in._x>_0_p._x){
			move("left");
		}
		if(_pos_in._x>_0_p._x){
			if(is_in_last_row(_pos_in)){
				move("bottom");
				move("left");
				move("left");
				move("top");
			}else{
				move("top");
				move("left");
				move("left");
				move("bottom");
			}
		}

	}
}

void solve_it(int i){
	int t=0;
	//cout<<_pos_should_be._x<<" "<<_pos_in._x<<endl;
	while(_pos_in._x!=_pos_should_be._x){
		t++;
		if(t==10)break;
		if(_pos_in._x<_0_p._x){
			if(_pos_in._x<_pos_should_be._x){
				move("right");
				continue;
			}
			if(is_in_last_row(_pos_in)){
				move("bottom");
				move("right");
				move("right");
				move("top");

			}else{
				move("top");
				move("right");
				move("right");
				move("bottom");
			}
			move("left");
		}
		else{
			if(_pos_in._x>_pos_should_be._x){
				move("left");
				continue;
			}
			if(is_in_last_row(_pos_in)){
				move("bottom");
				move("left");
				move("left");
				move("top");
			}else{
				move("top");
				move("left");
				move("left");
				move("bottom");
			}
			move("right");
		}
	}
	if(is_in_last_row(_pos_in))move("bottom");
	else move("top");
	if(_pos_in._x<_0_p._x){
		move("right");
	}
	else{
		move("left");
	}
	if(is_in_last_row(_pos_in))move("top");
	t=0;
	// goto bottom if needed

	while(_pos_in._y!=_pos_should_be._y){
		t++;
		if(t==10)break;
		if(is_in_last_column(_pos_in)){
			move("right");
			move("bottom");
			move("bottom");
			move("left");
			
		}else{
			move("left");
			move("bottom");
			move("bottom");
			move("right");
		}
		move("top");
		
	}

}


void solve_last_2(int i){
	//if n is in n-1 pos move it down
	curr=i;
	move_next_to(i);
	_pos_should_be._x=(i)%m;
	_pos_should_be._y=(i)/m;
	solve_it(i);
	int k=i+1;
	curr=k;
	move_next_to(k);
	_pos_should_be._x=(k+m-1)%m;
	_pos_should_be._y=(k+m-1)/m;
	solve_it(k);
	move("right");
	move("bottom");
	move("bottom");
	move("left");
	move("top");
}


int main(int argc, char const *argv[])
{
	//ios_base::sync_with_stdio(0);
	freopen("input.txt","r",stdin);
	//freopen("output.txt","w",stdout);
	sd(n);sd(m);
	rep0(i,n)
		rep0(j,m){
			sd(arr[i][j]);
		}
	int px=(m*(n-2))-1;
	printall();
	rep1(i,px){
		printall();
		if(((i-1)%m)<(m-2)&&arr[(i-1)/m][(i-1)%m]!=i){
			curr=i;
			move_next_to(i);
			solve_it(i);
			//cout<<"solved "<<i<<endl;
			is_free[(i-1)/m][(i-1)%m]=true;
		}else if(arr[(i-1)/m][(i-1)%m]!=i&&((i-1)%m)==m-2){
			solve_last_2(i);
			//cout<<"solved "<<i<<" "<<i+1<<endl;
			is_free[(i-1)/m][(i-1)%m]=true;
			is_free[i/m][i%m]=true;
		}
	}
	printall();
	return 0;
}