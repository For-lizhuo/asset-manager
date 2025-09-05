import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { assetManagerDB, type Asset, type Holding } from '../utils/indexedDB'

// 应用状态接口
interface AppState {
  // 资产相关
  assets: Asset[]
  totalAssetValue: number
  
  // 持仓相关
  holdings: Holding[]
  
  // UI状态
  loading: boolean
  currentPage: string
  initialized: boolean
  
  // 初始化方法
  initializeApp: () => Promise<void>
  
  // 资产操作方法
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  
  // 持仓操作方法
  addHolding: (holding: Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateHolding: (id: string, updates: Partial<Holding>) => Promise<void>
  deleteHolding: (id: string) => Promise<void>
  
  setLoading: (loading: boolean) => void
  setCurrentPage: (page: string) => void
  
  // 计算总资产价值
  calculateTotalValue: () => void
  
  // 重新加载数据
  reloadData: () => Promise<void>
}

export const useAppStore = create<AppState>()((set, get) => ({
  // 初始状态
  assets: [],
  holdings: [],
  totalAssetValue: 0,
  loading: false,
  currentPage: 'home',
  initialized: false,
  
  // 初始化应用
  initializeApp: async () => {
    const state = get()
    if (state.initialized) return
    
    try {
      set({ loading: true })
      
      // 初始化数据库
      await assetManagerDB.init()
      
      // 数据迁移（只在第一次访问时执行）
      await assetManagerDB.migrateFromLocalStorage()
      
      // 加载数据
      await get().reloadData()
      
      set({ initialized: true })
    } catch (error) {
      console.error('Failed to initialize app:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  // 重新加载数据
  reloadData: async () => {
    try {
      const [assets, holdings] = await Promise.all([
        assetManagerDB.getAllAssets(),
        assetManagerDB.getAllHoldings()
      ])
      
      set({ assets, holdings })
      get().calculateTotalValue()
    } catch (error) {
      console.error('Failed to reload data:', error)
    }
  },
  
  // 资产操作
  addAsset: async (assetData) => {
    try {
      const newAsset: Asset = {
        ...assetData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      await assetManagerDB.addAsset(newAsset)
      await get().reloadData()
    } catch (error) {
      console.error('Failed to add asset:', error)
      throw error
    }
  },
  
  updateAsset: async (id, updates) => {
    try {
      const currentAssets = get().assets
      const existingAsset = currentAssets.find(asset => asset.id === id)
      
      if (!existingAsset) {
        throw new Error('Asset not found')
      }
      
      const updatedAsset: Asset = {
        ...existingAsset,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      await assetManagerDB.updateAsset(updatedAsset)
      await get().reloadData()
    } catch (error) {
      console.error('Failed to update asset:', error)
      throw error
    }
  },
  
  deleteAsset: async (id) => {
    try {
      // 删除资产时，也要删除相关的持仓
      await Promise.all([
        assetManagerDB.deleteAsset(id),
        assetManagerDB.deleteHoldingsByAssetId(id)
      ])
      
      await get().reloadData()
    } catch (error) {
      console.error('Failed to delete asset:', error)
      throw error
    }
  },
  
  // 持仓操作
  addHolding: async (holdingData) => {
    try {
      // 确保 assetId 是字符串，如果是数组则取第一个值
      const assetId = Array.isArray(holdingData.assetId) 
        ? holdingData.assetId[0] 
        : holdingData.assetId
      
      const newHolding: Holding = {
        ...holdingData,
        assetId, // 使用处理后的 assetId
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      await assetManagerDB.addHolding(newHolding)
      await get().reloadData()
    } catch (error) {
      console.error('Failed to add holding:', error)
      throw error
    }
  },
  
  updateHolding: async (id, updates) => {
    try {
      const currentHoldings = get().holdings
      const existingHolding = currentHoldings.find(holding => holding.id === id)
      
      if (!existingHolding) {
        throw new Error('Holding not found')
      }
      
      const updatedHolding: Holding = {
        ...existingHolding,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      await assetManagerDB.updateHolding(updatedHolding)
      await get().reloadData()
    } catch (error) {
      console.error('Failed to update holding:', error)
      throw error
    }
  },
  
  deleteHolding: async (id) => {
    try {
      await assetManagerDB.deleteHolding(id)
      await get().reloadData()
    } catch (error) {
      console.error('Failed to delete holding:', error)
      throw error
    }
  },
  
  // UI状态操作
  setLoading: (loading) => set({ loading }),
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // 计算总资产价值
  calculateTotalValue: () => {
    const { holdings } = get()
    const total = holdings.reduce((sum, holding) => sum + holding.amount, 0)
    set({ totalAssetValue: total })
  }
}))

// 导出类型以便其他文件使用
export type { Asset, Holding }