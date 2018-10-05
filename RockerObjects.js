
class RockerConfig {
  constructor(authLocation, authAttempts, authTimeout) {
    this.authLocation = authLocation;
    this.authAttempts = authAttempts;
    this.authTimeout = authTimeout;
  }
}

class RockerAuthenticator {
  constructor(networker) {
    this.networker = networker;
  }
  
  authenticate(callback) {
    var checkIfAuthenticated = function(authBlock, successCallback, failureCallback, numberOfAttempts) {
    };

    checkIfAuthenticated = function(authBlock, successCallback, failureCallback, numberOfAttempts) {
      authBlock(function(result) {
       rocker_log("Checked if user pressed button, result -- " + JSON.stringify(result, null));
       if (result && result["responseJSON"] && result["responseJSON"][0] && result["responseJSON"][0]["success"] && result["responseJSON"][0]["success"]["username"]) {
          successCallback(result["responseJSON"][0]["success"]["username"]); // username in response! continue...
       } else {
          if (numberOfAttempts-1>0) {
            checkIfAuthenticated(authBlock, successCallback, failureCallback, numberOfAttempts-1);
          } else {
            failureCallback(); // unable to auth after attempts <= 0
          }
       }
      }); 
    };

    var networker = this.networker;
    checkIfAuthenticated(function(aCallback) {
      networker.authenticateWithBridge(aCallback);
    }, function(username) {
      callback(username);
    }, function() {
      callback(null);
    }, networker.config.authAttempts); // check n times
  }
}

class RockerNetworker {
  constructor(config){
    this.config = config;
  }

  authenticateWithBridge(callback) {
    var authLocation = this.config.authLocation + "/api/";
    var authBody = {"devicetype" : "rocker#debug julian"};
    setTimeout(function() {
      $.ajax({
        url: authLocation,
        method: "POST",
        data: JSON.stringify(authBody),
        complete: function (data) {
          callback(data);
        }
      });
    }, this.config.authTimeout);
  }
  
  toggleLights(lightsOnOrOffState, bridgeUsername, xyVal) {
    var lightsOffLocation = this.config.authLocation + "/api/" + bridgeUsername + "/groups/3/action";
    rocker_log("Location =  " + lightsOffLocation);
    var lightsOffBody = {"on": lightsOnOrOffState, "xy": xyVal};
    var lightsOffString = JSON.stringify(lightsOffBody);

    rocker_log("Body = " + lightsOffBody + " String = " + lightsOffString);
    
    $.ajax({
      url: lightsOffLocation,
      data: lightsOffString,
      method: "PUT",
      complete: function (data) {
        rocker_log("Attempted to toggle lights! " + data);
      }
    });
  }
  
  pressLinkButton(bridgeUsername) {
    var linkButtonLocation = this.config.authLocation + "/api/" + bridgeUsername + "/config";
    var linkButtonBody = {"linkbutton": true};
    var linkButtonString = JSON.stringify(linkButtonBody);
    
    $.ajax({
      url: linkButtonLocation,
      data: linkButtonString,
      method: "PUT",
      complete: function (data) {
        rocker_log("Attempted to press link button! " + data);
      }
    });
  }
}

