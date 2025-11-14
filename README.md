# 资产管家 - 移动端资产管理系统

一个基于 React + TypeScript + Vite 构建的移动端资产管理应用，帮助用户轻松管理各类投资资产。该应用提供了直观的资产概览、详细的资产配置管理、机构信息跟踪以及便捷的数据导入导出功能。

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 7
- **UI组件库**: Ant Design Mobile 5.39.0
- **状态管理**: Zustand 5.0.8
- **路由管理**: React Router v7
- **样式方案**: Less CSS 预处理器
- **数据存储**: IndexedDB
- **数据可视化**: ECharts 6.0.0
- **代码规范**: ESLint + TypeScript ESLint

## 📱 核心功能

### 资产管理
- 📊 **资产总览**: 实时显示总资产价值和分布图表
- 📝 **资产配置**: 添加、编辑、删除资产类别，设置目标占比
- 🏦 **机构管理**: 直接在资产中管理相关机构及金额
- 📈 **占比跟踪**: 实时计算实际占比与目标占比对比

### 数据管理
- 📤 **数据导出**: 支持将资产和机构数据导出为JSON文件
- 📥 **数据导入**: 从JSON文件导入数据，支持数据迁移
- 💾 **本地存储**: 使用IndexedDB进行数据持久化
- ♻️ **数据迁移**: 自动从localStorage迁移旧数据

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
│   └── Layout/              # 主布局组件
├── pages/                   # 页面组件
│   ├── Home/                # 首页（资产概览）
│   ├── AddAsset/            # 添加资产页面
│   ├── AssetDetail/         # 资产详情页面
│   └── EditAsset/           # 编辑资产页面
├── db/                      # 数据库相关
│   ├── indexedDB.ts         # IndexedDB操作封装
│   └── dataExportImport.ts  # 数据导入导出功能
├── stores/                  # 状态管理
│   └── index.ts             # Zustand全局状态
├── router/                  # 路由配置
│   └── index.tsx            # 路由定义
├── App.tsx                  # 应用入口
├── main.tsx                 # 渲染入口
├── index.css                # 样式入口
└── vite-env.d.ts           # 类型声明文件
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

- **开发服务器**: http://localhost:3000
- **基础路径**: /asset-manager/
- **移动端调试**: 服务器已配置host=true，可通过局域网IP访问
- **热重载**: 支持组件热重载，修改代码即时生效

## 📦 状态管理

使用Zustand进行轻量级状态管理，主要状态包括：

### 数据状态
- **assets**: 资产列表（名称、目标占比、机构信息等）
- **totalAssetValue**: 总资产价值（实时计算）

### UI状态
- **loading**: 加载状态
- **currentPage**: 当前页面路径
- **initialized**: 应用初始化状态

### 操作方法
- **资产操作**: addAsset、updateAsset、deleteAsset
- **数据管理**: initializeApp、reloadData、calculateTotalValue

数据通过IndexedDB持久化保存，应用启动时自动从localStorage迁移旧数据。

## 🎨 样式系统

- **Less CSS**: CSS预处理器，支持变量、嵌套、混合等特性
- **模块化样式**: 每个组件都有独立的样式文件
- **移动端适配**: 响应式设计，针对移动端优化

## 📝 开发规范

### 文件结构规范
- **组件文件夹**: 每个组件包含 `index.tsx` 和样式文件
- **页面文件夹**: 每个页面包含 `index.tsx` 和样式文件
- **数据库逻辑**: 所有数据库相关逻辑放在 [db/](/asset-manager/src/db) 文件夹下

### 代码规范
- **组件命名**: PascalCase
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
  institutions: InstitutionDetail[] // 机构明细
  createdAt: string
  updatedAt: string
}

// 机构明细模型
interface InstitutionDetail {
  institution: string   // 机构名称
  amount: number        // 金额
}
```

## 🔧 配置文件说明

- `vite.config.ts`: Vite构建配置
- `tsconfig.json`: TypeScript配置
- `eslint.config.js`: ESLint规则配置
- `package.json`: 项目依赖和脚本配置
- `config.ts`: 项目基础路径配置

## 💾 数据存储

### IndexedDB 数据库
- **assets表**: 存储资产信息（包含机构信息）
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

## 🚀 部署说明

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署输出**
   构建完成后，生成的静态文件位于 `dist` 目录中，可以部署到任何静态文件服务器。

3. **基础路径**
   项目配置了基础路径 `/asset-manager/`，如需更改，请修改 [config.ts](file:///e:/desktop/web/asset-manager/config.ts) 文件中的 `rootPath` 变量，并相应调整 [vite.config.ts](file:///e:/desktop/web/asset-manager/vite.config.ts) 中的配置。

## 📄 许可证

MIT License