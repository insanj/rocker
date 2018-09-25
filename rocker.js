
function rocker_log(debugString) {
  $("#content").prepend(debugString + "<br/>----------<br/>");
}

/////

var rocker_username = "LJrsZ91tP4Btgl7BYf80Ga50cz6n9NhtdGHKkLOw";
let config = new RockerConfig("http://192.168.0.101", 5, 5000);
let networker = new RockerNetworker(config);
let rocker = new RockerAuthenticator(networker);

$("#rocker").submit(function(event) {
  event.preventDefault();
  let rockerInputR = $("#red").val();
  let rockerInputG = $("#green").val();
  let rockerInputB = $("#blue").val();

  rocker_log("Attempting to convert " + rockerInputR + rockerInputG + rockerInputB);
  let rockerColorXY = rgb_to_cie(rockerInputR, rockerInputG, rockerInputB);
  rocker_log("XY = " + rockerColorXY);
  let rockerColorXYInts = [parseFloat(rockerColorXY[0]), parseFloat(rockerColorXY[1])];
  networker.toggleLights(true, rocker_username, rockerColorXYInts);
});

function rocker_main() {
  if (rocker_username == null) {
    rocker_log("Beginning to authenticate on " + config + "...");
    rocker.authenticate(function(username) {
      if (username == null) {
        rocker_log("Tried to do that auth thing and failed :(");
      } else {
        rocker_log("Finished auth cycle!! :)");
        rocker_username = username;
      }
    });
  } else {
    rocker_log("Logged in as " + rocker_username);
  }
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function do_forever() {
  var color = randomColor().replace("#", "");
  rocker_log(color);
  var colorRGB = hexToRgb(color);
  rocker_log(colorRGB);

  let rockerColorXY = rgb_to_cie(colorRGB["r"], colorRGB["g"], colorRGB["b"]);
  rocker_log("colorRGB XY = " + rockerColorXY);
  let rockerColorXYInts = [parseFloat(rockerColorXY[0]), parseFloat(rockerColorXY[1])];
  networker.toggleLights(true, rocker_username, rockerColorXYInts);

  setTimeout(function() {
    do_forever();
  }, 2000);
}

do_forever();