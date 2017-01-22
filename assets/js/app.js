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

var timeOut;

function domSet(train){

	var now = moment();
	var arrivalTime = moment(train.time, 'h:mm a');

	while(arrivalTime.isBefore(now, 'minute') === true){
		arrivalTime.add(train.frequency, 'm');
	}

	var button = $("<button>").text('delete');

	//Scope work around: pass your extra data in as below:
	button.on('click', { extra : train }, function(event){
		var data = event.data;
		console.log(data.extra.train);	

		trainsRef.child(data.extra.train).remove();
		$(this).closest('tr').remove();

		if(timeOut){
			clearInterval(timeOut);
			timeOut = setInterval(function(){domSet(data.extra.train)}, 60000);
		} else{
			timeOut = setInterval(function(){domSet(data.extra.train)}, 60000);		
		}	
				
	})

	$("#table-body").append("<tr><td>"+train.train+"</td>"+
		"<td>"+train.destination+"</td>"+
		"<td>"+train.frequency+"</td>"+
		"<td>"+train.time+"</td>"+
		"<td>"+"Approximately "+now.to(moment(train.time,'h:mm a'))+"</td>"+
		"<td></td></tr>");			

	$("#table-body").children('tr').children('td').last().append(button);
		
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

	database.ref('trains/' + trainName).set({
		train: trainName,
		destination: trainDestination,
		frequency: freq,
		time: moment(firstTime, 'h:mm a').format('h:mm a')
	});

});

trainsRef.on("child_added", function(snapshot){
	var train = snapshot.val();
	console.log(train);

	domSet(train);

});











