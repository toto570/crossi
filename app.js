// DOMContentLoadedイベントを待ってからスクリプトを実行
window.addEventListener('DOMContentLoaded', () => {
    // HTML要素を取得
    const gameContainer = document.getElementById('game-container');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    // ゲーム設定
    let gridSize, gameWidth, gameHeight;
    let playerX, playerY;
    let score = 0;
    let maxScore = 0;
    let isGameOver = false;
    let obstacles = [];
    let gameLoopInterval;
    let obstacleInterval;

    // ゲーム盤面のサイズに基づいて変数を設定する
    function setupGameDimensions() {
        gameWidth = gameContainer.clientWidth;
        gameHeight = gameContainer.clientHeight;
        gridSize = gameWidth / 10; // 盤面を10x15のグリッドに分割

        player.style.width = `${gridSize}px`;
        player.style.height = `${gridSize}px`;
    }

    // ゲームを初期化/リセットする関数
    function initializeGame() {
        isGameOver = false;
        score = 0;
        maxScore = 0;
        scoreDisplay.textContent = score;

        setupGameDimensions();

        playerX = gridSize * 4;
        playerY = 0;
        updatePlayerPosition();

        // 既存の障害物をクリア
        obstacles.forEach(o => o.remove());
        obstacles = [];

        gameOverScreen.classList.add('hidden');
        
        // 既存のインターバルをクリア
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        if (obstacleInterval) clearInterval(obstacleInterval);
        
        startGame();
    }

    // プレイヤーの位置を更新
    function updatePlayerPosition() {
        player.style.left = `${playerX}px`;
        player.style.bottom = `${playerY}px`;
    }
    
    // キーボード操作
    function handleKeyDown(e) {
        if (isGameOver) return;
        switch (e.key) {
            case 'ArrowUp': movePlayer(0, 1); break;
            case 'ArrowDown': movePlayer(0, -1); break;
            case 'ArrowLeft': movePlayer(-1, 0); break;
            case 'ArrowRight': movePlayer(1, 0); break;
        }
    }

    // プレイヤーを動かす
    function movePlayer(dx, dy) {
        const newX = playerX + dx * gridSize;
        const newY = playerY + dy * gridSize;

        if (newX >= 0 && newX <= gameWidth - gridSize) {
            playerX = newX;
        }
        if (newY >= 0 && newY <= gameHeight - gridSize) {
            playerY = newY;
        }
        
        // 前進した最高到達点をスコアにする
        const currentYLevel = Math.floor(playerY / gridSize);
        if (currentYLevel > maxScore) {
            maxScore = currentYLevel;
            score++;
            scoreDisplay.textContent = score;
        }

        updatePlayerPosition();
    }

    // 障害物を生成
    function createObstacle() {
        if (isGameOver) return;
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        
        const obstacleWidth = gridSize * (Math.random() * 2 + 1.5); // 幅をランダムに
        const lane = Math.floor(Math.random() * 12) + 2; // プレイヤーのスタート地点とゴール付近を避ける
        const speed = (Math.random() * 0.5 + 0.5) * (gameWidth / 200);
        const direction = Math.random() < 0.5 ? 'left' : 'right';

        obstacle.style.width = `${obstacleWidth}px`;
        obstacle.style.height = `${gridSize}px`;
        obstacle.style.top = `${lane * gridSize}px`;
        obstacle.dataset.speed = speed;
        obstacle.dataset.direction = direction;

        if (direction === 'left') {
            obstacle.style.left = `${gameWidth}px`;
        } else {
            obstacle.style.left = `-${obstacleWidth}px`;
        }

        gameContainer.appendChild(obstacle);
        obstacles.push(obstacle);
    }

    // 障害物を動かす
    function moveObstacles() {
        obstacles.forEach((obstacle, index) => {
            const speed = parseFloat(obstacle.dataset.speed);
            if (obstacle.dataset.direction === 'left') {
                obstacle.style.left = `${obstacle.offsetLeft - speed}px`;
            } else {
                obstacle.style.left = `${obstacle.offsetLeft + speed}px`;
            }

            // 画面外に出たら削除
            if (obstacle.offsetLeft < -obstacle.offsetWidth || obstacle.offsetLeft > gameWidth) {
                obstacle.remove();
                obstacles.splice(index, 1);
            }
        });
    }

    // 衝突判定
    function checkCollision() {
        const pRect = player.getBoundingClientRect();
        for (const obstacle of obstacles) {
            const oRect = obstacle.getBoundingClientRect();
            if (
                pRect.left < oRect.right &&
                pRect.right > oRect.left &&
                pRect.top < oRect.bottom &&
                pRect.bottom > oRect.top
            ) {
                gameOver();
                return;
            }
        }
    }

    // ゲームオーバー処理
    function gameOver() {
        if(isGameOver) return;
        isGameOver = true;
        clearInterval(gameLoopInterval);
        clearInterval(obstacleInterval);
        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    // ゲームのメインループ
    function gameLoop() {
        if(isGameOver) return;
        moveObstacles();
        checkCollision();
    }

    // ゲーム開始
    function startGame() {
        gameLoopInterval = setInterval(gameLoop, 20);
        obstacleInterval = setInterval(createObstacle, 1000);
    }

    // イベントリスナーの設定
    document.addEventListener('keydown', handleKeyDown);
    restartButton.addEventListener('click', initializeGame);
    window.addEventListener('resize', initializeGame); // 画面リサイズ時にもゲームをリセット

    // スワイプ操作の追加
    let touchStartX, touchStartY;
    gameContainer.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    gameContainer.addEventListener('touchend', e => {
        if (isGameOver) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) { // 横方向のスワイプ
            if (Math.abs(dx) > 30) { // 一定以上のスワイプ距離
                movePlayer(dx > 0 ? 1 : -1, 0);
            }
        } else { // 縦方向のスワイプ
            if (Math.abs(dy) > 30) {
                movePlayer(0, dy > 0 ? -1 : 1); // Y軸は下が正なので逆
            }
        }
    });

    // 初期化
    initializeGame();
});
