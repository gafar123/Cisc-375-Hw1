// built-in Node.js modules
var fs = require('fs');
var dictFiletype={'html': 'text/html',
  'js': 'application/javascript',
  'css': 'text/css',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'json': 'application/json'
  }
var http = require('http');
var path = require('path');

var port = 8000;
var public_dir = path.join(__dirname, 'public');
let jsonPath = path.join(public_dir,'data', 'members.json')
let jsonfile;
fs.readFile(jsonPath,(err,data)=>{
	if(err){
		throw err;
	}
	jsonfile= JSON.parse(data)
});



function NewRequest(req, res) {
	var filename = req.url.substring(1);
	if (filename === '') {
		filename = 'index.html';
	}

	if(req.method==='GET'){	
		var fullpath = path.join(public_dir, filename); 
		var fileTypeIndex = fullpath.lastIndexOf('.'); 
		var fileType = fullpath.substring(fileTypeIndex + 1); 
		fs.readFile(fullpath, (err, data) => {
			if(err){		
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.write('Oh no! Could not find file');
				res.end();
			}
			else{
				console.log(fullpath);
				res.writeHead(200,{'Content-Type': dictFiletype[fileType]});
				res.write(data);
				res.end();
			}			
		
		});
	}
	if(req.method==='POST'){
		if(filename==='sign-up'){
			let body='"';
			req.on('data',(chunk)=>{
				body+=chunk.toString();
				body+='"';
			});
			req.on('end',()=>{
				body=body.replace(/=/g,"\":\"");
				var temp=body.split('&');
				
				for(var i=0;i < temp.length;i++){
					temp[i]="\""+ temp[i]+"\"";
				}
				
				temp=temp.join();
				temp= "{" + decodeURIComponent(temp) +"}"
				temp="{"+temp.substring(2);
			temp=temp.substring(0,temp.length-2)+"}";
				console.log(temp);
				var jsonStuff=JSON.parse(temp)
				console.log(jsonStuff);
				if(jsonStuff['gender']==="Female"){
					jsonStuff['gender']="F";
				}
				else if(jsonStuff['gender']==="Male"){
					jsonStuff['gender']="M";
				}
				else{
					jsonStuff['gender']="O";
				}
				var email=jsonStuff['email'];
				delete jsonStuff['email']
				jsonfile[email]= jsonStuff;
				console.log(JSON.stringify(jsonfile,null,4));
				fs.writeFile(jsonPath,JSON.stringify(jsonfile,null,4), (err) => {
					res.writeHead(200,{'Content-Type' : 'text/html'})
					let hold;
					fs.readFile(path.join(public_dir,'join.html'),(err,data)=>{
						
						hold=data;
						res.write(hold);
						res.end();
					});
					
				})
			});
		}
	}
	
}
var server = http.createServer(NewRequest);

console.log('Now listening on port ' + port);
server.listen(port, '0.0.0.0');