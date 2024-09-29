import { Engine, Render, Runner, Bodies, Composite, Body, Events } from 'matter-js';
import { FRUITS } from './fruits'; // 과일 정보 (이름, 반지름 등 포함)

// 기본적인 엔진과 렌더 설정
const engine = Engine.create();
const world = engine.world;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 620,
        height: 850,
        background: '#F7F4C8',
        wireframes: false
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// 벽과 바닥 만들기
const walls = [
    Bodies.rectangle(310, 820, 620, 60, { isStatic: true, render: { fillStyle: '#E6B143' }}), // 바닥
    Bodies.rectangle(15, 395, 30, 790, { isStatic: true, render: { fillStyle: '#E6B143' }}), // 왼쪽 벽
    Bodies.rectangle(605, 395, 30, 790, { isStatic: true, render: { fillStyle: '#E6B143' }})  // 오른쪽 벽
];
Composite.add(world, walls);

// 과일 추가 함수
function addFruit() {
    const randomIndex = Math.floor(Math.random() * FRUITS.length);
    const fruit = FRUITS[randomIndex];
    
    const fruitBody = Bodies.circle(310, 50, fruit.radius, {
        density: 0.001, 
        restitution: 0.6, // 탄성
        friction: 0.5,
        render: {
            sprite: {
                texture: `./public/${fruit.name}.png`, // 과일 이미지
                xScale: fruit.scale || 1,
                yScale: fruit.scale || 1
            }
        }
    });

    Composite.add(world, fruitBody);
}

// 이벤트 리스너로 과일 떨어뜨리기
document.addEventListener('click', () => {
    addFruit();
});

// 물리 엔진이 업데이트될 때 충돌 감지 및 게임 로직 처리
Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;

    for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA;
        const bodyB = pairs[i].bodyB;

        // 예시: 충돌하는 두 과일을 병합하거나 특정 동작을 수행할 수 있음
        if (bodyA.label === 'Fruit' && bodyB.label === 'Fruit') {
            // 병합 로직 또는 점수 추가 로직 작성 가능
        }
    }
});

// 간단한 게임 로직: 주기적으로 중력 변화 같은 요소 추가 가능
setInterval(() => {
    if (world.bodies.length > 50) { // 너무 많은 과일이 쌓이지 않도록 제한
        Composite.clear(world, false); // world 초기화
        Composite.add(world, walls); // 다시 벽과 바닥 추가
    }
}, 10000);
