const canvas = document.createElement('canvas')! as HTMLCanvasElement;
const btnAIOne = document.createElement('button')! as HTMLButtonElement;
const btnAITwo = document.createElement('button')! as HTMLButtonElement;
const btnContainer = document.createElement('div')! as HTMLDivElement;
const grid = 50;

canvas.setAttribute('width', String(grid * 20));
canvas.setAttribute('height', String(grid * 15));
canvas.style.border = '1px solid black';
document.body.prepend(canvas);

btnAIOne.textContent = 'Turn on - AI 1 ';
btnAIOne.style.display = 'block';
btnAIOne.style.padding = '10px';
btnAIOne.style.color = 'white';
btnAIOne.style.backgroundColor = 'green';

btnAITwo.textContent = 'Turn on - AI 2';
btnAITwo.style.display = 'block';
btnAITwo.style.padding = '10px';
btnAITwo.style.color = 'white';
btnAITwo.style.backgroundColor = 'green';

btnContainer.style.display = 'flex';
btnContainer.style.justifyContent = 'space-between';
btnContainer.style.alignItems = 'center';
btnContainer.style.width = `${grid * 20 + 3}px`;
btnContainer.append(btnAIOne, btnAITwo);

document.body.prepend(btnContainer);

const ctx = canvas.getContext('2d')!;

type Mixed = Player | Bullet;

class Game {
    req: number;
    bullets: Bullet[];
    bulletSpeed: number;
    bulletSize: number;
    players: Player[];
    minds: Mind[];
    keyZ: { [key: string]: boolean };

    constructor() {
        this.req = -1;
        this.bullets = [];
        this.bulletSpeed = 15;
        this.bulletSize = 10;
        this.players = [
            new Player(
                canvas.width / 2 + grid * 4,
                canvas.height / 2,
                30,
                10,
                'red',
                canvas.width * 0.75,
                0
            ),
            new Player(
                canvas.width / 2 - grid * 4,
                canvas.height / 2,
                30,
                10,
                'blue',
                canvas.width * 0.25,
                1
            ),
        ];
        this.minds = [new Mind(false, 1, 5, 0), new Mind(false, 1, 5, 0)];
        this.keyZ = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            KeyA: false,
            KeyS: false,
            KeyW: false,
            KeyD: false,
        };

        document.addEventListener('keydown', (e) => {
            if (e.code in this.keyZ) {
                this.keyZ[e.code] = true;
            }
            if (e.code === 'Space') {
                this.bullets.push(
                    new Bullet(
                        this.players[0].x -
                            this.players[0].size -
                            this.bulletSize,
                        this.players[0].y,
                        this.bulletSize,
                        this.bulletSpeed * -1,
                        'pink'
                    )
                );
            }
            if (e.code === 'KeyV') {
                this.bullets.push(
                    new Bullet(
                        this.players[1].x + this.players[1].size + 5,
                        this.players[1].y,
                        this.bulletSize,
                        this.bulletSpeed,
                        'lightblue'
                    )
                );
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.code in this.keyZ) {
                this.keyZ[e.code] = false;
            }
        });
        btnAIOne.addEventListener('click', (e) => {
            if (this.minds[0].thinking) {
                this.minds[0].thinking = false;
                btnAIOne.textContent = 'Turn on - AI 1';
                btnAIOne.style.backgroundColor = 'green';
            } else {
                this.minds[0].thinking = true;
                btnAIOne.textContent = 'Turn off - AI 1';
                btnAIOne.style.backgroundColor = '#333';
            }
        });
        btnAITwo.addEventListener('click', (e) => {
            if (this.minds[1].thinking) {
                this.minds[1].thinking = false;
                btnAITwo.textContent = 'Turn on - AI 2';
                btnAITwo.style.backgroundColor = 'green';
            } else {
                this.minds[1].thinking = true;
                btnAITwo.textContent = 'Turn off - AI 2';
                btnAITwo.style.backgroundColor = '#333';
            }
        });
    }

    start() {
        cancelAnimationFrame(this.req);

        this.players.forEach((player, i) => {
            player.score = 0;
            player.x = i === 1 ? canvas.width * 0.25 : canvas.width * 0.75;
            player.y = canvas.height / 2;
        });

        this.req = requestAnimationFrame(this.draw.bind(this));
    }

    playerMovement() {
        // Player 2 - AI
        if (this.minds[0].thinking) {
            this.moveMind(this.minds[0], this.players[0]);
        }
        if (this.minds[1].thinking) {
            this.moveMind(this.minds[1], this.players[1]);
        }

        // Player 1
        if (
            this.keyZ['ArrowLeft'] &&
            this.players[0].x > canvas.width / 2 + this.players[0].size
        ) {
            this.players[0].x -= this.players[0].speed;
        }
        if (
            this.keyZ['ArrowRight'] &&
            this.players[0].x < canvas.width - this.players[0].size
        ) {
            this.players[0].x += this.players[0].speed;
        }
        if (
            this.keyZ['ArrowDown'] &&
            this.players[0].y < canvas.height - this.players[0].size
        ) {
            this.players[0].y += this.players[0].speed;
        }
        if (this.keyZ['ArrowUp'] && this.players[0].y > this.players[0].size) {
            this.players[0].y -= this.players[0].speed;
        }

        // Player 2 - No AI
        if (this.keyZ['KeyA'] && this.players[1].x > this.players[1].size) {
            this.players[1].x -= this.players[1].speed;
        }
        if (
            this.keyZ['KeyD'] &&
            this.players[1].x < canvas.width / 2 - this.players[1].size
        ) {
            this.players[1].x += this.players[1].speed;
        }
        if (
            this.keyZ['KeyS'] &&
            this.players[1].y < canvas.height - this.players[1].size
        ) {
            this.players[1].y += this.players[1].speed;
        }
        if (this.keyZ['KeyW'] && this.players[1].y > this.players[1].size) {
            this.players[1].y -= this.players[1].speed;
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        this.playerMovement();

        this.players.forEach((player) => {
            player.draw();
        });

        this.bullets.forEach((bullet, index) => {
            bullet.draw();

            if (bullet.x < 0 || bullet.x > canvas.width) {
                this.bullets.splice(index, 1);
            }

            this.players.forEach((player, i) => {
                if (this.colDetection(bullet, player)) {
                    this.bullets.splice(index, 1);
                    if (i == 0) {
                        this.players[1].score++;
                    } else {
                        this.players[0].score++;
                    }
                }
            });
        });

        this.req = requestAnimationFrame(this.draw.bind(this));
    }

    colDetection(a: Mixed, b: Mixed) {
        let xHasCol = a.x <= b.x + b.size && a.x >= b.x - b.size;
        let yHasCol = a.y <= b.y + b.size && a.y >= b.y - b.size;
        return xHasCol && yHasCol;
    }

    moveMind(mind: Mind, player: Player) {
        let shootTime = Math.floor(Math.random() * 15);

        if (shootTime === 1) {
            this.bullets.push(
                new Bullet(
                    player.index === 0
                        ? player.x - player.size - this.bulletSize
                        : player.x + player.size + this.bulletSize,
                    player.y,
                    this.bulletSize,
                    player.index === 0 ? -this.bulletSpeed : this.bulletSpeed,
                    'lightblue'
                )
            );
        }

        if (mind.count > 0) {
            mind.count--;
        } else {
            mind.count = 30;

            let valX = Math.floor(Math.random() * 7);
            let valY = Math.floor(Math.random() * 20);
            let valZ = Math.floor(Math.random() * 2) + 3;

            // Move AI in X directions randomly
            if (valX == 1) {
                // Jump back
                if (player.index === 0) {
                    if (player.x + player.size + 1 >= canvas.width) {
                        mind.dirX *= -1;
                    } else {
                        mind.dirX = 1;
                    }
                } else {
                    if (player.x - player.size - 1 <= 0) {
                        mind.dirX *= -1;
                    } else {
                        mind.dirX = -1;
                    }
                }
            } else if (valX === 2) {
                // Jump forwards
                if (player.index === 0) {
                    if (player.x - player.size - 1 <= canvas.width / 2) {
                        mind.dirX *= -1;
                    } else {
                        mind.dirX = -1;
                    }
                } else {
                    if (player.x + player.size + 1 >= canvas.width / 2) {
                        mind.dirX *= -1;
                    } else {
                        mind.dirX = 1;
                    }
                }
            } else {
                mind.dirX = 0;
            }

            let oppVal = player.index === 0 ? 1 : 0;

            // Move AI player in Y direction towards other player
            // With varying distances check random jump between 1-10px
            // Move then in direction of other player with random speed 3 - 5
            if (player.y + valY < this.players[oppVal].y) {
                // Jump down
                mind.dirY = valZ;
            } else if (player.y + valY > this.players[oppVal].y) {
                // Jump up
                mind.dirY = -valZ;
            }

            // loop over bullet to check if incoming to AI
            this.bullets.forEach((bullet) => {
                if (bullet.speed < 0 && player.index === 1) {
                    // only try dodge bullet if in range of -40px +40px Y distance from center of AI player
                    if (
                        player.y + 40 >= bullet.y &&
                        player.y - 40 <= bullet.y
                    ) {
                        // check if below or above bullet and update dodge accordingly
                        if (bullet.y <= player.y) {
                            mind.dirY = valZ;
                        } else {
                            mind.dirY = -valZ;
                        }
                    }
                } else if (bullet.speed > 0 && player.index === 0) {
                    // only try dodge bullet if in range of -40px +40px Y distance from center of AI player
                    if (
                        player.y + 40 >= bullet.y &&
                        player.y - 40 <= bullet.y
                    ) {
                        // check if below or above bullet and update dodge accordingly
                        if (bullet.y <= player.y) {
                            mind.dirY = valZ;
                        } else {
                            mind.dirY = -valZ;
                        }
                    }
                }
            });
        }

        player.x += mind.dirX;
        player.y += mind.dirY;
    }
}
class Player {
    x: number;
    y: number;
    size: number;
    speed: number;
    color: string;
    score: number;
    scorePos: number;
    index: number;

    constructor(
        x: number,
        y: number,
        size: number,
        speed: number,
        color: string,
        scorePos: number,
        index: number
    ) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.scorePos = scorePos;
        this.score = 0;
        this.index = index;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Score: ' + this.score, this.scorePos, 50);

        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, 5, 5);
    }
}
class Bullet {
    x: number;
    y: number;
    size: number;
    speed: number;
    color: string;

    constructor(
        x: number,
        y: number,
        size: number,
        speed: number,
        color: string
    ) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        this.x += this.speed;
    }
}
class Mind {
    thinking: boolean;
    dirX: number;
    dirY: number;
    count: number;

    constructor(thinking: boolean, dirX: number, dirY: number, count: number) {
        this.thinking = thinking;
        this.dirX = dirX;
        this.dirY = dirY;
        this.count = count;
    }
}

canvas.addEventListener('click', () => {
    const game = new Game();
    game.start();
});
