app.controller("indexController", [
  "$scope",
  "indexFactory",
  "configFactory",
  ($scope, indexFactory, configFactory) => {
    $scope.messages = [];
    $scope.players = {};
    $scope.init = () => {
      const username = prompt("Please Enter Username");
      if (username) initSocket(username);
      else return false;
    };
    function scrollTop() {
      setTimeout(() => {
        const element = document.getElementById("chat-area");
        element.scrollTop = element.scrollHeight;
      });
    }
    function showBubble(id, message) {
      $("#" + id)
        .find(".message")
        .show()
        .html(message);

      setTimeout(() => {
        $("#" + id)
          .find(".message")
          .hide();
      }, 2000);
    }
    async function initSocket(username) {
      const connectionOptions = {
        reconnectionAttempts: 3,
        reconnectionDelay: 600
      };
      try {
        const socketUrl = await configFactory.getConfig();
        console.log(socketUrl);
        const socket = await indexFactory.connectSocket(
          socketUrl.data.socketUrl,
          connectionOptions
        );
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
          scrollTop();
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
          delete $scope.players[user.id];
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
        socket.on("newMessage", data => {
          $scope.messages.push(data);
          $scope.$apply();
          showBubble(data.socketId, data.text);
          scrollTop();
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
        $scope.newMessage = () => {
          let message = $scope.message;
          const messageData = {
            type: {
              code: 1
            },
            username: username,
            text: message
          };
          $scope.messages.push(messageData);
          $scope.message = "";

          socket.emit("newMessage", messageData);
          showBubble(socket.id, message);
          scrollTop();
        };
      } catch (e) {
        console.log(e);
      }
    }
  }
]);
