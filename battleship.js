function init() {
    initField();
    handleFireButton();
}

function initField() {
    const game_field = document.getElementById('game-field');
    if (game_field) {
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                const game_box = document.createElement('div');
                game_box.setAttribute('class', 'game-box');
                game_box.setAttribute('id', `${i}${j}`);
                game_field.appendChild(game_box);
            }
        }
    } else {
        console.log('field not exist');
    }
}

function handleFireButton() {
    const fireBtn = document.getElementById('fire-btn');
    const cords = document.getElementById('coordinate');
    if(fireBtn && cords) {
        fireBtn.addEventListener('click', (e) => {
            e.preventDefault();
            controller.tryGuess(cords.value);
            cords.value = '';
        })
    } else {
        console.log('fire-btn or input form not exist');
    }
}

let view = {
    displayMessage: function (msg) {
        const game_info = document.getElementById('game-info');
        if (game_info) {
            let fullmessage = document.createElement('p');
            fullmessage.innerText = msg;
            game_info.appendChild(fullmessage);
        } else {
            console.log('Game info not exist on DOM');
        }

    },
    displayHit: function (location) {
        const target = document.getElementById(location);
        if (target) {
            target.setAttribute('class', 'game-box hit');
            view.displayMessage('Hit to location: ' + location + ' BOOM!');
        } else {
            console.log('target not exist');
        }
    },

    displayMiss: function (location) {
        const target = document.getElementById(location);
        if(target) {
            target.setAttribute('class', 'game-box miss');
            view.displayMessage('Hit to location:' + location + ' MISS!');
        } else {
            console.log('element not exist in DOM');
        }
    },
}

let model = {
    boardSize: 7,
    numShips: 3,
    shipsSunk: 0,
    shipLength: 3,

    ships: [
        { locations: ['00', '01', '02'], hits: ['', '', ''] },
        { locations: ['10', '11', '12'], hits: ['', '', ''] },
        { locations: ['20', '21', '22'], hits: ['', '', ''] },
    ],

    fire: function (location) {
        for (let i = 0; i < this.numShips; i++) {
            const ship = this.ships[i];
            const locations = ship.locations;
            for (let j = 0; j < this.shipLength; j++) {
                if (location == locations[j]) {
                    if(ship.hits[j] == '') {
                        ship.hits[j] = '1';
                        if(this.isSunk(ship)) {
                            this.shipsSunk++;
                            if(this.gameOver()) {
                                view.displayMessage('Game is over!');
                            } else {
                                view.displayMessage('Ship is sunk');
                            }
                        }
                        view.displayHit(location);
                        return true;
                    } else {
                        alert('you cant fire in ship he is already fired');
                    }
                }
            }
        }
        view.displayMiss(location);
        return false;
    },

    isSunk: function (ship) {
        for(let i = 0; i < this.shipLength; i++) {
            if(ship.hits[i] == '') {
                return false;
            }
        }
        return true;
    },

    gameOver: function() {
        return this.shipsSunk == this.numShips ? true : false;
    }

}

let controller = {
    guess: 0,
    alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],

    tryGuess: function(location) {
        if(this.guessValidation(location)) {
            model.fire(this.converterAlphabet(location));
        } else {
            // Повтор выстрела
        }
    },

    guessValidation: function(coordiant) {
        if(this.parseCountGuess(coordiant)) {
            if(this.alphabet.indexOf(coordiant.charAt(0)) >= 0) {
                if(coordiant.charAt(1) < 7) {
                    return true;
                } else {
                    console.log('non valid second character')
                }
            } else {
                console.log('non valid first character');
            }
        } else {
            console.log('non valid many characters');
        }
        return false;
    },

    parseCountGuess: function (coordinat) {
        return (coordinat != null && coordinat.length == 2) ? true : false;
    },

    converterAlphabet: function(location) {
        return this.alphabet.indexOf(location.charAt(0)) + location.charAt(1);
    }
}

init();