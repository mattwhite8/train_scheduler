// Initialize Firebase
var config = {
	apiKey: "AIzaSyD5l7LiBXr-xUc9dnk_SR2m_kqp_rQkWdI",
	authDomain: "trainscheduler-fd50f.firebaseapp.com",
	databaseURL: "https://trainscheduler-fd50f.firebaseio.com",
	storageBucket: "trainscheduler-fd50f.appspot.com",
	messagingSenderId: "1068029365196"
};
firebase.initializeApp(config);

var database = firebase.database();

var trainsRef = database.ref('trains/');

var objectArr = [];

function trainRow(train, destination, initialTime, frequency){
	this.train = train;
	this.destination = destination;
	this.initialTime = initialTime;
	this.frequency = frequency;

	this.domSet = function(){
		$("#table-body").append("<tr><td>"+train+"</td>"+
			"<td>"+destination+"</td>"+
			"<td>"+frequency+"</td>"+
			"<td>"+initialTime+"</td>"+
			"<td></td></tr>");			
	}
}



$("#train-submit").on('click', function(event){
	event.preventDefault();

	var trainName = $("#train-name").val().trim();
	var trainDestination = $("#destination").val().trim();
	var firstTime = $("#time").val().trim();
	var freq = $("#freq").val().trim();

	$("#train-name").val('');
	$("#destination").val('');
	$("#time").val('');
	$("#freq").val('');

	trainsRef.push({
		train: trainName,
		destination: trainDestination,
		frequency: freq,
		time: firstTime
	});

});

trainsRef.on("child_added", function(snapshot){
	var train = snapshot.val();
	console.log(train);

	objectArr.push(new trainRow(train.train, train.destination, train.time, train.frequency));

	for(var i = 0; i < objectArr.length; i++){
		console.log('running through object');
		objectArr[i].domSet();
	}

});





