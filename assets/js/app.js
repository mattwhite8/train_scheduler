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
  'callbacks': {
    // Called when the user has been successfully signed in.
    'signInSuccess': function(user, credential, redirectUrl) {
      handleSignedInUser(user);
      // Do not redirect.
      return false;
    }
  },
  // Opens IDP Providers sign-in flow in a popup.
  'signInFlow': 'popup',
  'signInOptions': [
    // TODO(developer): Remove the providers you don't need for your app.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  'tosUrl': 'https://www.google.com'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Keep track of the currently signed in user.
var currentUid = null;

/**
 * Redirects to the FirebaseUI widget.
 */
var signInWithRedirect = function() {
  window.location.assign('/widget');
};

/**
 * Open a popup with the FirebaseUI widget.
 */
var signInWithPopup = function() {
  window.open('/widget', 'Sign In', 'width=985,height=735');
};

/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
  currentUid = user.uid;
  document.getElementById('user-signed-in').style.display = 'block';
  document.getElementById('user-signed-out').style.display = 'none';
  document.getElementById('name').textContent = user.displayName;
  document.getElementById('email').textContent = user.email;
  if (user.photoURL){
    document.getElementById('photo').src = user.photoURL;
    document.getElementById('photo').style.display = 'block';
  } else {
    document.getElementById('photo').style.display = 'none';
  }
};

/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
  document.getElementById('user-signed-in').style.display = 'none';
  document.getElementById('user-signed-out').style.display = 'block';
  ui.start('#firebaseui-container', uiConfig);
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
  // The observer is also triggered when the user's token has expired and is
  // automatically refreshed. In that case, the user hasn't changed so we should
  // not update the UI.
  if (user && user.uid == currentUid) {
    return;
  }
  document.getElementById('loading').style.display = 'none';
  document.getElementById('loaded').style.display = 'block';
  user ? handleSignedInUser(user) : handleSignedOutUser();
});

/**
 * Deletes the user's account.
 */
var deleteAccount = function() {
  firebase.auth().currentUser.delete().catch(function(error) {
    if (error.code == 'auth/requires-recent-login') {
      // The user's credential is too old. She needs to sign in again.
      firebase.auth().signOut().then(function() {
        // The timeout allows the message to be displayed after the UI has
        // changed to the signed out state.
        setTimeout(function() {
          alert('Please sign in again to delete your account.');
        }, 1);
      });
    }
  });
};

/**
 * Initializes the app.
 */
var initApp = function() {
  document.getElementById('sign-in-with-redirect').addEventListener(
      'click', signInWithRedirect);
  document.getElementById('sign-in-with-popup').addEventListener(
      'click', signInWithPopup);
  document.getElementById('sign-out').addEventListener('click', function() {
    firebase.auth().signOut();
  });
  document.getElementById('delete-account').addEventListener(
      'click', function() {
        deleteAccount();
      });
};



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

window.addEventListener('load', initApp);













