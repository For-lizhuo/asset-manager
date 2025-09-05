# 资产管家 - 移动端资产管理系统

一个基于React + TypeScript + Vite构建的移动端资产管理网站，使用现代化的技术栈提供优秀的用户体验。

## 🚀 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Ant Design Mobile
- **状态管理**: Zustand
- **路由管理**: React Router v6
- **样式方案**: Tailwind CSS
- **代码规范**: ESLint + TypeScript ESLint

## 📱 功能特性

### 核心功能
- 📊 **资产总览**: 实时显示总资产价值和数量统计
- 📝 **资产管理**: 添加、编辑、删除各类资产
- 🏷️ **分类管理**: 支持房产、车辆、金融、其他资产分类
- 🔍 **智能搜索**: 按名称、描述、类型筛选资产
- 📸 **图片上传**: 支持资产图片展示
- 👤 **用户系统**: 登录/退出、个人信息管理

### UI/UX特性
- 📱 **移动端优化**: 针对手机屏幕优化的界面设计
- 🎨 **现代设计**: 简洁美观的Material Design风格
- ⚡ **流畅交互**: 滑动操作、手势支持
- 💾 **数据持久化**: 本地存储，刷新不丢失
- 🌓 **深色模式**: 跟随系统主题（预留）

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   └── Layout.tsx       # 主布局组件（底部导航）
├── pages/              # 页面组件
│   ├── Login.tsx       # 登录页
│   ├── Home.tsx        # 首页（资产概览）
│   ├── AssetList.tsx   # 资产列表
│   ├── AssetDetail.tsx # 资产详情
│   ├── AddAsset.tsx    # 添加资产
│   └── Profile.tsx     # 个人中心
├── stores/             # 状态管理
│   └── useAppStore.ts  # Zustand全局状态
├── router/             # 路由配置
│   └── index.tsx       # 路由定义
├── App.tsx             # 应用入口
├── main.tsx            # 渲染入口
└── index.css           # 全局样式
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

- **用户状态**: 登录信息、用户资料
- **资产数据**: 资产列表、总价值统计
- **UI状态**: 加载状态、当前页面

数据通过localStorage持久化保存。

## 🎨 样式系统

- **Tailwind CSS**: 原子化CSS类名，快速构建界面
- **移动端适配**: 响应式设计，最大宽度限制
- **自定义组件**: `.container-mobile`、`.page-padding`等工具类

## 📝 开发规范

- **组件命名**: PascalCase
- **文件命名**: PascalCase（组件）、camelCase（工具）
- **类型定义**: 使用TypeScript接口定义
- **代码规范**: ESLint + Prettier配置

## 🔧 配置文件说明

- `vite.config.ts`: Vite构建配置
- `tailwind.config.js`: Tailwind CSS配置
- `postcss.config.js`: PostCSS配置
- `tsconfig.json`: TypeScript配置
- `eslint.config.js`: ESLint规则配置

## 📱 移动端特性

- **底部导航**: Tab Bar导航，固定底部
- **滑动操作**: SwipeAction支持编辑/删除
- **触摸优化**: 按钮大小、间距符合移动端规范
- **虚拟键盘**: 表单输入优化

## 🚀 部署建议

1. **构建优化**: 使用`npm run build`生成优化后的静态文件
2. **CDN部署**: 推荐部署到Vercel、Netlify等平台
3. **PWA支持**: 可扩展为PWA应用（预留）
4. **移动端测试**: 建议在真机上测试用户体验

## 📄 许可证

MIT License