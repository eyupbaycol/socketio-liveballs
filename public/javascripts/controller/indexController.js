app.controller("indexController", [
  "$scope",
  "indexFactory",
  ($scope, indexFactory) => {
    $scope.messages = [];
    $scope.players = {};
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

          socket.on("initPlayers", players => {
            $scope.players = players;
            $scope.$apply();
          });

          socket.on("newUser", data => {
            const messageData = {
              type: {
                code: 0,
                message: "katıldı"
              }, //info
              username: data.username
            };
            $scope.messages.push(messageData);
            $scope.players[data.id] = data;
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
            delete $scope.players[data.id];
            $scope.$apply();
          });
          socket.on("animate", data => {
            $("#" + data.socketId).animate(
              {
                left: data.x,
                top: data.y
              },
              () => {
                animate = false;
              }
            );
          });
          let animate = false;
          $scope.onClickPlayer = $event => {
            if (!animate) {
              let x = $event.offsetX;
              let y = $event.offsetY;
              animate = true;
              $("#" + socket.id).animate(
                {
                  left: x,
                  top: y
                },
                () => {
                  animate = false;
                }
              );
              socket.emit("animate", { x, y });
            }
          };
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
]);
