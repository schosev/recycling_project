var map;
var infoWindow;
var geocoder;
var isAdd;
      function initMap() {
        //added geocoder to this function
        geocoder = new google.maps.Geocoder();
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 39.102115, lng: -94.582554},
          zoom: 10
        });
        infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);

          })
        } 
      }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      }
    
      function codeAddress(locationName, address, containerSize, acceptedItems, isAdd, callback) {
        //var address = document.getElementById('address').value;
        var isValid;
        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == 'OK') {
                       
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                customName: locationName,
                customAddress: address
            })
            isValid = true;
            google.maps.event.addListener(marker, 'click', function() {
              infoWindow.setContent('<div><strong>' + this.customName + '</strong><br>' +
                this.customAddress + '</div>');
              infoWindow.open(map, this);
            });
          } else {
            isValid = false;
            
          }
          if (isAdd) {
          callback(address, containerSize, acceptedItems, isValid)
          }
        });

      }
//end of code for adding markers for recylcing centers

$(document).ready(function () {

  var config = {
    apiKey: "AIzaSyB7Tjvl7pf3Acdlon_3pUL0OdECPOAIjsw",
    authDomain: "locationbasedrecycling.firebaseapp.com",
    databaseURL: "https://locationbasedrecycling.firebaseio.com",
    projectId: "locationbasedrecycling",
    storageBucket: "locationbasedrecycling.appspot.com",
    messagingSenderId: "910518074335"
  };
  firebase.initializeApp(config);
  var database = firebase.database();

  $("#add-location").on('click', function () {
    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('#modal1').modal();
    console.log('add button clicked');
  });

  $('#submit-button').on('click', function (event) {
    console.log('submit button clicked');
    event.preventDefault();
    var address = $("#address").val().trim();;
    var locationName = $('#location-name').val().trim();

    // container sizes
    var small;
    var large;
    var rolloff;
    var containerSize = [];
    // checking the container check boxes
    if ($('#small').is(":checked")) {
      small = 'small';
      containerSize.push(small);
    }
    if ($('#large').is(":checked")) {
      large = 'large';
      containerSize.push(large);
    }
    if ($('#rolloff').is(":checked")) {
      rolloff = 'rolloff';
      containerSize.push(rolloff);
    }
    console.log(containerSize);

    // accepted at the location
    var paper;
    var cardboard;
    var plastic;
    var glass;
    var aluminum;
    var steel;
    var acceptedItems = [];
    // checking the accepted check boxes
    if ($('#paper').is(":checked")) {
      paper = 'paper';
      acceptedItems.push(paper);
    }
    if ($('#cardboard').is(":checked")) {
      cardboard = 'cardboard';
      acceptedItems.push(cardboard);
    }
    if ($('#plastic').is(":checked")) {
      plastic = 'plastic';
      acceptedItems.push(plastic);
    }
    if ($('#glass').is(":checked")) {
      glass = 'glass';
      acceptedItems.push(glass);
    }
    if ($('#aluminum').is(":checked")) {
      aluminum = 'aluminum';
      acceptedItems.push(aluminum);
    }
    if ($('#steel').is(":checked")) {
      steel = 'steel';
      acceptedItems.push(steel);
    }
    // checking if the accepted items and container size arrays arrays are empty and if not, pushing them to firebase
    isAdd = true;
    codeAddress(locationName, address, containerSize, acceptedItems, isAdd, callback);
      function callback(address, containerSize, acceptedItems, isValid) {
      if (containerSize.length > 0 && acceptedItems.length > 0 && address !== "" && locationName !== "" && isValid) {
          database.ref().push({
            containerSize: containerSize,
            acceptedItems: acceptedItems,
            address: address,
            locationName: locationName
          })
        // clearing out the modal ////////////////////////
        $('input[type=checkbox]').each(function () {
          this.checked = false;
        });
        $('#address').val('');
        $("#location-name").val('');
        //////////////////////////////////////////////////
      } else if (containerSize.length < 1) {
        $('#error-message').text("Missing Container Size");
        $('#error-message-text').addClass('red-text');
        $('#error-message-text').text("Please check at least one container size.");
        $('#modal2').modal('open');
      } else if (acceptedItems.length < 1) {
        $('#error-message').text("Missing Accepted Items");
        $('#error-message-text').addClass('red-text');
        $('#error-message-text').text("Please check at least one item accepted.");
        $('#modal2').modal('open');
      } else if (address === '') {
        $('#error-message').text("Missing Address");
        $('#error-message-text').addClass('red-text');
        $('#error-message-text').text("Please enter an address.");
        $('#modal2').modal('open');
      } else if (locationName === '') {
        $('#error-message').text("Missing Location Name");
        $('#error-message-text').addClass('red-text');
        $('#error-message-text').text("Please enter a location name.");
        $('#modal2').modal('open');
      } else {
        $('#error-message').text("Invalid Address");
        $('#error-message-text').addClass('red-text');
        $('#error-message-text').text("Please enter a valid address");
        $('#modal2').modal('open');
      }
    } 
  })
  //This simply lets users to dismiss modals

  $('.modal').modal({
    dismissible: true, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    inDuration: 300, // Transition in duration
    outDuration: 200, // Transition out duration
    startingTop: '4%', // Starting top style attribute
    endingTop: '10%', // Ending top style attribute
    ready: function (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
      console.log(modal, trigger);
    },
    complete: function () { } // Callback for Modal close
  }
  );
  
  database.ref().on('child_added', function (childSnapshot) {
    isAdd = false;
    console.log(childSnapshot.key);
    codeAddress(childSnapshot.val().locationName, childSnapshot.val().address, isAdd);
    console.log('running');
    var newDiv = $("<div>");
    newDiv.addClass("col s12");
    $('#location-section').append('<div class="bold-font">' + childSnapshot.val().locationName + '</div>');
    $('#location-section').append('<div>' + 'Address: ' + childSnapshot.val().address + '</div>');
    $('#location-section').append('<div>' +  'Container Size: ' + childSnapshot.val().containerSize.join(", ") + '</div>');
    $('#location-section').append('<div>' + 'Accepted: ' + childSnapshot.val().acceptedItems.join(", ") + '</div>');
    $('#location-section').append('<hr class="hr-separator">');
  });

  //Call to openweathermap to get the current weather
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?" +
      "q=kansas city, missouri&units=imperial&appid=fcb270f477566d619fbad4366058a84a";

    $.ajax({
        url: queryURL,
        method: "GET"
      })
      .then(function(response) {

        var imgIcon = response.weather[0].icon;
        var currentTemp = Math.floor(response.main.temp);
        var highTemp = Math.floor(response.main.temp_max);
        var lowTemp = Math.floor(response.main.temp_min);

        var tempDiv = $("<div id='first-weather-div'>");
        tempDiv.addClass("col s12 m4");
        tempDiv.html("Current Temperature (F): " + currentTemp + 
                    "<br />" + response.weather[0].description);

        var weatherIconDiv = $("<div id='second-weather-div'>");
        weatherIconDiv.addClass("col s12 m4 icon");
        var weatherIcon = $("<img>");
        weatherIcon.attr("src", "http://openweathermap.org/img/w/" + imgIcon + ".png");

        var tempRangeDiv = $("<div id='third-weather-div'>");
        tempRangeDiv.addClass("col s12 m4 temp");
        tempRangeDiv.html("High Temperature (F): " + highTemp + 
                    "<br />" + "Low Temperature (F): " + lowTemp);

        // Transfer content to HTML
        $("#weather-section").append(tempDiv);
        $("#weather-section").append(weatherIconDiv);
        $(".icon").append(weatherIcon);
        $("#weather-section").append(tempRangeDiv);
      });

  $('.crash').on('click', function () {
    $('html').addClass('animated hinge');
})
}); // end of document ready function