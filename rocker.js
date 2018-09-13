
function rocker_main() {
  let config = new RockerConfig("http://192.168.0.101", 5, 5000);
  let rocker = new Rocker(config);
  rocker.authenticate(function(username) {
    if (username == null) {
      console.log("Tried to do that auth thing and failed :(");
    } else {
      console.log("Finished auth cycle!! :)");
      rocker.toggleLights(true, username);
    }
  });
}

class RockerConfig {
  constructor(authLocation, authAttempts, authTimeout) {
    this.authLocation = authLocation;
    this.authAttempts = authAttempts;
    this.authTimeout = authTimeout;
  }
}

class Rocker {
  constructor(config){
    this.config = config;
  }
  
  authenticate(callback) {
    console.log("Beginning to authenticate on " + this.config + "...");

    var checkIfAuthenticated = function(authBlock, successCallback, failureCallback, numberOfAttempts) {
    };

    checkIfAuthenticated = function(authBlock, successCallback, failureCallback, numberOfAttempts) {
      authBlock(function(result) {
       console.log("Checked if user pressed button, result -- " + JSON.stringify(result, null));
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

    var networker = new RockerNetworker(this.config);
    checkIfAuthenticated(function(callback) {
      networker.authenticateWithBridge(callback);
    }, function(username) {
      callback(username);
    }, function() {
      callback(null);
    }, this.config.authAttempts); // check n times
  }

  toggleLights(lightsOnOrOffState, username) {
    var networker = new RockerNetworker(this.config);
    networker.toggleLights(lightsOnOrOffState, username);
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
  
  toggleLights(lightsOnOrOffState, bridgeUsername) {
    var lightsOffLocation = this.config.authLocation + "/api/" + bridgeUsername + "/groups/0/action/";
    var lightsOffBody = {"on": lightsOnOrOffState};
    $.ajax({
      url: lightsOffLocation,
      data: JSON.stringify(lightsOffBody),
      method: "PUT",
      complete: function (data) {
        console.log("Attempted to toggle lights! " + data);
      }
    });
  }
}

