var fs = require('fs');
var express = require('express');
var multer = require('multer');
var session = require('express-session');
var bodyparser = require('body-parser')
var childprocess = require('child_process')
var path = require('path')

var upload = multer({dest : './public/uploads/'})

var app = express();

// Reading from output files
//var file = fs.readFileSync('output.txt', 'utf8');

//var m = file.match(/Correctly Classified Instances\s*\d+\s*(.*)%\nIncorrectly Classified Instances\s*\d+\s*(.*)%/);

app.use(express.static('public'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
	extended : true
}));

app.set('view engine', 'jade')
app.set('views', __dirname);

require(__dirname + '/lib/helper.js').deleteFolderRecursive(__dirname + '/public/uploads');

app.get('/', function(req, res){
	res.render('index');
})

app.use('/train', function(req, res, next){

	next();
})

app.post('/train', upload.single('trainFile'), function(req, res){

	if(!req.session.folderPath){
		var sessionId = Math.floor(Math.random() * 200);

		//Set cookie for folder path
		req.session.folderPath = sessionId;

		fs.mkdirSync(__dirname + '/public/uploads/' + (sessionId + ''))
		console.log('created dir')
		console.log(path.normalize(__dirname + '/public/uploads/' + sessionId + '/train.arff'));

		fs.rename(__dirname + '/public/uploads/' + req.file.filename, __dirname + '/public/uploads/' + sessionId + '/train.arff');
	}
	else{
		fs.rename(__dirname + '/public/uploads/' + req.file.filename, __dirname + '/public/uploads/' + req.session.folderPath + '/train.arff');
	}

	res.send({filename : req.file.filename})
});

app.post('/model', function(req,res){
	var algorithm = req.body.algorithms;
	if(algorithm.match(/OneR/)){
		console.log('Building OneR model');
		childprocess.exec('java -classpath "weka.jar" weka.classifiers.rules.OneR -B 6 -no-cv -v -t ./public/uploads/' + req.session.folderPath +
			'/train.arff -d ./public/uploads/' + req.session.folderPath + '/OneR.model', 
			function(error, stdout, stderror){
				if(stdout !== null){
					res.send({ success : 'true' , message : 'Model Built.'});
				}
				else if(stderror !== ''){
					res.send({ success : 'false' , message : 'Model Building Failed.'});
				}
			});
	}
	else if(algorithm.match(/Bayes Naive/)){
		console.log('Building Bayes Naive model');
		childprocess.exec('java -classpath "weka.jar" weka.classifiers.bayes.NaiveBayes -D -no-cv -v -t ./public/uploads/' + req.session.folderPath +
			'/train.arff -d ./public/uploads/' + req.session.folderPath + '/NaiveBayes.model', 
			function(error, stdout, stderror){
				if(stdout !== null){
					res.send({ success : 'true' , message : 'Model Built.'});
				}
				else if(stderror !== ''){
					res.send({ success : 'false' , message : 'Model Building Failed.'});
				}
		});
	}
	else if(algorithm.match(/J48/)){
		console.log('Building J48 model');
		childprocess.exec('java -classpath "weka.jar" weka.classifiers.trees.J48 -C -no-cv -v -t ./public/uploads/' + req.session.folderPath +
			'/train.arff -d ./public/uploads/' + req.session.folderPath + '/J48.model', 
			function(error, stdout, stderror){
				if(stdout !== null){
					res.send({ success : 'true' , message : 'Model Built.'});
				}
				else if(stderror !== ''){
					res.send({ success : 'false' , message : 'Model Building Failed.'});
				}
		});
	}
	else{
		res.send({success : 'false' , message : 'No algorithm match!'});
	}
});

app.post('/test', upload.single('testFile'), function(req, res){

	console.log(__dirname + '/public/uploads/' + req.session.folderPath + '/test.arff');
	fs.rename(__dirname + '/public/uploads/' + req.file.filename, __dirname + '/public/uploads/' + req.session.folderPath + '/test.arff');
	console.log(req.file.filename);

	res.send({filename : req.file.filename});

});

app.post('/testmodel', function(req, res){
	var algorithm = req.body.algorithms;
	if(algorithm.match(/OneR/)){
		console.log('Building OneR result');
		childprocess.exec('java -classpath "weka.jar" weka.classifiers.rules.OneR -T ./public/uploads/' + req.session.folderPath +
			'/test.arff -l ./public/uploads/' + req.session.folderPath + '/OneR.model -o > ./public/uploads/' + req.session.folderPath +'/OneR.txt', 
			function(error, stdout, stderror){
				if(stdout !== null){
					res.send({ success : 'true' , message : 'Weka OneR', resStdOut : '/uploads/' + req.session.folderPath + '/OneR.txt'});
				}
				else if(stderror !== ''){
					res.send({ success : 'false' , message : 'Model Building Failed.'});
				}
			});
	}
	else if(algorithm.match(/Bayes Naive/)){
		console.log('Building Bayes result');
		childprocess.exec('java -classpath "weka.jar" weka.classifiers.bayes.NaiveBayes -T ./public/uploads/' + req.session.folderPath +
			'/test.arff -l ./public/uploads/' + req.session.folderPath + '/NaiveBayes.model -o > ./public/uploads/' + req.session.folderPath +'/NaiveBayes.txt', 
			function(error, stdout, stderror){
				if(stdout !== null){
					res.send({ success : 'true' , message : 'Weka Naive Bayes', resStdOut : '/uploads/' + req.session.folderPath + '/NaiveBayes.txt'});
				}
				else if(stderror !== ''){
					res.send({ success : 'false' , message : 'Model Building Failed.'});
				}
			});
	}
	else if(algorithm.match(/J48/)){
		console.log('Building J48 result');
		childprocess.exec('java -classpath "weka.jar" weka.classifiers.trees.J48 -T ./public/uploads/' + req.session.folderPath +
			'/test.arff -l ./public/uploads/' + req.session.folderPath + '/J48.model -o > ./public/uploads/' + req.session.folderPath +'/J48.txt', 
			function(error, stdout, stderror){
				if(stdout !== null){
					res.send({ success : 'true' , message : 'Weka J48', resStdOut : '/uploads/' + req.session.folderPath + '/J48.txt'});
				}
				else if(stderror !== ''){
					res.send({ success : 'false' , message : 'Model Building Failed.'});
				}
			});
	}
});

var server = require('http').createServer(app).listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Weka app listening at http://%s:%s', host, port);
});