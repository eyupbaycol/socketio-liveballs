app.controller("indexController", [
  "$scope",
  "indexFactory",
  ($scope, indexFactory) => {
    $scope.messages = [];
    $scope.init = () => {
      const username = prompt("Please Enter Username");
      if (username) initSocket(username);
      else return false;
    };
    function initSocket(username) {
      const connectionOptions = {
        reconnectionAttempts: 3,
        reconnectionDelay: 600
      };
      indexFactory
        .connectSocket("http://localhost:3000", connectionOptions)
        .then(socket => {
          // console.log("Bağlantı Gerçekleşti", socket);
          socket.emit("newUser", { username });
          socket.on("newUser", data => {
            const messageData = {
              type: {
                code: 0,
                message: "katıldı"
              }, //info
              username: data.username
            };
            $scope.messages.push(messageData);
            $scope.$apply();
          });

          socket.on("disUser", user => {
            const messageData = {
              type: {
                code: 0,
                message: "ayrıldı"
              }, //info
              username: user.username
            };
            $scope.messages.push(messageData);
            $scope.$apply();
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
]);
