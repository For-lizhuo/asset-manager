// IndexedDB 数据库管理
interface Asset {
  id: string
  name: string
  targetRatio?: number
  // 直接在资产中存储机构信息
  institutions: InstitutionDetail[]
  createdAt: string
  updatedAt: string
}

// 定义机构明细接口
export interface InstitutionDetail {
  institution: string
  amount: number
}

class AssetManagerDB {
  private dbName = 'AssetManagerDB'
  private version = 2 // 更新版本号
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('Failed to open database'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建资产表
        if (!db.objectStoreNames.contains('assets')) {
          const assetStore = db.createObjectStore('assets', { keyPath: 'id' })
          assetStore.createIndex('name', 'name', { unique: false })
          assetStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // 删除持仓表（因为我们不再需要它）
        if (db.objectStoreNames.contains('holdings')) {
          db.deleteObjectStore('holdings')
        }
      }
    })
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    const transaction = this.db.transaction([storeName], mode)
    return transaction.objectStore(storeName)
  }

  // 资产相关操作
  async getAllAssets(): Promise<Asset[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('assets')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error('Failed to get assets'))
      }
    })
  }

  async addAsset(asset: Asset): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('assets', 'readwrite')
      const request = store.add(asset)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to add asset'))
      }
    })
  }

  async updateAsset(asset: Asset): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('assets', 'readwrite')
      const request = store.put(asset)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to update asset'))
      }
    })
  }

  async deleteAsset(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('assets', 'readwrite')
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete asset'))
      }
    })
  }

  // 数据迁移：从 localStorage 迁移到 IndexedDB
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const localData = localStorage.getItem('asset-manager-storage')
      if (!localData) return

      const data = JSON.parse(localData)
      const state = data.state || data

      // 迁移资产数据
      if (state.assets && Array.isArray(state.assets)) {
        for (const asset of state.assets) {
          try {
            await this.addAsset(asset)
          } catch (error) {
            console.warn('Failed to migrate asset:', asset.id, error)
          }
        }
      }

      // 注意：不再迁移持仓数据，因为数据结构已更改
      console.log('Data migration from localStorage completed')
      
      // 清除 localStorage 中的旧数据
      localStorage.removeItem('asset-manager-storage')
    } catch (error) {
      console.error('Migration failed:', error)
    }
  }
}

// 创建单例实例
export const assetManagerDB = new AssetManagerDB()

// 导出类型
export type { Asset }