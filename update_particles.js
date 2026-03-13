const fs = require('fs');
const file = 'c:/Coding/Edu_Tech/views/career_trends_predictor.ejs';
let content = fs.readFileSync(file, 'utf8');

const marker = "// INTERACTIVE BACKGROUND PARTICLES";
const parts = content.split(marker);

if (parts.length >= 2) {
    // parts[0] is everything before the // INTERACTIVE BACKGROUND PARTICLES
    // However, we want to strip the preceding "// ==========================================" too.
    let head = parts[0];
    const border = "// ==========================================";
    const borderIdx = head.lastIndexOf(border);
    if (borderIdx !== -1) {
        head = head.substring(0, borderIdx);
    }

    // parts[1] is everything after the marker. We want to skip all that until the closing script tag.
    let tail = parts[1];
    const scriptEnd = "</script>";
    const scriptIdx = tail.indexOf(scriptEnd);
    if (scriptIdx !== -1) {
        tail = "\\n            " + scriptEnd + tail.substring(scriptIdx + scriptEnd.length);
    }

    const newCode = `// ==========================================
                // INTERACTIVE BACKGROUND PARTICLES
                // ==========================================
                var canvas = document.getElementById('bgCanvas');
                if (canvas) {
                    var can_w = window.innerWidth,
                        can_h = window.innerHeight,
                        ctx = canvas.getContext('2d');
                    
                    canvas.width = can_w;
                    canvas.height = can_h;

                    var BALL_NUM = 40;

                    var ball = { x: 0, y: 0, vx: 0, vy: 0, r: 0, alpha: 1, phase: 0 },
                    // Primary accent #FFE66D mapped to RGB (255, 230, 109)
                    ball_color = { r: 255, g: 230, b: 109 },
                    R = 2,
                    balls = [],
                    alpha_f = 0.03,
                    alpha_phase = 0,
                    link_line_width = 0.8,
                    dis_limit = 260,
                    add_mouse_point = true,
                    mouse_in = false,
                    mouse_ball = { x: 0, y: 0, vx: 0, vy: 0, r: 0, type: 'mouse' };

                    function getRandomSpeed(pos){
                        var  min = -1, max = 1;
                        switch(pos){
                            case 'top': return [randomNumFrom(min, max), randomNumFrom(0.1, max)];
                            case 'right': return [randomNumFrom(min, -0.1), randomNumFrom(min, max)];
                            case 'bottom': return [randomNumFrom(min, max), randomNumFrom(min, -0.1)];
                            case 'left': return [randomNumFrom(0.1, max), randomNumFrom(min, max)];
                            default: return;
                        }
                    }
                    function randomArrayItem(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
                    function randomNumFrom(min, max){ return Math.random()*(max - min) + min; }
                    function getRandomBall(){
                        var pos = randomArrayItem(['top', 'right', 'bottom', 'left']);
                        switch(pos){
                            case 'top': return { x: randomSidePos(can_w), y: -R, vx: getRandomSpeed('top')[0], vy: getRandomSpeed('top')[1], r: R, alpha: 1, phase: randomNumFrom(0, 10) };
                            case 'right': return { x: can_w + R, y: randomSidePos(can_h), vx: getRandomSpeed('right')[0], vy: getRandomSpeed('right')[1], r: R, alpha: 1, phase: randomNumFrom(0, 10) };
                            case 'bottom': return { x: randomSidePos(can_w), y: can_h + R, vx: getRandomSpeed('bottom')[0], vy: getRandomSpeed('bottom')[1], r: R, alpha: 1, phase: randomNumFrom(0, 10) };
                            case 'left': return { x: -R, y: randomSidePos(can_h), vx: getRandomSpeed('left')[0], vy: getRandomSpeed('left')[1], r: R, alpha: 1, phase: randomNumFrom(0, 10) };
                        }
                    }
                    function randomSidePos(length){ return Math.ceil(Math.random() * length); }
                    function renderBalls(){
                        balls.forEach(function(b){
                            if(!b.hasOwnProperty('type')){
                                ctx.fillStyle = 'rgba('+ball_color.r+','+ball_color.g+','+ball_color.b+','+b.alpha+')';
                                ctx.beginPath();
                                ctx.arc(b.x, b.y, R, 0, Math.PI*2, true);
                                ctx.closePath();
                                ctx.fill();
                            }
                        });
                    }
                    function updateBalls(){
                        var new_balls = [];
                        balls.forEach(function(b){
                            b.x += b.vx;
                            b.y += b.vy;
                            if(b.x > -(50) && b.x < (can_w+50) && b.y > -(50) && b.y < (can_h+50)){
                               new_balls.push(b);
                            }
                            b.phase += alpha_f;
                            b.alpha = Math.abs(Math.cos(b.phase));
                        });
                        balls = new_balls.slice(0);
                    }
                    function renderLines(){
                        var fraction, alpha;
                        for (var i = 0; i < balls.length; i++) {
                            for (var j = i + 1; j < balls.length; j++) {
                               fraction = getDisOf(balls[i], balls[j]) / dis_limit;
                               if(fraction < 1){
                                   alpha = (1 - fraction).toString();
                                   ctx.strokeStyle = 'rgba(244,208,63,'+alpha+')';
                                   ctx.lineWidth = link_line_width;
                                   ctx.beginPath();
                                   ctx.moveTo(balls[i].x, balls[i].y);
                                   ctx.lineTo(balls[j].x, balls[j].y);
                                   ctx.stroke();
                                   ctx.closePath();
                               }
                            }
                        }
                    }
                    function getDisOf(b1, b2){
                        var  delta_x = Math.abs(b1.x - b2.x),
                           delta_y = Math.abs(b1.y - b2.y);
                        return Math.sqrt(delta_x*delta_x + delta_y*delta_y);
                    }
                    function addBallIfy(){ if(balls.length < BALL_NUM){ balls.push(getRandomBall()); } }
                    function render(){
                        ctx.clearRect(0, 0, can_w, can_h);
                        renderBalls();
                        renderLines();
                        updateBalls();
                        addBallIfy();
                        window.requestAnimationFrame(render);
                    }
                    function initBalls(num){
                        for(var i = 1; i <= num; i++){
                            balls.push({
                                x: randomSidePos(can_w),
                                y: randomSidePos(can_h),
                                vx: getRandomSpeed('top')[0],
                                vy: getRandomSpeed('top')[1],
                                r: R,
                                alpha: 1,
                                phase: randomNumFrom(0, 10)
                            });
                        }
                    }
                    function initCanvas(){
                        can_w = window.innerWidth;
                        can_h = window.innerHeight;
                        canvas.width = can_w;
                        canvas.height = can_h;
                    }
                    window.addEventListener('resize', function(e){ initCanvas(); });
                    function goMovie(){
                        initCanvas();
                        initBalls(BALL_NUM);
                        window.requestAnimationFrame(render);
                    }
                    goMovie();
                    
                    document.addEventListener('mousemove', function(e){
                        if (!mouse_in) {
                            mouse_in = true;
                            mouse_ball.alpha = 1;
                            balls.push(mouse_ball);
                        }
                        mouse_ball.x = e.clientX;
                        mouse_ball.y = e.clientY;
                    });
                    document.addEventListener('mouseleave', function(){
                        mouse_in = false;
                        var new_balls = [];
                        balls.forEach(function(b){
                            if(!b.hasOwnProperty('type')){
                                new_balls.push(b);
                            }
                        });
                        balls = new_balls.slice(0);
                    });
                }
`;

    fs.writeFileSync(file, head + newCode + tail);
    console.log("Successfully replaced script body");
} else {
    console.log("Marker not found!");
}
