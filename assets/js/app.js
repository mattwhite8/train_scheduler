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

//Variable for storing interval
var timeOut;

//Will use trainKeys and trainData later for storing data used in updating firebase
// var trainKeys;

// var trainData;

var user;

 /** Firebase Sign In Quick Start Code
     * Function called when clicking the Login/Logout button.
     */
    // [START buttoncallback]
    function toggleSignIn() {
      if (!firebase.auth().currentUser) {
        // [START createprovider]
        var provider = new firebase.auth.GoogleAuthProvider();
        // [END createprovider]
        // [START addscopes]
        provider.addScope('https://www.googleapis.com/auth/plus.login');
        // [END addscopes]
        // [START signin]
        firebase.auth().signInWithRedirect(provider);
        // [END signin]
      } else {
        // [START signout]
        firebase.auth().signOut();
        // [END signout]
      }
      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in').disabled = true;
      // [END_EXCLUDE]
    }
    // [END buttoncallback]

/**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     *  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
     *    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
     */
    function initApp() {
      // Result from Redirect auth flow.
      // [START getidptoken]
      firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // [START_EXCLUDE]
          document.getElementById('quickstart-oauthtoken').textContent = token;
        } else {
          document.getElementById('quickstart-oauthtoken').textContent = 'null';
          // [END_EXCLUDE]
        }
        // The signed-in user info.
        var user = result.user;
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // [START_EXCLUDE]
        if (errorCode === 'auth/account-exists-with-different-credential') {
          alert('You have already signed up with a different auth provider for that email.');
          // If you are using multiple auth providers on your app you should handle linking
          // the user's accounts here.
        } else {
          console.error(error);
        }
        // [END_EXCLUDE]
      });
      // [END getidptoken]
      // Listening for auth state changes.
      // [START authstatelistener]
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          var displayName = user.displayName;
          var email = user.email;
          var emailVerified = user.emailVerified;
          var photoURL = user.photoURL;
          var isAnonymous = user.isAnonymous;
          var uid = user.uid;
          var providerData = user.providerData;
          // [START_EXCLUDE]
          document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
          document.getElementById('quickstart-sign-in').textContent = 'Sign out';
          document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
          // [END_EXCLUDE]
        } else {
          // User is signed out.
          // [START_EXCLUDE]
          document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
          document.getElementById('quickstart-sign-in').textContent = 'Sign in with Google';
          document.getElementById('quickstart-account-details').textContent = 'null';
          document.getElementById('quickstart-oauthtoken').textContent = 'null';
          // [END_EXCLUDE]
        }
        // [START_EXCLUDE]
        document.getElementById('quickstart-sign-in').disabled = false;
        // [END_EXCLUDE]
      });
      // [END authstatelistener]
      document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
    }

    //End Google UI Quick Start code

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

window.addEventListener('load', initApp);













