// Initialize Firebase
var config = {
	apiKey: "AIzaSyD5l7LiBXr-xUc9dnk_SR2m_kqp_rQkWdI",
	authDomain: "trainscheduler-fd50f.firebaseapp.com",
	databaseURL: "https://trainscheduler-fd50f.firebaseio.com",
	storageBucket: "trainscheduler-fd50f.appspot.com",
	messagingSenderId: "1068029365196"
};
firebase.initializeApp(config);

 // FirebaseUI config.
var uiConfig = {
	signInSuccessUrl: 'https://desolate-tor-26652.herokuapp.com/',
	signInOptions: [
	  // Leave the lines as is for the providers you want to offer your users.
	  firebase.auth.EmailAuthProvider.PROVIDER_ID
	]
	// Terms of service url.
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

var provider = new firebase.auth.GithubAuthProvider();

var database = firebase.database();

var trainsRef = database.ref('trains/');

//Variable for storing interval
var timeOut;

//Will use trainKeys and trainData later for storing data used in updating firebase
var trainKeys;

var trainData;

var user;

function signIn(){
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  // This gives you a GitHub Access Token. You can use it to access the GitHub API.
	  var token = result.credential.accessToken;
	  // The signed-in user info.
	  user = result.user;
	  // ...
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	  // ...
	});
};

function signOut(){
	firebase.auth().signOut().then(function() {
	  // Sign-out successful.
	  console.log('sign in');
	}, function(error) {
	  // An error happened.
	  console.log(error);
	});
}

function domSet(data, keys){

	console.log('domSet called');

	$("#table-body").empty();

	for(var i = 0; i < keys.length; i++){
		var now = moment();
		var arrivalTime = moment(data[keys[i]].time, 'h:mm a');

		while(arrivalTime.isBefore(now, 'minute') === true){
			arrivalTime.add(data[keys[i]].frequency, 'm');
		}

		var buttonDelete = $("<button>").text('delete').addClass('btn btn-warning');
		var buttonUpdate = $("<button>").text('update').addClass('btn btn-warning');

		//Scope work around: pass your extra data in as below:
		buttonDelete.on('click', { extra : keys[i] }, function(event){

			// if(user === null){
			// 	return alert('Pleas sign in first');
			// }

			var data = event.data;
			console.log(data.extra);	

			trainsRef.child(data.extra).remove();
			$(this).closest('tr').remove();
					
		});

		//Scope work around: pass your extra data in as below
		buttonUpdate.on('click', { extra : keys[i] }, function(event){

			// if(user === null){
			// 	return alert('Please sign in first');
			// }

			var data = event.data;
			console.log(data.extra);

			var trainName = $("#train-name").val().trim();
			var trainDestination = $("#destination").val().trim();
			var firstTime = $("#time").val().trim();
			var freq = $("#freq").val().trim();

			$("#train-name").val('');
			$("#destination").val('');
			$("#time").val('');
			$("#freq").val('');

			database.ref('trains/' + data.extra).update({
				train: trainName,
				destination: trainDestination,
				frequency: freq,
				time: moment(firstTime, 'h:mm a').format('h:mm a')
			});
		});

		$("#table-body").append("<tr><td>"+data[keys[i]].train+"</td>"+
			"<td>"+data[keys[i]].destination+"</td>"+
			"<td>"+data[keys[i]].frequency+"</td>"+
			"<td>"+arrivalTime.format('h:mm a')+"</td>"+
			"<td>"+Math.abs(now.diff(moment(arrivalTime,'h:mm a'),'minutes'))+" minute(s)</td>"+
			"<td></td>"+
			"<td></td></tr>");			

		$("#table-body").children('tr').eq(i).children('td').eq(5).append(buttonUpdate);
		$("#table-body").children('tr').children('td').last().append(buttonDelete);		
	}
		
}


$("#train-submit").on('click', function(event){

	// if(user === null){
	// 	return alert('Please sign in first');
	// }

	event.preventDefault();

	var trainName = $("#train-name").val().trim();
	var trainDestination = $("#destination").val().trim();
	var firstTime = $("#time").val().trim();
	var freq = $("#freq").val().trim();

	$("#train-name").val('');
	$("#destination").val('');
	$("#time").val('');
	$("#freq").val('');

	database.ref('trains/').push({
		train: trainName,
		destination: trainDestination,
		frequency: freq,
		time: moment(firstTime, 'h:mm a').format('h:mm a')
	});

});


trainsRef.on("value", function(snapshot){

	console.log('on value runs');
	console.log(snapshot.val());

	//If null, don't run domSet
	if(snapshot.val() !== null){
		var keys = Object.keys(snapshot.val());
		var data = snapshot.val();

		//Store these variables for use in updating
		trainKeys = Object.keys(snapshot.val());
		trainData = snapshot.val();		

		domSet(data, keys);

		clearInterval(timeOut);
		timeOut = setInterval(function(){domSet(data, keys)}, 60000);
		console.log('timeOut cleared and reset');

	} else {
		clearInterval(timeOut);
		console.log('timeOut cleared');

		//if deleting last row, this will cause change to show across browsers
		$("#table-body").empty();

	}

	// if(user){
	// 	console.log(user);
	// }

}, function(errorObject){
	console.log('Errors handled: ' +errorObject.code);
});














