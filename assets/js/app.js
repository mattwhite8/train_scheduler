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

function domSet(data, keys){

	console.log('domSet called');

	$("#table-body").empty();

	for(var i = 0; i < keys.length; i++){
		var now = moment();
		var arrivalTime = moment(data[keys[i]].time, 'h:mm a');

		while(arrivalTime.isBefore(now, 'minute') === true){
			arrivalTime.add(train.frequency, 'm');
		}

		var button = $("<button>").text('delete').addClass('btn btn-warning');

		//Scope work around: pass your extra data in as below:
		button.on('click', { extra : data[keys[i]] }, function(event){
			var data = event.data;
			console.log(data.extra.train);	

			trainsRef.child(data.extra.train).remove();
			$(this).closest('tr').remove();
					
		})

		$("#table-body").append("<tr><td>"+data[keys[i]].train+"</td>"+
			"<td>"+data[keys[i]].destination+"</td>"+
			"<td>"+data[keys[i]].frequency+"</td>"+
			"<td>"+data[keys[i]].time+"</td>"+
			"<td>"+Math.abs(now.diff(moment(data[keys[i]].time,'h:mm a'),'minutes'))+" minutes</td>"+
			"<td></td></tr>");			

		$("#table-body").children('tr').children('td').last().append(button);		
	}

	if(timeOut){
		clearInterval(timeOut);
		timeOut = setInterval(function(){domSet(data, keys)}, 60000);
	} else{
		timeOut = setInterval(function(){domSet(data, keys)}, 60000);		
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
		time: moment(firstTime, 'h:mm a').format('h:mm a')
	});

});

trainsRef.on("value", function(snapshot){
	if(snapshot.val()){
		var keys = Object.keys(snapshot.val());
		var data = snapshot.val();
		domSet(data, keys);
	} else {
		clearInterval(timeOut);
	}
})













