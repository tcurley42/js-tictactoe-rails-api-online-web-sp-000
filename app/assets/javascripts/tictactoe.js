// Code your JavaScript / jQuery solution here
$(document).ready(function () {
    attachListeners();
})

const WIN_COMBINATIONS =
    [[0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8]];

var game = {state: ['','','','','','','','','']};
var turn = 0;

function player() {
    if (turn%2 === 0) {
        return "X";
    } else {
        return "O";
    }
}

function updateState(element) {
    element.innerHTML = player();
    let x = element.getAttribute("data-x");
    let y = element.getAttribute("data-y");
    let index = parseInt(y)*3 + parseInt(x);
    game["state"][index] = element.innerHTML;
}

function setMessage() {
    $("div#message").html(`Player ${player()} Won!`);
}

function checkWinner() {
    for (let c in WIN_COMBINATIONS) {
        let combo = WIN_COMBINATIONS[c];
        if (game["state"][combo[0]] != "" && game["state"][combo[0]] == game["state"][combo[1]] && game["state"][combo[1]] == game["state"][combo[2]]) {
            setMessage();
            return true;
        } else {
            continue;
        }
    }
    return false;
}

function doTurn(element) {
    updateState(element);
    checkWinner();
    ++turn;
}

function attachListeners() {
    $("button#save").on('click', function() {
        if (game["id"] != undefined) {
            $.ajax({
                url : '/games/' + game["id"],
                data : JSON.stringify(game),
                type : 'PATCH',
                contentType : 'application/json',
                dataType : 'json'},
                function(data){

            });
        } else {
            $.post('/games', game, function(data) {
                game["id"] = data["data"]["id"];
            });
        }
    });

    $("button#previous").on('click', function() {
        $.get('/games', function(data) {
           let games = data["data"];
           if (games.length > 0) {
               let previous = "<ul>";
               games.forEach(function (game) {
                   previous += `<li><button class="game" id="game-${game["id"]}" data-id="${game["id"]}">${game["id"]}</button></li>`
               });
               previous += "</ul>";
               $("div#games").html(previous);

               $("button.game").on('click', function () {
                   $.get('/games/' + $(this).data("id"), function (data) {
                       game["id"] = data["data"]["id"];
                       game["state"] = data["data"]["attributes"]["state"];
                       updateBoard();
                   });
               });
           }
        });
    });

    $("button#clear").on('click', function() {
        clearState();
    });

    $("td").on('click', function() {
        doTurn($(this).get(0));
    });
}

function saveGame() {
    $.post('/games', `{"state": ${state}`)
}

function clearState() {
    $("td").html("");
    $("div#message").html("");
    turn = 0;
    updateState();
}

function updateBoard() {
    for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 3; ++j) {
            let index = i*3 + j;
            $(`td[data-x='${j}'][data-y='${i}']`).html(game["state"][index]);
        }
    }
}
