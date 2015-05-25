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
#define SUBMX 1000005

const int inf = 0x3f3f3f3f;

int n=5,m=5;
int arr[MX];
int mod=n*m;
int num;
int main(int argc, char const *argv[])
{
	ios_base::sync_with_stdio(0);
	//freopen("input.txt","r",stdin);
	//freopen("input.txt","w",stdout);
	srand (time(NULL));
	cout<<n<<" "<<m<<endl;
  	for (int i = 0; i < n*m; ++i)
  	{
  		
  		do{
  			num = rand() % mod;
  		}while(arr[num]);
  		arr[num]=1;
  		cout<<num<<" ";
  	}
  	cout<<endl;
	return 0;
}