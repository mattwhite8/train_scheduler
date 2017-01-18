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
		time: firstTime,
		frequency: freq
	});

	$("#table-body").empty();

	trainsRef.on("child_added", function(snapshot){
		var train = snapshot.val();
		$("#table-body").append("<tr><td>"+train.train+"</td>"+
			"<td>"+train.destination+"</td>"+
			"<td>"+train.time+"</td>"+
			"<td>"+train.frequency+"</td></tr>");		
	});

});