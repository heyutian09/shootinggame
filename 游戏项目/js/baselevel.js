window.onload = function gamestart() {
    var levelNow = 1;
    var play = document.getElementById("js-play");
    play.onclick = function () {
        document.getElementById("game-intro").style.display = "none";
        document.getElementById("game-info").style.display = "block";
        document.getElementById("c1").style.display = "block";
        level(); //游戏开始
    }
    var replay = document.getElementById("js-replay");
    replay.onclick = function () {
        window.location.href = 'index.html';
    }
    var next = document.getElementById("js-next");
    next.onclick = function () {
        document.getElementById("game-info").style.display = "block";
        document.getElementById("game-success").style.display = "none";
        document.getElementById("game-failed").style.display = "none";
        nextLevel();
    }

    var playAgain = document.getElementById("js-playagain");
    playAgain.onclick = function () {
        window.location.href = 'index.html';
    }

    function nextLevel() {
        CONFIG.enemyLine += 1;
        if (CONFIG.enemyLine <= CONFIG.totalLevel){
            document.getElementById("game-info").style.display = "block";
            level();//进行下一level的游戏
            levelNow++;
        }
        else if(levelNow >= CONFIG.totalLevel){
            gameDone();
        }
    }
    function gameDone() {
        jc.canvas("c1").clear();
        document.getElementById("game-all-success").style.display = "block";
        document.getElementById("game-info").style.display = "none";
        document.getElementById("game-success").style.display = "none";
        document.getElementById("game-failed").style.display = "none";
    }
}

function level() {
    var score = 0;
    var bullets = new Array;
    var enemys = new Array;
    var num = 0;
    var tempEnemyNumber = CONFIG.enemyNumber*CONFIG.enemyLine;
    var step = CONFIG.enemyStep;
    init();

    function init() {
        jc.start("c1", 1);
        jc.rect(0, 0, 700, 600).id("rect"); //绘制整体的画布
        jc.start("c1");
        addPlayer();
    }

    function addPlayer() {
        plane();
        enemy();
    }

    function bullet() { //绘制子弹
        var plane = jc("#plane").position();
        var x = plane.x + (CONFIG.planeSize.width / 2);
        var y = plane.y;
        jc.start("c1", 1);
        var abullet = jc.rect(x, y, 1, CONFIG.bulletSize, "#fff").id("bullet" + num);
        bullets[num] = abullet;
        jc.start("c1");
        setInterval(fly, CONFIG.fps);
        function fly() {
            jc("#" + abullet.id()).translate(0, -CONFIG.bulletStep);
            if (jc("#" + abullet.id()).position().y < CONFIG.canvasPadding)
                jc("#" + abullet.id()).del();
        }
    }

    function plane() { //绘制飞机和飞机飞行的区域
        var img = new Image();
        img.src = CONFIG.planeIcon;
        img.onload = function () {
            jc.start("c1", 1);
            jc.rect(CONFIG.canvasPadding, 500 - CONFIG.canvasPadding, 640, 100).id("planearea");
            jc.image(img, 330, 470, CONFIG.planeSize.width, CONFIG.planeSize.height).id("plane");
            jc.start("c1");
        }
    }

    function planeEdgeJudge() { //判断飞机是否超越边框
        var planePosition = jc("#plane").position();
        var planeX = planePosition.x;
        var planeY = planePosition.y;
        var planeRect = jc("#planearea").position();
        var planeRectX = planeRect.x;
        var planeRectY = planeRect.y;
        if (planeX < planeRect.x) {
            return false;
        }
        else if (planeX > planeRect.x + 580) {
            return true;
        }
    }

    document.onkeydown = function (event) {
        if (planeEdgeJudge() === false) {
            jc("#plane").translate(1, 0);
        }
        else if (planeEdgeJudge() === true) {
            jc("#plane").translate(-1, 0);
        }
        else {
            if (event.keyCode === 32) {
                bullet();
                setTimeout(CONFIG.fps);
                num++;
            }
            else if (event.keyCode === 37) {
                jc("#plane").translate(-5, 0);
            }
            else if (event.keyCode === 39) {
                jc("#plane").translate(5, 0);
            }
        }
    }

    function enemy() {
        var line = CONFIG.enemyLine;
        var newimg = new Image();
        var i = 0;
        jc.start("c1", 1);
        jc.rect(CONFIG.canvasPadding, CONFIG.canvasPadding, 640, 440).id("enemyarea"); //绘制敌人的运动区域
        jc.start("c1");
        function drawEnemy(line) { //绘制敌人
            var line = line;
            jc.start("c1", 1);
            for(var k = 0; k < line; k++) {
                for (var j = 1; j <= CONFIG.enemyNumber; j++) {
                    enemys[i] = jc.image(newimg, CONFIG.canvasPadding + (CONFIG.enemySize + CONFIG.enemyGap) * j, (CONFIG.canvasPadding + (CONFIG.enemySize+CONFIG .enemyStep)*k), CONFIG.enemySize, CONFIG.enemySize).id("enemy" + i);
                    i++;
                }
            }
            jc.start("c1");
        }
        newimg.onload = function () {
            setInterval(hited, CONFIG.fps);
            drawEnemy(CONFIG.enemyLine);
        }
        newimg.src = CONFIG.enemyIcon;

        var timer = setInterval(howEnemyMove, CONFIG.fps);

        function howEnemyMove() { //规定敌人的移动

            var flag = 0;
            for (var i = 0; i < CONFIG.enemyNumber*CONFIG.enemyLine; i++)
                if (jc("#enemy" + i).position().y <= 440 - CONFIG.canvasPadding) {
                    flag++;
                }
            if (flag > 0) {
                enemyMove();
                for (var j = 0; j < CONFIG.enemyNumber*CONFIG.enemyLine; j++) {
                    if (jc("#enemy" + j).position().x == 700 - CONFIG.canvasPadding - CONFIG.enemySize || jc("#enemy" + j).position().x == CONFIG.canvasPadding) {
                        for (var i = 0; i < CONFIG.enemyNumber*CONFIG.enemyLine; i++) {
                            jc("#enemy" + i).translate(0, 60);
                        }
                        step = -1* step;
                        enemyMove();
                    }
                }
            }
            else {
                window.clearInterval(timer);
                judgeWinOrLose();
            }
        }

        function enemyMove() { //规定敌人默认的移动行为
            for (var i = 0; i < CONFIG.enemyNumber*CONFIG.enemyLine; i++) {
                jc("#enemy" + i).translate(step, 0);
            }
        }
    }

    function hited() { //子弹和敌人的碰撞检测
        if (tempEnemyNumber > 0) {
            for (var i = 0; i <= bullets.length; i++) {
                for (var j = 0; j < CONFIG.enemyNumber*CONFIG.enemyLine; j++) {
                    if (jc("#" + bullets[i].id()).position().y - jc("#" + enemys[j].id()).position().y + CONFIG.enemySize <= CONFIG.enemySize
                        && Math.abs((jc("#" + bullets[i].id()).position().x) - (jc("#" + enemys[j].id()).position().x + CONFIG.enemySize / 2)) <= CONFIG.enemySize / 2) {
                        jc("#" + enemys[j].id()).del();
                        score += 1;
                        var enemyDieX = jc("#" + enemys[j].id()).position().x;
                        var enemyDieY = jc("#" + enemys[j].id()).position().y;
                        drawEnemyDie();
                        jc("#" + bullets[i].id()).del();
                        showScore();
                        function drawEnemyDie() { //绘制敌人死亡的图像
                            var image = new Image();
                            image.src = CONFIG.enemyBoomIcon;
                            image.onload = function () {
                                jc.start("c1", 1);
                                jc.image(image, enemyDieX, enemyDieY, CONFIG.enemySize, CONFIG.enemySize).id("enemydie");
                                setTimeout("jc('#enemydie').del()", 2 * CONFIG.fps); //2fps后删除爆炸图像
                                jc.start("c1");
                            }
                        }

                        if (tempEnemyNumber > 0) {
                            tempEnemyNumber--;
                        }
                        break;
                    }
                    continue;
                }
            }
        }

        else judgeWinOrLose();

    }

    function judgeWinOrLose() { //判断输赢
        var winScore = CONFIG.enemyNumber*CONFIG.enemyLine;
        if (score == winScore) {
            jc.canvas("c1").clear();
            document.getElementById("game-info").style.display = "none";
            var win = document.getElementById("game-success");
            win.style.display = "block";
            tempEnemyNumber = CONFIG.enemyNumber*CONFIG.enemyLine;
            var tempScore = document.getElementById("playerscore");
            tempScore.innerHTML = 0;
        }
        else {
            jc.canvas("c1").clear();
            document.getElementById("game-info").style.display = "none";
            var lose = document.getElementById("game-failed");
            lose.style.display = "block";
            var tempScore = document.getElementById("score");
            tempScore.innerHTML = score;
        }
    }

    function showScore() { //向html写入分数
        var tempScore = document.getElementById("playerscore");
        tempScore.innerHTML = score;
    }

}