#!/usr/bin/env node

// ------------------ //
/// Alexa Skill section ///
// ------------------ //

var alexa = require('alexa-app');

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

// Define an alexa-app with name that matches name on Alexa Skills Kit
var app = new alexa.app('robo-care');

app.launch(function(req, res) {
  console.log("robo-care: LaunchIntent");
  res.say("Launched publish example skill");
});

app.intent("PublishHelloIntent", {
  "utterances": ["Say hello"]
}, function(req, res) {
  // Log to console that the intent was received
  console.log("robo-care: PublishHelloIntent");
  // Do stuff with ROS using ROSLIB
  // You can see this String message if you are running rostopic echo /alexa_msgs
  str_msg  =new ROSLIB.Message({data: 'robo-care says hello'})
  msg_topic.publish(str_msg);
  // Send a response back to the Echo for the voice interface
  res.say('Hello human');
});

app.intent("PublishGoodbyeIntent", {
  "utterances": ["Publish goodbye", "Say goodbye"]
}, function(req, res) {
  // Log to console that the intent was received
  console.log("robo-care: PublishGoodbyeIntent");
  // Do stuff with ROS using ROSLIB
  // You can see this String message if you are running rostopic echo /alexa_msgs
  str_msg  =new ROSLIB.Message({data: 'robo-care says goodbye'})
  msg_topic.publish(str_msg);
  // Send a response back to the Echo for the voice interface
  res.say('Goodbye human');
});

// NOTE: Be careful with this alexa skill intent!
// The cmd_vel topic is often used for robot platform movement, so either change
// the topic name defined below or be ready for suddent movements I guess
app.intent("PublishTwistIntent", {
  "utterances": ["Publish twist", "Send twist", "Command a twist"]
}, function(req, res) {
  console.log('robo-care: PublishTwistIntent - publishing Twist...')
  // Create Twist message to publish, requires more work than just a std_msgs/String
  var twist = new ROSLIB.Message({
    linear: {
      x: 0.1,
      y: 0.0,
      z: 0.0
    },
    angular: {
      x: 0.0,
      y: 0.0,
      z: 0.1
    }
  });
  // You can see this Twist message if you are running rostopic echo /cmd_vel
  cmd_vel_topic.publish(twist);
  console.log('robo-care: PublishTwistIntent - done publishing');
  // Send a response back to the Echo for the voice interface
  res.say('Published twist command');
});

app.intent("MoveRoom", {
  "slots": {"num" : "AMAZON.NUMBER",
            "name" : "AMAZON.US_FIRST_NAME"},
  "utterances": ["move to room {-|num}", "go to room {-|num}", "go to {-|name} room"]
},
function(req,res){
  console.log('robo-care: PublishMoveIntent - publishing Move...')
  var num = req.slots["num"];
  var name = req.slot("name");
  if(num.value){
    move_room_topic.publish(num.value);
    console.log('robo-care: PublishMoveIntent - publishing num');

    res.say("Move to room " + num.value);

  }
  else{
    move_room_topic.publish(name);
    console.log('robo-care: PublishMoveIntent - publishing name');

    res.say("Move to " +name+ " room");

  }

  console.log('robo-care: PublishMoveIntent - done publishing');


});

// ------------------ //
/// ROS Interface section ///
// ------------------ //

// Connecting to ROS
var ROSLIB = require('roslib');
// rosbridge_websocket defaults to port 9090
var ros = new ROSLIB.Ros({url: 'ws://localhost:9090'});

ros.on('connection', function() {
  console.log('robo-care: Connected to websocket server.');
});

ros.on('error', function(error) {
  console.log('robo-care: Error connecting to websocket server: ', error);
});

ros.on('close', function() {
  console.log('robo-care: Connection to websocket server closed.');
});

// Setup a ROSLIB topic for each ROS topic you need to publish to
// publish Strings to /alexa_msgs and publish Twists to /cmd_vel
var msg_topic = new ROSLIB.Topic({ros: ros, name: '/alexa_msgs', messageType: 'std_msgs/String'});
// NOTE: The cmd_vel topic is often used for robot platform movement, change the
// topic name to like cmd_vel2 if you have a robot that you don't want moving
var cmd_vel_topic = new ROSLIB.Topic({ros: ros, name: '/cmd_vel', messageType: 'geometry_msgs/Twist'});

var move_room_topic = new ROSLIB.Topic({ros: ros, name: '/move_room', messageType: 'std_msgs/String'});


// Export the alexa-app we created at the top
module.exports = app;
