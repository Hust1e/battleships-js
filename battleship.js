function init() {
    initField();
    handleFireButton();
    model.generateShipPositions();
}

function initField() {
    const game_field = document.getElementById('game-field');
    if (!game_field) {
        console.error('Игровое поле отсутствует');
        return;
    }

    for (let i = 0; i < model.boardSize; i++) {
        for (let j = 0; j < model.boardSize; j++) {
            const game_box = document.createElement('div');
            game_box.setAttribute('class', 'game-box');
            game_box.setAttribute('id', `${i}${j}`);
            game_field.appendChild(game_box);
        }
    }
}

function handleFireButton() {
    const fireBtn = document.getElementById('fire-btn');
    const cords = document.getElementById('coordinate');
    if(!fireBtn || !cords) {
        console.error('Кнопка или поле ввода отсутствует');
    }

    fireBtn.addEventListener('click', (e) => {
        e.preventDefault();
        controller.tryGuess(cords.value);
        cords.value = '';
    });
}

function Ship(length){
    this.locations = [];
    this.hits = Array(length).fill('');
}

const view = {
    displayMessage: function (msg) {
        const game_info = document.getElementById('game-info');
        if (!game_info) {
            console.error("Элемент game-info не существует");
            return;
        }

        const fullMessage = document.createElement('span');
        fullMessage.innerText = msg;
        game_info.appendChild(fullMessage);

    },
    displayHit: function (cords) {
        const target = this.isExist(cords);
        if(!target) return;

        target.setAttribute('class', 'game-box hit');
        // this.displayMessage(`Координаты: ${cords} Попал!`);
    },

    displayMiss: function (cords) {
        const target = this.isExist(cords);
        if(!target) return;

        target.setAttribute('class', 'game-box miss');
        this.displayMessage(`Координаты: ${cords} Промах!`);
    },
    isExist: function(cords) {
        const target = document.getElementById(cords);
        if (!target) {
            console.error(`Элемент с id ${cords} не существует.`);
            return null;
        }
        return target;
    },
}

const model = {
    boardSize: 7,
    numShips: 3,
    shipsSunk: 0,
    shipLength: 3,

    ships: [],

    /* Основная механика игры, тут высчитывается попадение и передается в компонент view */
    fire: function (location) {
        for (let ship of this.ships) {
            const hitIndex = ship.locations.indexOf(location);
            if (hitIndex >= 0) { 
                if (ship.hits[hitIndex] === '') {
                    ship.hits[hitIndex] = '1';
                    view.displayHit(location);
                    if (this.isSunk(ship)) {
                        this.shipsSunk++;
                        if (this.gameOver()) {
                            view.displayMessage('Все корабли потоплены, вы победили!');
                        } else {
                            view.displayMessage('Корабль потоплен!');
                        }
                    } else {
                        view.displayMessage(`Попадание в координату ${location}!`);
                    }
                    return true;
                } else {
                    view.displayMessage('Вы уже стреляли в эту координату!');
                    return false;
                }
            }
        }
        view.displayMiss(location);
        return false;
    }
    ,
    /* Метод сначала генерирует корабли и их позиции, а потом
    проверяет на коллизию с уже существующими кораблями или выходом из поля, в случае
    Если они не соответствуют они не добавляются в массив.  */
    generateShipPositions: function() {
        while (this.ships.length < this.numShips) {
            const newShip = this.createRandomShip();
            console.log(newShip);
            if (this.isValidPosition(newShip)) {
                this.ships.push(newShip);
            }
        }
    },

    // Определяет направление корабля, создает его экземпляр и присваивает ему в свойства координаты.
    createRandomShip: function() {
        const direction = Math.random() < 0.5; // true — горизонтально, false — вертикально
        const row = Math.floor(Math.random() * this.boardSize);
        const col = Math.floor(Math.random() * this.boardSize);

        const newShip = new Ship(this.shipLength);
        for (let i = 0; i < this.shipLength; i++) {
            if (direction) {
                newShip.locations.push(`${row}${col + i}`);
            } else {
                newShip.locations.push(`${row + i}${col}`);
            }
        }
        return newShip;
    },

    // Проверяет ново-созданный корабль на коллизии, если корды выходят 
    // за пределы поля или уже существуют в других кораблях то выдает false
    isValidPosition: function(ship) {
        for (let location of ship.locations) {
            const row = parseInt(location.charAt(0));
            const col = parseInt(location.charAt(1));

            if (row >= this.boardSize || col >= this.boardSize) {
                return false; // Координаты выходят за пределы поля
            }
            for (let existingShip of this.ships) {
                if (existingShip.locations.includes(location)) {
                    return false; // Пересечение с другим кораблём
                }
            }
        }
        return true;
    },

    // Проверка корабля на то полностью ли он уничтожен
    isSunk: function (ship) {
        for(let i = 0; i < this.shipLength; i++) {
            if(ship.hits[i] === '') {
                return false;
            }
        }
        return true;
    },

    // Игра считается законченой если количество потопленных кораблей равна их количеству.
    gameOver: function() {
        return this.shipsSunk === this.numShips ? true : false;
    }
}

const controller = {
    guess: 0,
    alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],

    // Метод tryGuess валидирует входные координаты, и передает модели данные координаты.
    tryGuess: function(cord) {
        cord = cord.toLowerCase();
        if(this.guessValidation(cord)) {
            model.fire(this.converterAlphabet(cord));
        } else {
            view.displayMessage('Некоректный ввод. Пожалуйста введите поле в формате "A0" или "b3"');
        }
    },

    // Проверка на валидность введенных координат
    guessValidation: function(cord) {
        if(this.parseCountGuess(cord)) {
            const x = cord.charAt(0);
            const y = parseInt(cord.charAt(1), 10);

            if(this.alphabet.indexOf(x) != -1) {
                if(y < model.boardSize) {
                    return true;
                } else {
                    console.error('Non valid second char')
                }
            } else {
                console.error('Non valid first char');
            }
        } else {
            console.error('Некоректный ввод, нужно вписать координаты в формате a3');
        }
        return false;
    },
    // Проверка на валидность введенной строки (что она не отсутствует) и что её длинна равна 2.
    parseCountGuess: function (coordinat) {
        return (coordinat && coordinat.length === 2) ? true : false;
    },
    // Конвертируем цифру в число, поскольку все наши координаты представленны только в числовом виде по типу 12 а не b2
    converterAlphabet: function(location) {
        return this.alphabet.indexOf(location.charAt(0)) + location.charAt(1);
    }
}

init();