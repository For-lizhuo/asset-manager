import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { assetManagerDB, type Asset, type InstitutionDetail } from '../db/indexedDB'

// 应用状态接口
interface AppState {
  // 资产相关
  assets: Asset[]
  totalAssetValue: number
  
  // UI状态
  loading: boolean
  currentPage: string
  initialized: boolean
  
  // 初始化方法
  initializeApp: () => Promise<void>
  
  // 资产操作方法
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'institutions'> & { institutions?: InstitutionDetail[] }) => Promise<void>
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  
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
      const assets = await assetManagerDB.getAllAssets()
      
      set({ assets })
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
        institutions: assetData.institutions || [],
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
      await assetManagerDB.deleteAsset(id)
      await get().reloadData()
    } catch (error) {
      console.error('Failed to delete asset:', error)
      throw error
    }
  },
  
  // UI状态操作
  setLoading: (loading) => set({ loading }),
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // 计算总资产价值
  calculateTotalValue: () => {
    const { assets } = get()
    const total = assets.reduce((sum, asset) => {
      return sum + asset.institutions.reduce((assetSum, inst) => assetSum + inst.amount, 0)
    }, 0)
    set({ totalAssetValue: total })
  }
}))

// 导出类型以便其他文件使用
export type { Asset, InstitutionDetail }