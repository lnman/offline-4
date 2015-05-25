var exec = require('child_process').exec,child;

var fs=require('fs');
var url=require('url');
var server=require('http').createServer(function(request,response) {
	response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    response.setHeader('Access-Control-Allow-Credentials', true);
	var test=url.parse(request.url,true);
	var query=test.query.query;
	console.log(query);
	response.writeHead(200, { 'Content-Type': 'application/json' });
	try{
		fs.writeFileSync("input.txt",""+query.toString()+"\n");
	}catch(error){
		console.log(error);
		response.end(JSON.stringify({"error": error}));
		return;
	}
	console.log("done file write");
	child = exec('"./a.exe"',function (error, stdout, stderr) {
		    if (error !== null) {
		      	console.log("exec error: " + error);
				response.end(JSON.stringify({"error": error}));
		      	return;
		  	}
		  	stdout = stdout.replace(/(\r\n|\n|\r)/gm," ");
		  	var _stdout=stdout.split();
			response.end(JSON.stringify({"data": _stdout}));
		}
	);
});
server.listen(3002);