import { Engine, Render, Runner, Bodies, Composite, Body, Events, Collision, World } from 'matter-js';
import { FRUITS } from './fruits'; // 과일 정보 (이름, 반지름 등 포함)

// 기본적인 엔진과 렌더 설정
const engine = Engine.create(); // 물리 엔진 생성
const world = engine.world; // 엔진에서 월드 참조

// 렌더러 설정
const render = Render.create({
    element: document.body, // 렌더할 HTML 요소 (body에 렌더링)
    engine: engine, // 사용할 엔진
    options: {
        width: 620, // 렌더링 너비
        height: 850, // 렌더링 높이
        background: '#F7F4C8', // 배경 색상
        wireframes: false // 물리 엔진을 와이어프레임으로 표시할지 여부
    }
});

// 렌더러와 엔진 실행
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// 벽과 바닥 만들기
const walls = [
    Bodies.rectangle(310, 820, 620, 60, { isStatic: true, render: { fillStyle: '#E6B143' }}), // 바닥
    Bodies.rectangle(15, 395, 30, 790, { isStatic: true, render: { fillStyle: '#E6B143' }}), // 왼쪽 벽
    Bodies.rectangle(605, 395, 30, 790, { isStatic: true, render: { fillStyle: '#E6B143' }})  // 오른쪽 벽
];

// 센서 역할을 하는 상단 라인 (충돌 감지용)
const topLine = Bodies.rectangle(310, 150, 620, 2, { 
    isStatic: true, 
    isSensor: true, // 센서로 설정하여 충돌 감지만 수행
    render: { fillStyle: '#E6B143' }
});

// 월드에 벽과 센서 추가
Composite.add(world, [...walls, topLine]);

// 과일 추가 함수: topLine 위쪽에서만 과일을 추가하는 함수
function addFruit(x, y) {
    const minIndex = 0; // 최소 인덱스 (첫 번째 과일)
    const maxIndex = 4; // 최대 인덱스 (4번까지 나옴)

    // 랜덤 인덱스를 통해 과일 선택
    const randomIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
    const fruit = FRUITS[randomIndex]; // 과일 데이터 가져오기

    // 과일이 topLine 위에서만 생성되도록 y 좌표 제한
    const spawnY = Math.min(y, topLine.position.y - fruit.radius); // y는 topLine 위로만

    // 과일의 물리적 바디 생성
    const fruitBody = Bodies.circle(x, spawnY, fruit.radius, {
        index: randomIndex, // 해당 과일의 인덱스 저장
        density: 0.001, // 밀도 설정
        restitution: 0.6, // 탄성 설정 (튕김 정도)
        friction: 0.5, // 마찰력 설정
        render: {
            sprite: {
                texture: `./${fruit.name}.png`, // 과일 이미지 텍스처
                xScale: fruit.scale || 1, // 이미지 스케일 조정 (기본값 1)
                yScale: fruit.scale || 1 // 이미지 스케일 조정 (기본값 1)
            }
        }
    });

    // 월드에 과일 추가
    Composite.add(world, fruitBody);
}

// 클릭한 위치에 과일 추가하는 이벤트 리스너
document.addEventListener('click', (event) => {
    const mouseX = event.clientX; // 클릭한 X 좌표
    const mouseY = event.clientY; // 클릭한 Y 좌표

    // 클릭한 위치에 과일 추가
    addFruit(mouseX, mouseY);
});

// 물리 엔진이 업데이트될 때 충돌 감지 및 게임 로직 처리
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // 두 과일이 같은 인덱스(같은 과일)를 가지고 있는지 확인
        if (bodyA.index === bodyB.index) {
            const index = bodyA.index;

            // 마지막 과일이면 더 이상 합치지 않음
            if (index === FRUITS.length - 1) {
                return; // 마지막 과일이면 종료
            }

            // 충돌된 두 과일 제거
            World.remove(world, [bodyA, bodyB]);

// 새로운 과일 생성 (다음 단계 과일)
const newFruit = FRUITS[index + 1];

const newBody = Bodies.circle(
    // 충돌 지점의 X 좌표는 그대로, Y 좌표는 충돌 지점보다 화면 높이의 2% 위로
    (bodyA.position.x + bodyB.position.x) / 2, // X 좌표
    (bodyA.position.y + bodyB.position.y) / 2, // Y 좌표에 상대적 오프셋 적용
    newFruit.radius,
    {
        render: {
            sprite: {
                texture: `./${newFruit.name}.png`, // 새로운 과일 이미지 텍스처
                xScale: newFruit.scale || 1, // 새로운 과일 스케일 조정
                yScale: newFruit.scale || 1
            }
        },
        index: index + 1, // 새로운 과일의 인덱스 (다음 단계)
    }
);

// 새로운 과일 월드에 추가
World.add(world, newBody);

        }
    });
});
