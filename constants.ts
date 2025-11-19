
import { EntityType, LevelConfig } from './types';

export const MOVEMENT_COST = 1;

// --- Helpers ---

const createGrid = (size: number, fillType: EntityType = EntityType.EMPTY): any[][] => {
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      row.push({ x, y, type: fillType, harvested: false, watered: false });
    }
    grid.push(row);
  }
  return grid;
};

// --- Level Definitions ---

// Level 1: Movement
const grid1 = createGrid(8);
grid1[0][1].type = EntityType.WHEAT;
grid1[0][2].type = EntityType.WHEAT;
grid1[0][3].type = EntityType.WHEAT;

// Level 2: For Loops
const grid2 = createGrid(8);
for(let i=1; i<=6; i++) grid2[2][i].type = EntityType.WHEAT;

// Level 3: If/Else
const grid3 = createGrid(8);
grid3[0][0].type = EntityType.EMPTY; 
grid3[0][1].type = EntityType.WHEAT;
grid3[0][2].type = EntityType.ROCK;
grid3[0][3].type = EntityType.WHEAT;
grid3[0][4].type = EntityType.ROCK;
grid3[0][5].type = EntityType.WHEAT;

// Level 4: Operators
const grid4 = createGrid(8);
// Need to collect wheat but avoid running out of battery? 
// Or check if resources are sufficient.
grid4[0][0].type = EntityType.EMPTY;
grid4[0][1].type = EntityType.WHEAT;
grid4[0][2].type = EntityType.WHEAT;
grid4[0][3].type = EntityType.WHEAT;
grid4[0][4].type = EntityType.GOAL;

// Level 5: Variables
const grid5 = createGrid(8);
grid5[0][0].type = EntityType.EMPTY;
grid5[2][2].type = EntityType.WHEAT;
grid5[3][3].type = EntityType.WHEAT;
grid5[4][4].type = EntityType.GOAL;

// Level 6: Senses
const grid6 = createGrid(8);
// Maze-like simple structure
grid6[0][1].type = EntityType.ROCK;
grid6[1][0].type = EntityType.ROCK;
grid6[1][1].type = EntityType.WHEAT;
grid6[1][2].type = EntityType.WHEAT;
grid6[2][2].type = EntityType.GOAL;

// Level 7: Lists
const grid7 = createGrid(8);
// Specific spots to visit defined in a list potentially
grid7[0][0].type = EntityType.EMPTY;
grid7[2][2].type = EntityType.WHEAT;
grid7[5][1].type = EntityType.WHEAT;
grid7[1][6].type = EntityType.WHEAT;

// Level 8: Functions
const grid8 = createGrid(10);
// Repeating patterns
for(let i=0; i<8; i+=2) {
    grid8[1][i].type = EntityType.WHEAT;
    grid8[1][i+1].type = EntityType.ROCK;
    grid8[2][i].type = EntityType.EMPTY;
}


export const CURRICULUM: LevelConfig[] = [
  {
    id: 1,
    name: "Bài 1: Di chuyển (Movement)",
    description: "Làm quen với các lệnh cơ bản để điều khiển Drone di chuyển và thu hoạch.",
    gridSize: 8,
    initialGrid: grid1,
    initialDrone: { x: 0, y: 0, battery: 100 },
    winCondition: { wheat: 3 },
    hint: "Sử dụng `drone.right()` để đi sang phải và `drone.harvest()` để thu hoạch.",
    defaultCode: `# Di chuyển và thu hoạch
drone.right()
drone.harvest()
drone.right()
drone.harvest()
drone.right()
drone.harvest()`
  },
  {
    id: 2,
    name: "Bài 2: Vòng lặp (For Loops)",
    description: "Sử dụng vòng lặp `for` để thực hiện các hành động lặp đi lặp lại.",
    gridSize: 8,
    initialGrid: grid2,
    initialDrone: { x: 0, y: 2, battery: 100 },
    winCondition: { wheat: 6 },
    hint: "Sử dụng `for i in range(6):` để lặp lại hành động 6 lần.",
    defaultCode: `# Sử dụng vòng lặp để gặt hết hàng lúa
for i in range(6):
    drone.right()
    drone.harvest()`
  },
  {
    id: 3,
    name: "Bài 3: Câu lệnh điều kiện (If/Else)",
    description: "Sử dụng `if` để kiểm tra chướng ngại vật. Nếu gặp đá thì phải tránh!",
    gridSize: 8,
    initialGrid: grid3,
    initialDrone: { x: 0, y: 0, battery: 100 },
    winCondition: { wheat: 3 },
    hint: "Dùng `drone.scan()` để kiểm tra ô hiện tại hoặc phía trước.",
    defaultCode: `# Kiểm tra vật cản
for i in range(5):
    drone.right()
    item = drone.scan()
    if item == 'rock':
        print("Gặp đá, bỏ qua!")
    else:
        drone.harvest()`
  },
  {
    id: 4,
    name: "Bài 4: Toán tử (Operators)",
    description: "Sử dụng toán tử so sánh và số học để quản lý năng lượng.",
    gridSize: 8,
    initialGrid: grid4,
    initialDrone: { x: 0, y: 0, battery: 20 }, // Low battery
    winCondition: { reachGoal: true },
    hint: "Kiểm tra nếu năng lượng thấp (`drone.battery < 5`) thì cần sạc hoặc cẩn thận.",
    defaultCode: `# Kiểm tra năng lượng
for i in range(4):
    drone.right()
    if drone.battery < 5:
        print("Cảnh báo năng lượng thấp!")
    drone.harvest()`
  },
  {
    id: 5,
    name: "Bài 5: Biến (Variables)",
    description: "Sử dụng biến để đếm số lượng lúa đã thu hoạch.",
    gridSize: 8,
    initialGrid: grid5,
    initialDrone: { x: 0, y: 0, battery: 100 },
    winCondition: { reachGoal: true },
    hint: "Tạo biến `count = 0` và tăng lên mỗi khi thu hoạch.",
    defaultCode: `# Sử dụng biến đếm
count = 0
drone.down()
drone.down()
drone.right()
drone.right()
drone.harvest()
count = count + 1
print(count)
`
  },
  {
    id: 6,
    name: "Bài 6: Cảm biến (Senses)",
    description: "Sử dụng `drone.scan()` để tự động tìm đường trong mê cung đơn giản.",
    gridSize: 8,
    initialGrid: grid6,
    initialDrone: { x: 0, y: 0, battery: 100 },
    winCondition: { reachGoal: true },
    hint: "Nếu gặp đá, hãy thử đi đường khác.",
    defaultCode: `# Tự động dò đường
item = drone.scan()
if item == 'rock':
    drone.down()
else:
    drone.right()`
  },
  {
    id: 7,
    name: "Bài 7: Danh sách (Lists)",
    description: "Lập trình drone đi theo một danh sách các hướng dẫn.",
    gridSize: 8,
    initialGrid: grid7,
    initialDrone: { x: 0, y: 0, battery: 100 },
    winCondition: { wheat: 3 },
    hint: "Tạo danh sách `directions = ['down', 'right']` và duyệt qua nó.",
    defaultCode: `# Đi theo chỉ dẫn trong danh sách
path = ['down', 'down', 'right', 'right', 'harvest']
for step in path:
    if step == 'down':
        drone.down()
    elif step == 'right':
        drone.right()
    elif step == 'harvest':
        drone.harvest()`
  },
  {
    id: 8,
    name: "Bài 8: Hàm (Functions)",
    description: "Tổ chức mã nguồn bằng cách tạo các hàm dùng lại được.",
    gridSize: 10,
    initialGrid: grid8,
    initialDrone: { x: 0, y: 1, battery: 100 },
    winCondition: { wheat: 4 },
    hint: "Viết hàm `xu_ly_vat_can()` để gọi mỗi khi gặp đá.",
    defaultCode: `# Định nghĩa hàm xử lý
def process_cell():
    item = drone.scan()
    if item == 'rock':
        print("Tránh đá")
        # Logic tránh đá
    elif item == 'wheat':
        drone.harvest()

for i in range(8):
    process_cell()
    drone.right()`
  }
];

export const DEFAULT_CODE = CURRICULUM[0].defaultCode || "";
export const LEVEL_1 = CURRICULUM[0];
