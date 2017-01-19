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

var timeOut;

function trainRow(train, destination, initialTime, frequency){
	this.train = train;
	this.destination = destination;
	this.initialTime = moment(initialTime, 'h:mm a');
	this.frequency = frequency;
}

function domSet(array){

	$("#table-body").empty();

	console.log('domSet was called');

	for(var i = 0; i < array.length; i++){
		var now = moment();

		while(array[i].initialTime.isBefore(now, 'minute') === true){
			array[i].initialTime.add(array[i].frequency, 'm');
		}

		$("#table-body").append("<tr><td>"+array[i].train+"</td>"+
			"<td>"+array[i].destination+"</td>"+
			"<td>"+array[i].frequency+"</td>"+
			"<td>"+array[i].initialTime.format('h:mm a')+"</td>"+
			"<td>"+now.to(array[i].initialTime)+"</td></tr>");			
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

	//make sure the data gets to firebase first
	setTimeout(function(){domSet(objectArr)}, 3000);

	if(timeOut){
		clearInterval(timeOut);
		timeOut = setInterval(function(){domSet(objectArr)}, 5000);
	} else{
		timeOut = setInterval(function(){domSet(objectArr)}, 5000);		
	}

});

trainsRef.on("child_added", function(snapshot){
	var train = snapshot.val();
	console.log(train);

	objectArr.push(new trainRow(train.train, train.destination, train.time, train.frequency));

});

$( document ).ready(function(){
	domSet(objectArr);
})







