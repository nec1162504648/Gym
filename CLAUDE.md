# GYM - 个人健身训练日志

## 1. 项目概述

一个面向个人用户的健身训练日志应用，帮助用户记录、追踪和管理个人健身训练数据。纯前端实现，数据存储在浏览器本地。

---

## 2. 技术架构

| 层 | 技术 |
|---|---|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式方案 | Tailwind CSS |
| 数据存储 | LocalStorage |
| 包管理器 | pnpm（优先）/ npm |

---

## 3. 项目结构

```
GYM/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx                # 应用入口
    ├── App.tsx                 # 主应用组件（路由/布局壳）
    ├── index.css               # Tailwind 指令 + 全局样式
    ├── types/                  # TypeScript 类型定义
    │   ├── index.ts            # 统一导出
    │   ├── exercise.ts         # 训练动作类型
    │   └── record.ts           # 训练记录类型
    ├── hooks/                  # 自定义 Hooks
    │   ├── useLocalStorage.ts  # LocalStorage 读写封装
    │   ├── useExercises.ts     # 训练动作 CRUD 逻辑
    │   └── useRecords.ts       # 训练记录 CRUD + 筛选逻辑
    ├── utils/                  # 工具函数
    │   ├── storage.ts          # LocalStorage 底层操作
    │   ├── date.ts             # 日期格式化/分组
    │   └── filter.ts           # 筛选逻辑
    ├── components/             # UI 组件
    │   ├── layout/
    │   │   ├── Header.tsx      # 顶部导航
    │   │   └── Container.tsx   # 响应式容器
    │   ├── exercise/
    │   │   ├── ExerciseList.tsx    # 动作列表
    │   │   ├── ExerciseForm.tsx    # 动作新增/编辑表单
    │   │   └── ExerciseCard.tsx    # 单个动作卡片
    │   ├── record/
    │   │   ├── RecordList.tsx      # 训练记录列表
    │   │   ├── RecordForm.tsx      # 训练记录表单
    │   │   └── RecordCard.tsx      # 单条记录卡片
    │   ├── filter/
    │   │   └── FilterBar.tsx       # 筛选栏
    │   └── common/
    │       ├── Button.tsx          # 通用按钮
    │       ├── Modal.tsx           # 弹窗
    │       ├── ConfirmDialog.tsx   # 确认对话框
    │       └── EmptyState.tsx      # 空状态占位
    └── assets/                 # 静态资源（图标等）
```

### 各目录职责

| 目录 | 职责 |
|---|---|
| `types/` | 所有 TypeScript 类型/接口定义，按领域拆分文件 |
| `hooks/` | 自定义 Hook，封装可复用的状态逻辑，每个 Hook 只做一件事 |
| `utils/` | 纯函数工具，无副作用、不依赖 React |
| `components/` | UI 组件，按功能模块分子目录；`common/` 放通用基础组件 |
| `assets/` | 图标、图片等静态资源 |

### 文件组织原则

- 单一职责：一个文件只做一件事
- 按功能分层：类型 → 工具 → Hook → 组件，上层依赖下层，禁止反向引用
- 组件拆分粒度：每个组件不超过 200 行

---

## 4. 界面设计规范

### 语言

所有面向用户的文字（按钮、标签、提示、占位符）**一律使用中文**。代码中的变量名、函数名、注释可用英文。

### 色彩系统

| 用途 | 色值 | Tailwind Class |
|---|---|---|
| 主色调 | `#22c55e` | `green-500` |
| 主色调悬停 | `#16a34a` | `green-600` |
| 主色调浅底 | `#f0fdf4` | `green-50` |
| 背景色 | `#ffffff` | `white` |
| 文字主色 | `#1f2937` | `gray-800` |
| 文字次要 | `#6b7280` | `gray-500` |
| 边框色 | `#e5e7eb` | `gray-200` |
| 删除/危险 | `#ef4444` | `red-500` |

### 响应式布局

| 断点 | 宽度 | 布局策略 |
|---|---|---|
| 手机端 | < 768px (`md`) | 单列布局，全宽卡片，底部固定按钮 |
| 桌面端 | ≥ 768px | 最大宽度 `max-w-4xl` 居中，双列或网格布局 |

- 所有列表使用 `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` 自适应
- 表单在移动端占满宽度，桌面端限制 `max-w-lg`
- 弹窗在移动端使用全屏模式，桌面端居中固定宽度
- 使用 Tailwind 的 `sm:` / `md:` / `lg:` 前缀做断点适配

---

## 5. 功能详细规格

### 5.1 训练动作管理

**数据结构：**
```typescript
interface Exercise {
  id: string;          // 唯一标识（crypto.randomUUID()）
  name: string;        // 动作名称，如"杠铃卧推"
  category: string;    // 类别：胸/背/腿/肩/手臂/核心/有氧/其他
  description?: string;// 备注描述
  createdAt: number;   // 创建时间戳
}
```

**功能：**
- **新增**：表单填写名称、选择类别、可选描述，保存后加入列表
- **编辑**：点击编辑按钮，表单回填已有数据，修改后保存
- **删除**：点击删除弹出确认对话框，确认后删除。若该动作已有训练记录，提示用户
- **查看**：列表展示所有动作，支持按类别分组
- 空状态时显示引导文案："暂无训练动作，点击添加"

### 5.2 训练记录管理

**数据结构：**
```typescript
interface TrainingRecord {
  id: string;           // 唯一标识
  exerciseId: string;   // 关联的训练动作 ID
  date: string;         // 训练日期 "YYYY-MM-DD"
  sets: SetRecord[];    // 每组详情
  note?: string;        // 备注
  createdAt: number;
}

interface SetRecord {
  setNumber: number;    // 第几组
  reps: number;         // 次数
  weight: number;       // 重量（kg）
}
```

**功能：**
- **新增记录**：选择动作 → 设置组数（动态增删组）→ 填写每组次数和重量 → 选择日期 → 保存
- **编辑记录**：点击编辑回填数据，修改后保存
- **删除记录**：确认后删除单条记录
- **查看**：按日期倒序展示，每条记录显示动作名、日期、各组详情

### 5.3 筛选查看

- **按日期筛选**：日期范围选择器（开始日期 ~ 结束日期），默认显示最近 30 天
- **按动作筛选**：下拉多选训练动作
- **按类别筛选**：下拉单选动作类别（胸/背/腿等）
- **组合筛选**：以上条件可同时生效，取交集
- 筛选后显示匹配记录数量
- 无匹配结果时显示"暂无符合条件的记录"

### 5.4 数据持久化

**存储 Key 设计：**
| Key | 内容 |
|---|---|
| `gym_exercises` | 训练动作数组 JSON |
| `gym_records` | 训练记录数组 JSON |

**实现要点：**
- 所有增删改操作完成后立即同步写入 LocalStorage
- 应用初始化时从 LocalStorage 读取数据到状态
- 使用 `try-catch` 包裹 JSON 解析，防止数据损坏导致白屏
- 若解析失败，回退为空数组并提示用户

**数据导出/导入（备份恢复）：**
- 提供"导出数据"按钮：将 exercises + records 打包为一个 JSON 文件下载
- 提供"导入数据"按钮：读取 JSON 文件，校验格式后覆盖写入 LocalStorage
- 导入前弹出确认，告知将覆盖现有数据

---

## 6. 开发规范

### 硬性约束

- **纯前端实现，禁止引入任何后端服务、API、数据库**
- 变量和函数命名使用英文（驼峰命名）
- 组件**必须**拆分到独立文件，严禁所有代码写在一个文件里

### TypeScript 规范

- 所有 Props 必须定义 `interface` 或 `type`
- 所有 Hook 返回值必须显式标注类型
- LocalStorage 读写使用泛型保证类型安全
- 禁止使用 `any`，特殊情况用 `unknown` + 类型守卫

### 组件规范

- 使用函数组件 + React Hooks
- 以 `function` 关键字定义组件（非箭头函数）
- 每个组件文件默认导出组件，类型单独导出
- Props 接口命名为 `组件名Props`

### 状态管理

| 层级 | 方案 | 适用场景 |
|---|---|---|
| 组件内部状态 | `useState` | 表单输入、开关状态 |
| 跨组件共享 | 自定义 Hook（`useExercises`、`useRecords`） | 训练动作/记录数据 |
| 全局状态 | React Context（如需要） | 筛选条件、当前日期范围 |

- 不引入 Redux / Zustand 等第三方状态库
- 通过自定义 Hook 将数据逻辑与 UI 分离，Hook 作为唯一的数据源

---

## 7. 实现指南

### 7.1 数据模型设计

见 [5.1](#51-训练动作管理) 和 [5.2](#52-训练记录管理) 中的 interface 定义。

核心关系：`TrainingRecord.exerciseId → Exercise.id`，展示记录时通过 exerciseId 关联查询动作名称。

### 7.2 核心功能实现步骤

1. **项目脚手架**：`pnpm create vite GYM --template react-ts`，安装 Tailwind CSS
2. **类型定义**：`src/types/` 下定义 Exercise、TrainingRecord、SetRecord 等核心类型
3. **存储层**：`src/utils/storage.ts` 封装 `getItem<T>()` / `setItem<T>()` 泛型方法
4. **数据 Hook**：`useExercises` 和 `useRecords`，封装 CRUD + LocalStorage 同步
5. **UI 组件**：按 common → exercise → record → filter → layout 的顺序开发
6. **主组件拼装**：App.tsx 组合各模块
7. **筛选功能**：FilterBar 状态联动 RecordList 的显示
8. **导入导出**：utils 层实现 JSON 序列化/反序列化 + 文件下载/读取

### 7.3 LocalStorage 实现

```typescript
// src/utils/storage.ts
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    console.error(`Failed to parse localStorage key "${key}"`);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to localStorage key "${key}"`, e);
  }
}
```

- 所有数据读写走这两个函数，不在组件中直接操作 `localStorage`
- `useExercises` 和 `useRecords` 内部调用它们，对外暴露 `exercises` / `records` 状态和增删改方法

### 7.4 响应式实现

- **容器**：`<main className="max-w-4xl mx-auto px-4 md:px-6 py-4">`
- **列表**：`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- **弹窗**：移动端 `fixed inset-0` 全屏，桌面端 `fixed inset-0 flex items-center justify-center` + 内层 `max-w-md w-full`
- **表格**：移动端用卡片列表替代 `<table>`，每条记录一张卡片，桌面端用标准表格

---

## 8. 测试与验证

### 功能测试要点

| 模块 | 测试项 |
|---|---|
| 训练动作 | 新增动作 → 列表可见 / 编辑动作 → 数据更新 / 删除动作 → 列表移除 / 空状态文案展示 |
| 训练记录 | 新增记录（含多组）→ 列表可见 / 编辑记录 → 组数增删正常 / 删除记录 → 确认弹窗 → 列表移除 |
| 筛选 | 日期筛选 / 动作筛选 / 类别筛选 / 组合筛选 / 无结果占位 |
| 持久化 | 新增数据后刷新页面 → 数据仍在 / 删除后刷新 → 数据不恢复 |
| 导入导出 | 导出 JSON → 文件下载 / 清空后导入 → 数据恢复 / 格式错误文件导入 → 提示错误 |
| 响应式 | 桌面端双列 / 手机端单列 / 弹窗全屏切换 |

### 兼容性

| 浏览器 | 最低版本 |
|---|---|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |

### 性能

- 首屏加载 < 2 秒（Vite 打包后通常 < 500KB）
- 列表渲染 1000 条记录无卡顿（必要时加虚拟滚动，常规数据量不需要）
- 交互响应 < 100ms（LocalStorage 同步读写）

---

## 9. 部署说明

### 构建

```bash
pnpm build          # 输出到 dist/
pnpm preview        # 本地预览构建产物
```

### 静态部署

- `dist/` 目录即为完整的静态站点，可直接部署到任意静态托管服务
- **推荐平台**：GitHub Pages / Vercel / Netlify（免费，支持自动部署）
- **注意**：使用 Vite 的 `base` 配置项适配部署路径，非根路径部署时需设置 `base: '/<repo-name>/'`

### 开发命令

```bash
pnpm install        # 安装依赖
pnpm dev            # 启动开发服务器（默认 http://localhost:5173）
pnpm build          # 生产构建
pnpm preview        # 预览生产构建
```
