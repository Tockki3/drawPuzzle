import { LevelDefinition } from '../types';

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 650;

export const INITIAL_LEVELS: LevelDefinition[] = [
  {
    id: 1,
    title: '첫 번째 낙하',
    titleEn: 'First Drop',
    subtitle: '경사로를 그려 공을 컵으로 안내하세요',
    description: '화면에 마우스나 터치로 비스듬한 선을 그어보세요. 손을 떼면 단단한 물리 물체가 되어 공이 굴러갑니다!',
    inkBudget: 400,
    parTime: 10,
    balls: [
      { id: 'b1', x: 200, y: 140, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 780, y: 520, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444', label: '목표 컵' }
    ],
    stars: [
      { id: 's1', x: 380, y: 260, radius: 14, collected: false },
      { id: 's2', x: 540, y: 360, radius: 14, collected: false },
      { id: 's3', x: 700, y: 460, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' },
      { id: 'cup_platform', type: 'rectangle', x: 780, y: 565, width: 140, height: 30, isStatic: true, color: '#475569' }
    ],
    hintStrokes: [
      [
        { x: 170, y: 180 },
        { x: 360, y: 270 },
        { x: 530, y: 370 },
        { x: 740, y: 490 }
      ]
    ]
  },
  {
    id: 2,
    title: '낭떠러지 다리',
    titleEn: 'Bridge the Abyss',
    subtitle: '깊은 구덩이를 건너는 튼튼한 다리를 지으세요',
    description: '공이 굴러떨어지지 않도록 양쪽 언덕 사이에 수평선 또는 완만한 다리를 만들어주세요.',
    inkBudget: 500,
    parTime: 12,
    balls: [
      { id: 'b1', x: 120, y: 160, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 860, y: 240, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 380, y: 250, radius: 14, collected: false },
      { id: 's2', x: 510, y: 240, radius: 14, collected: false },
      { id: 's3', x: 650, y: 250, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'left_cliff', type: 'rectangle', x: 140, y: 280, width: 220, height: 160, isStatic: true, color: '#475569' },
      { id: 'right_cliff', type: 'rectangle', x: 860, y: 330, width: 220, height: 260, isStatic: true, color: '#475569' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#1e293b' }
    ],
    hintStrokes: [
      [
        { x: 230, y: 215 },
        { x: 390, y: 260 },
        { x: 540, y: 260 },
        { x: 760, y: 240 }
      ]
    ]
  },
  {
    id: 3,
    title: '지렛대 시소',
    titleEn: 'The Seesaw Catapult',
    subtitle: '무게추를 떨어뜨려 공을 튕겨 올리세요',
    description: '시소의 한쪽에 공이 놓여 있습니다. 반대쪽 높은 곳에 무거운 덩어리를 그려 떨어뜨려보세요!',
    inkBudget: 600,
    parTime: 15,
    balls: [
      { id: 'b1', x: 420, y: 460, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 860, y: 200, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 430, y: 350, radius: 14, collected: false },
      { id: 's2', x: 640, y: 160, radius: 14, collected: false },
      { id: 's3', x: 800, y: 160, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'high_wall', type: 'rectangle', x: 580, y: 380, width: 30, height: 450, isStatic: true, color: '#64748b' },
      { id: 'fulcrum', type: 'rectangle', x: 320, y: 530, width: 36, height: 70, isStatic: true, color: '#475569' },
      { id: 'seesaw_plank', type: 'rectangle', x: 320, y: 490, width: 280, height: 16, isStatic: false, color: '#d97706', restitution: 0.1, friction: 0.8 },
      { id: 'target_shelf', type: 'rectangle', x: 860, y: 250, width: 140, height: 26, isStatic: true, color: '#475569' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 190, y: 140 },
        { x: 230, y: 140 },
        { x: 230, y: 220 },
        { x: 190, y: 220 },
        { x: 190, y: 140 }
      ]
    ]
  },
  {
    id: 4,
    title: '별들의 궤적',
    titleEn: 'Star Orbit Trajectory',
    subtitle: '곡선 레일을 만들어 3개의 별을 모두 획득하세요',
    description: '공이 3개의 별을 훑고 지나가도록 롤러코스터 같은 유려한 곡선을 한 번에 이어보세요.',
    inkBudget: 650,
    parTime: 12,
    balls: [
      { id: 'b1', x: 100, y: 100, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 900, y: 520, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 280, y: 320, radius: 14, collected: false },
      { id: 's2', x: 520, y: 200, radius: 14, collected: false },
      { id: 's3', x: 720, y: 380, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'p1', type: 'rectangle', x: 100, y: 130, width: 100, height: 20, isStatic: true, color: '#475569' },
      { id: 'mid_pillar', type: 'rectangle', x: 520, y: 460, width: 40, height: 260, isStatic: true, color: '#475569' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 110, y: 145 },
        { x: 280, y: 335 },
        { x: 420, y: 360 },
        { x: 520, y: 220 },
        { x: 620, y: 240 },
        { x: 720, y: 395 },
        { x: 870, y: 490 }
      ]
    ]
  },
  {
    id: 5,
    title: '도미노의 충격',
    titleEn: 'Domino Overthrow',
    subtitle: '무거운 쐐기를 던져 거대한 기둥을 쓰러뜨리세요',
    description: '공의 앞길을 거대한 기둥이 막고 있습니다. 위에서 무거운 추를 굴리거나 떨어뜨려 기둥을 밀어내세요!',
    inkBudget: 700,
    parTime: 16,
    balls: [
      { id: 'b1', x: 150, y: 450, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 880, y: 520, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 460, y: 480, radius: 14, collected: false },
      { id: 's2', x: 620, y: 320, radius: 14, collected: false },
      { id: 's3', x: 760, y: 480, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'blocker_pillar', type: 'rectangle', x: 520, y: 400, width: 44, height: 380, isStatic: false, color: '#94a3b8', friction: 0.3 },
      { id: 'shelf_high', type: 'rectangle', x: 300, y: 140, width: 180, height: 24, isStatic: true, color: '#475569' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 260, y: 80 },
        { x: 340, y: 80 },
        { x: 340, y: 130 },
        { x: 260, y: 130 },
        { x: 260, y: 80 }
      ]
    ]
  },
  {
    id: 6,
    title: '슈퍼 바운스 핀볼',
    titleEn: 'Pinball Bouncer',
    subtitle: '탄성 패드의 반발력을 이용해 높은 바구니에 골인',
    description: '초록색 패드는 탄성이 매우 높습니다(0.95). 튕겨 나가는 각도를 계산하여 유도벽을 그려보세요.',
    inkBudget: 550,
    parTime: 15,
    balls: [
      { id: 'b1', x: 160, y: 100, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 850, y: 140, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 360, y: 480, radius: 14, collected: false },
      { id: 's2', x: 550, y: 220, radius: 14, collected: false },
      { id: 's3', x: 740, y: 280, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'bounce1', type: 'bouncer', x: 360, y: 560, width: 160, height: 24, isStatic: true, color: '#10b981', restitution: 0.95 },
      { id: 'bounce2', type: 'bouncer', x: 680, y: 440, width: 140, height: 24, isStatic: true, color: '#10b981', restitution: 0.95 },
      { id: 'target_platform', type: 'rectangle', x: 850, y: 185, width: 120, height: 24, isStatic: true, color: '#475569' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 150, y: 130 },
        { x: 300, y: 360 }
      ],
      [
        { x: 560, y: 180 },
        { x: 640, y: 260 }
      ]
    ]
  },
  {
    id: 7,
    title: '쌍둥이 구슬의 분리',
    titleEn: 'Twin Spheres Sorting',
    subtitle: '빨간 공은 빨간 컵에, 파란 공은 파란 컵에!',
    description: '서로 다른 방향으로 굴러가는 두 개의 공을 각각 올바른 컵으로 이끄는 갈림길을 설계하세요.',
    inkBudget: 800,
    parTime: 18,
    balls: [
      { id: 'b1', x: 480, y: 100, radius: 14, color: '#ef4444' },
      { id: 'b2', x: 520, y: 100, radius: 14, color: '#3b82f6' }
    ],
    targets: [
      { id: 't1', x: 160, y: 520, width: 90, height: 60, color: '#ef4444', targetBallColor: '#ef4444', label: '빨간 컵' },
      { id: 't2', x: 840, y: 520, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#3b82f6', label: '파란 컵' }
    ],
    stars: [
      { id: 's1', x: 320, y: 340, radius: 14, collected: false },
      { id: 's2', x: 500, y: 220, radius: 14, collected: false },
      { id: 's3', x: 680, y: 340, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'center_splitter', type: 'rectangle', x: 500, y: 260, width: 30, height: 80, isStatic: true, color: '#64748b' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 470, y: 200 },
        { x: 300, y: 360 },
        { x: 200, y: 480 }
      ],
      [
        { x: 530, y: 200 },
        { x: 700, y: 360 },
        { x: 800, y: 480 }
      ]
    ]
  },
  {
    id: 8,
    title: '반중력 엘리베이터',
    titleEn: 'Anti-Gravity Chamber',
    subtitle: '위로 솟구치는 중력장을 활용하세요',
    description: '보라색 영역은 물체를 위로 떠오르게 만듭니다. 천장에 유도 깔때기를 그려 컵으로 떨어지게 하세요!',
    inkBudget: 600,
    parTime: 16,
    balls: [
      { id: 'b1', x: 180, y: 520, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 820, y: 520, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 340, y: 320, radius: 14, collected: false },
      { id: 's2', x: 500, y: 120, radius: 14, collected: false },
      { id: 's3', x: 660, y: 320, radius: 14, collected: false }
    ],
    gravityZones: [
      { id: 'gz1', x: 280, y: 300, width: 220, height: 320, forceY: -0.0028, label: '반중력 상승존' }
    ],
    obstacles: [
      { id: 'barrier', type: 'rectangle', x: 520, y: 440, width: 30, height: 360, isStatic: true, color: '#64748b' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 190, y: 540 },
        { x: 340, y: 530 }
      ],
      [
        { x: 380, y: 100 },
        { x: 540, y: 120 },
        { x: 780, y: 450 }
      ]
    ]
  },
  {
    id: 9,
    title: '회전하는 윈드밀',
    titleEn: 'The Windmill Gap',
    subtitle: '회전하는 날개의 틈 사이로 타이밍을 맞추세요',
    description: '천천히 돌아가는 장애물이 중앙을 지키고 있습니다. 장애물을 우회하거나 날개 틈으로 굴러가도록 레일을 설치하세요.',
    inkBudget: 650,
    parTime: 18,
    balls: [
      { id: 'b1', x: 140, y: 160, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 880, y: 480, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 340, y: 300, radius: 14, collected: false },
      { id: 's2', x: 500, y: 170, radius: 14, collected: false },
      { id: 's3', x: 660, y: 300, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'blade1', type: 'rectangle', x: 500, y: 340, width: 220, height: 16, angle: 0, isStatic: false, color: '#0ea5e9' },
      { id: 'blade2', type: 'rectangle', x: 500, y: 340, width: 16, height: 220, angle: 0, isStatic: false, color: '#0ea5e9' },
      { id: 'axis', type: 'circle', x: 500, y: 340, radius: 14, isStatic: true, color: '#e2e8f0' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 160, y: 200 },
        { x: 380, y: 260 },
        { x: 480, y: 160 },
        { x: 800, y: 440 }
      ]
    ]
  },
  {
    id: 10,
    title: '진자의 타격',
    titleEn: 'Pendulum Wrecking Ball',
    subtitle: '진자를 흔들어 공을 가시 함정 너머로 날리세요',
    description: '매달려 있는 쇠구슬에 무거운 추를 부딪혀 스윙 모멘텀을 전달해보세요.',
    inkBudget: 700,
    parTime: 18,
    balls: [
      { id: 'b1', x: 420, y: 420, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 860, y: 420, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 460, y: 320, radius: 14, collected: false },
      { id: 's2', x: 600, y: 260, radius: 14, collected: false },
      { id: 's3', x: 740, y: 320, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'pit_wall1', type: 'rectangle', x: 440, y: 520, width: 120, height: 200, isStatic: true, color: '#475569' },
      { id: 'pit_wall2', type: 'rectangle', x: 860, y: 520, width: 120, height: 200, isStatic: true, color: '#475569' },
      { id: 'spikes', type: 'rectangle', x: 650, y: 615, width: 300, height: 20, isStatic: true, color: '#dc2626' },
      { id: 'pendulum_bob', type: 'circle', x: 340, y: 380, radius: 24, isStatic: false, color: '#64748b' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 220, y: 150 },
        { x: 320, y: 260 }
      ]
    ]
  },
  {
    id: 11,
    title: '농구 3점슛',
    titleEn: 'Hoop Arc Shooter',
    subtitle: '백보드와 림 사이로 아름다운 포물선을 그리세요',
    description: '공이 높은 컵 안으로 쏙 들어가도록 아래쪽 곡선 램프를 가파르게 올려 쏘아 올리세요.',
    inkBudget: 600,
    parTime: 14,
    balls: [
      { id: 'b1', x: 180, y: 120, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 820, y: 240, width: 80, height: 50, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 400, y: 440, radius: 14, collected: false },
      { id: 's2', x: 620, y: 160, radius: 14, collected: false },
      { id: 's3', x: 740, y: 180, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'backboard', type: 'rectangle', x: 885, y: 220, width: 16, height: 140, isStatic: true, color: '#f87171' },
      { id: 'pole', type: 'rectangle', x: 885, y: 450, width: 24, height: 340, isStatic: true, color: '#94a3b8' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 170, y: 160 },
        { x: 320, y: 480 },
        { x: 480, y: 490 },
        { x: 580, y: 380 }
      ]
    ]
  },
  {
    id: 12,
    title: '상자 속의 구출 작전',
    titleEn: 'Pry the Trap Box',
    subtitle: '지렛대 원리로 닫힌 뚜껑을 열고 공을 탈출시키세요',
    description: '공이 튼튼한 상자 속에 갇혀 있고 상단 뚜껑이 덮여 있습니다. 긴 지렛대나 무거운 돌을 떨어뜨려 뚜껑을 밀어 올리세요.',
    inkBudget: 750,
    parTime: 20,
    balls: [
      { id: 'b1', x: 300, y: 460, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 850, y: 520, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 300, y: 280, radius: 14, collected: false },
      { id: 's2', x: 560, y: 380, radius: 14, collected: false },
      { id: 's3', x: 720, y: 480, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'box_left', type: 'rectangle', x: 230, y: 450, width: 20, height: 180, isStatic: true, color: '#64748b' },
      { id: 'box_right', type: 'rectangle', x: 370, y: 450, width: 20, height: 180, isStatic: true, color: '#64748b' },
      { id: 'box_lid', type: 'rectangle', x: 300, y: 350, width: 180, height: 20, isStatic: false, color: '#f59e0b', friction: 0.1 },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 140, y: 220 },
        { x: 260, y: 340 }
      ],
      [
        { x: 390, y: 370 },
        { x: 780, y: 520 }
      ]
    ]
  },
  {
    id: 13,
    title: '강풍 터널',
    titleEn: 'Wind Stream Tunnel',
    subtitle: '거센 바람을 차단하는 방풍벽을 그리세요',
    description: '좌측에서 우측으로 강한 바람이 붑니다. 바람을 피해 아래로 유도하거나, 바람의 추진력을 타고 날아가게 만드세요.',
    inkBudget: 600,
    parTime: 15,
    balls: [
      { id: 'b1', x: 150, y: 150, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 500, y: 530, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 300, y: 250, radius: 14, collected: false },
      { id: 's2', x: 500, y: 340, radius: 14, collected: false },
      { id: 's3', x: 720, y: 220, radius: 14, collected: false }
    ],
    gravityZones: [
      { id: 'wind1', x: 250, y: 100, width: 500, height: 220, forceY: 0, forceX: 0.0022, label: '강풍 제트류 (오른쪽)' }
    ],
    obstacles: [
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 140, y: 200 },
        { x: 360, y: 310 },
        { x: 500, y: 460 }
      ]
    ]
  },
  {
    id: 14,
    title: '압력 스위치 게이트',
    titleEn: 'Pressure Gate Trigger',
    subtitle: '스위치 위에 무게추를 얹어 닫힌 문을 여세요',
    description: '골대 앞을 두꺼운 철문이 막고 있습니다. 스위치 발판 위로 무거운 물체를 떨어뜨려 문을 활짝 여세요.',
    inkBudget: 850,
    parTime: 22,
    balls: [
      { id: 'b1', x: 120, y: 200, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 880, y: 520, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 340, y: 340, radius: 14, collected: false },
      { id: 's2', x: 560, y: 440, radius: 14, collected: false },
      { id: 's3', x: 780, y: 480, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'switch_base', type: 'rectangle', x: 360, y: 580, width: 100, height: 20, isStatic: true, color: '#475569' },
      { id: 'switch_pad', type: 'rectangle', x: 360, y: 560, width: 80, height: 16, isStatic: false, color: '#ef4444', switchTriggerId: 'heavy_door' },
      { id: 'heavy_door', type: 'door', x: 740, y: 440, width: 24, height: 360, isStatic: true, color: '#dc2626' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 320, y: 280 },
        { x: 400, y: 280 },
        { x: 400, y: 340 },
        { x: 320, y: 340 },
        { x: 320, y: 280 }
      ],
      [
        { x: 120, y: 240 },
        { x: 600, y: 480 },
        { x: 820, y: 500 }
      ]
    ]
  },
  {
    id: 15,
    title: '지그재그 래버린스',
    titleEn: 'Zig-Zag Cascade',
    subtitle: '정밀한 각도로 좁은 틈새를 돌파하세요',
    description: '여러 층으로 구성된 지그재그 경사로입니다. 공의 속도가 너무 빨라 튕겨 나가지 않도록 완충 가이드를 세우세요.',
    inkBudget: 750,
    parTime: 20,
    balls: [
      { id: 'b1', x: 150, y: 100, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 160, y: 540, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 760, y: 220, radius: 14, collected: false },
      { id: 's2', x: 280, y: 380, radius: 14, collected: false },
      { id: 's3', x: 760, y: 460, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'ramp1', type: 'rectangle', x: 460, y: 180, width: 650, height: 18, angle: 0.1, isStatic: true, color: '#475569' },
      { id: 'ramp2', type: 'rectangle', x: 540, y: 340, width: 650, height: 18, angle: -0.1, isStatic: true, color: '#475569' },
      { id: 'ramp3', type: 'rectangle', x: 460, y: 490, width: 650, height: 18, angle: 0.1, isStatic: true, color: '#475569' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 780, y: 160 },
        { x: 820, y: 260 }
      ],
      [
        { x: 220, y: 320 },
        { x: 180, y: 420 }
      ]
    ]
  },
  {
    id: 16,
    title: '마스터피스 아키텍트',
    titleEn: 'The Masterpiece',
    subtitle: '모든 물리 법칙을 융합한 궁극의 두뇌 퍼즐',
    description: '시소, 탄성 반사, 그리고 공중 유도! 최소한의 잉크로 3개의 별을 모두 획득하고 승리하세요.',
    inkBudget: 800,
    parTime: 25,
    balls: [
      { id: 'b1', x: 120, y: 280, radius: 14, color: '#ef4444' }
    ],
    targets: [
      { id: 't1', x: 880, y: 160, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
    ],
    stars: [
      { id: 's1', x: 380, y: 480, radius: 14, collected: false },
      { id: 's2', x: 560, y: 180, radius: 14, collected: false },
      { id: 's3', x: 760, y: 260, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'bouncer_bottom', type: 'bouncer', x: 420, y: 580, width: 180, height: 26, isStatic: true, color: '#10b981', restitution: 0.92 },
      { id: 'mid_chasm_wall', type: 'rectangle', x: 620, y: 380, width: 30, height: 300, isStatic: true, color: '#64748b' },
      { id: 'goal_shelf', type: 'rectangle', x: 880, y: 210, width: 140, height: 24, isStatic: true, color: '#475569' },
      { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ],
    hintStrokes: [
      [
        { x: 130, y: 310 },
        { x: 360, y: 520 }
      ],
      [
        { x: 490, y: 220 },
        { x: 740, y: 240 },
        { x: 840, y: 160 }
      ]
    ]
  }
];
