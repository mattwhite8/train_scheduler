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

		var button = $("<button>").text('delete');

		//Scope work around: pass your extra data in as below:
		button.on('click', { extra : array[i], index : i }, function(event){
			var data = event.data;
			console.log(data.extra.train);	

			trainsRef.child(data.extra.train).remove();
			$("tbody").children("tr").eq(data.index).empty();

			if(timeOut){
				clearInterval(timeOut);
				timeOut = setInterval(function(){domSet(objectArr)}, 60000);
			} else{
				timeOut = setInterval(function(){domSet(objectArr)}, 60000);		
			}	
					
		})

		$("#table-body").append("<tr><td>"+array[i].train+"</td>"+
			"<td>"+array[i].destination+"</td>"+
			"<td>"+array[i].frequency+"</td>"+
			"<td>"+array[i].initialTime.format('h:mm a')+"</td>"+
			"<td>"+"Approximately "+now.to(array[i].initialTime)+"</td>"+
			"<td></td></tr>");			

		$("#table-body").children().eq(i).children().last().append(button);
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

	database.ref('trains/' + trainName).set({
		train: trainName,
		destination: trainDestination,
		frequency: freq,
		time: firstTime
	});

	// $("#table-body").html("<img src='assets/images/loader.gif'>");

	//make sure the data gets to firebase first
	setTimeout(function(){domSet(objectArr)}, 2000);

	if(timeOut){
		clearInterval(timeOut);
		timeOut = setInterval(function(){domSet(objectArr)}, 60000);
	} else{
		timeOut = setInterval(function(){domSet(objectArr)}, 60000);		
	}

});

trainsRef.on("child_added", function(snapshot){
	var train = snapshot.val();
	console.log(train);

	objectArr.push(new trainRow(train.train, train.destination, train.time, train.frequency));

});

trainsRef.on("child_removed", function(snapshot){
	if(objectArr.length === 1){
		objectArr = [];
	}
	for(var i = 0; i < objectArr.length; i++){
		if(objectArr[i].train === snapshot.val().train){
			objectArr = objectArr.splice(objectArr[i], 1);
		}
	}
})

$( document ).ready(function(){

	//wait for child_added events
	setTimeout(function(){domSet(objectArr)}, 2000);

})







