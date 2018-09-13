
function authenticate() {
  var rocker = new Rocker();
  rocker.authenticate(function() {
    rocker.turnLightsOff();
  });
}



class Rocker {
  var bridgeIPAddress = "192.168.0.101";
  var bridgeUsername = "";
  
  function authenticate(callback) {
    authenticateWithBridge(function(result) {
      console.log("Sent auth request! User needs to press button -- " + result);
    });

    setTimeout(function() {
      authenticateWithBridge(function(result) {
        console.log("Checked if user pressed button, result -- " + result);
        var parsedUsername = result["success"]["username"];
        if (parsedUsername) {
          bridgeUsername = authResult["success"]["username"];
          callback();
        }
      });
   }, 500); // wait 1/2 a sec

  function authenticateWithBridge(callback) {
    $.ajax({
      url: bridgeIPAddress + "/api/",
      method: "POST",
      always: function (data) {
        callback(data);
      }
    });
  }
  
  function turnLightsOff() {
      $.ajax({
      url: bridgeIPAddress + "/api/" + bridgeUsername + "/groups/0/action",
      data: {"on":false},
      method: "PUT",
      always: function (data) {
        callback(data);
      }
    });
  }
}

