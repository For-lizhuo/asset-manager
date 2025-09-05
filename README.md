# 资产管家 - 移动端资产管理系统

一个基于React + TypeScript + Vite构建的移动端资产管理网站，使用现代化的技术栈提供优秀的用户体验。支持资产配置管理、持仓跟踪、数据导入导出等功能。

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Ant Design Mobile 5.39.0
- **状态管理**: Zustand
- **路由管理**: React Router v7
- **样式方案**: Less CSS 预处理器
- **数据存储**: IndexedDB
- **代码规范**: ESLint + TypeScript ESLint

## 📱 功能特性

### 资产管理
- 📊 **资产总览**: 实时显示总资产价值和分布图表
- 📝 **资产配置**: 添加、编辑、删除资产类别，设置目标占比
- 💰 **持仓管理**: 管理具体投资产品和持仓金额
- 📈 **占比跟踪**: 实时计算实际占比与目标占比对比
- 🔍 **智能搜索**: 按名称快速筛选资产和持仓

### 数据管理
- 📤 **数据导出**: 支持将资产和持仓数据导出为JSON文件
- 📥 **数据导入**: 从JSON文件导入数据，支持数据迁移
- 💾 **本地存储**: 使用IndexedDB进行数据持久化

### UI/UX特性
- 📱 **移动端优化**: 针对手机屏幕优化的界面设计
- 🎨 **现代设计**: 简洁美观的卡片式设计
- ⚡ **流畅交互**: 悬浮按钮、弹窗操作等现代交互
- 👁️ **隐私保护**: 金额显示/隐藏切换功能
- 📊 **数据可视化**: ECharts饼图展示资产分布

## 📁 项目结构

```
src/
├── components/              # 公共组件
│   ├── AssetPieChart/       # 资产分布饼图组件
│   │   ├── index.tsx        # 组件实现
│   │   └── index.less       # 组件样式
│   └── Layout/              # 主布局组件
│       ├── index.tsx        # 布局实现
│       └── index.less       # 布局样式
├── pages/                   # 页面组件
│   ├── Home/                # 首页（资产概览）
│   │   ├── index.tsx        # 页面实现
│   │   └── index.less       # 页面样式
│   ├── AddAsset/            # 添加资产页面
│   ├── AddHolding/          # 添加持仓页面
│   ├── AssetDetail/         # 资产详情页面
│   └── EditAsset/           # 编辑资产页面
├── db/                      # 数据库相关
│   ├── indexedDB.ts         # IndexedDB操作封装
│   └── dataExportImport.ts  # 数据导入导出功能
├── stores/                  # 状态管理
│   └── useAppStore.ts       # Zustand全局状态
├── router/                  # 路由配置
│   └── index.tsx            # 路由定义
├── styles/                  # 全局样式
│   └── global.less          # 全局Less样式
├── App.tsx                  # 应用入口
├── main.tsx                 # 渲染入口
└── index.css                # 样式入口
```

## 🛠️ 开发指南

### 环境要求
- Node.js >= 18
- npm >= 8

### 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
3. **构建生产版本**
   ```bash
   npm run build
   ```

4. **预览生产版本**
   ```bash
   npm run preview
   ```

### 开发配置

- **开发服务器**: http://localhost:5173
- **移动端调试**: 服务器已配置host=true，可通过局域网IP访问
- **热重载**: 支持组件热重载，修改代码即时生效

## 📦 状态管理

使用Zustand进行轻量级状态管理，主要状态包括：

### 数据状态
- **assets**: 资产列表（名称、目标占比等）
- **holdings**: 持仓列表（产品名称、代码、金额、归属资产等）
- **totalAssetValue**: 总资产价值（实时计算）

### UI状态
- **loading**: 加载状态
- **currentPage**: 当前页面路径
- **initialized**: 应用初始化状态

### 操作方法
- **资产操作**: addAsset、updateAsset、deleteAsset
- **持仓操作**: addHolding、updateHolding、deleteHolding
- **数据管理**: initializeApp、reloadData、calculateTotalValue

数据通过IndexedDB持久化保存，应用启动时自动从localStorage迁移旧数据。

## 🎨 样式系统

- **Less CSS**: CSS预处理器，支持变量、嵌套、混合等特性
- **模块化样式**: 每个组件都有独立的样式文件
- **移动端适配**: 响应式设计，针对移动端优化
- **组件样式**: 统一的组件样式规范（index.tsx + index.less）
- **全局样式**: 通用工具类和基础样式定义

### 样式规范
- 组件样式文件：`src/components/ComponentName/index.less`
- 页面样式文件：`src/pages/PageName/index.less`
- 全局样式文件：`src/styles/global.less`

## 📝 开发规范

### 文件结构规范
- **组件文件夹**: 每个组件包含 `index.tsx` 和 `index.less` 两个文件
- **页面文件夹**: 每个页面包含 `index.tsx` 和 `index.less` 两个文件
- **数据库逻辑**: 所有数据库相关逻辑放在 `db/` 文件夹下

### 代码规范
- **组件命名**: PascalCase
- **文件命名**: index.tsx（组件入口）、index.less（样式文件）
- **类型定义**: 使用TypeScript接口定义数据模型
- **ID生成**: 使用UUID确保唯一性
- **占比显示**: 使用Math.round()将占比四舍五入为整数

### 数据模型
```typescript
// 资产模型
interface Asset {
  id: string
  name: string
  targetRatio?: number  // 目标占比（0-100整数）
  createdAt: string
  updatedAt: string
}

// 持仓模型
interface Holding {
  id: string
  name: string
  code?: string         // 产品代码（可选）
  assetId: string       // 归属资产ID
  amount: number        // 持仓金额
  createdAt: string
  updatedAt: string
}
```

## 🔧 配置文件说明

- `vite.config.ts`: Vite构建配置
- `tsconfig.json`: TypeScript配置
- `eslint.config.js`: ESLint规则配置
- `package.json`: 项目依赖和脚本配置

## 💾 数据存储

### IndexedDB 数据库
- **assets表**: 存储资产信息
- **holdings表**: 存储持仓信息
- **自动迁移**: 应用启动时自动从localStorage迁移数据
- **CRUD操作**: 完整的增删改查功能封装

### 数据导入导出
- **导出格式**: JSON格式，包含版本信息和时间戳
- **导入验证**: 严格的数据格式验证
- **错误处理**: 完善的错误提示和异常处理

## 📱 移动端特性

- **响应式设计**: 适配不同屏幕尺寸的移动设备
- **触摸优化**: 按钮大小、间距符合移动端规范
- **悬浮操作**: 悬浮设置按钮，便于快速访问功能
- **手势交互**: 支持卡片点击、滑动等操作
- **数据可视化**: 移动端优化的ECharts图表展示
- **弹窗交互**: ActionSheet、Dialog等移动端友好的交互组件

## 🚀 部署建议

1. **构建优化**: 使用`npm run build`生成优化后的静态文件
2. **静态部署**: 推荐部署到Vercel、Netlify等静态托管平台
3. **移动端测试**: 建议在真机上测试用户体验
4. **性能监控**: 关注首屏加载时间和交互响应速度

## 🔮 未来规划

- 🌓 **深色模式**: 支持系统主题切换
- 📱 **PWA支持**: 添加离线访问和应用安装功能
- 📊 **更多图表**: 支持趋势图、对比图等数据可视化
- 🔔 **提醒功能**: 资产配置偏离提醒
- 🔐 **数据加密**: 本地数据加密存储

## 📄 许可证

MIT License