// IndexedDB 数据库管理
interface Asset {
  id: string
  name: string
  targetRatio?: number
  createdAt: string
  updatedAt: string
}

interface Holding {
  id: string
  name: string
  code?: string
  assetId: string
  amount: number
  createdAt: string
  updatedAt: string
}

class AssetManagerDB {
  private dbName = 'AssetManagerDB'
  private version = 1
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

        // 创建持仓表
        if (!db.objectStoreNames.contains('holdings')) {
          const holdingStore = db.createObjectStore('holdings', { keyPath: 'id' })
          holdingStore.createIndex('assetId', 'assetId', { unique: false })
          holdingStore.createIndex('name', 'name', { unique: false })
          holdingStore.createIndex('createdAt', 'createdAt', { unique: false })
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

  // 持仓相关操作
  async getAllHoldings(): Promise<Holding[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('holdings')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error('Failed to get holdings'))
      }
    })
  }

  async getHoldingsByAssetId(assetId: string): Promise<Holding[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('holdings')
      const index = store.index('assetId')
      const request = index.getAll(assetId)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error('Failed to get holdings by asset ID'))
      }
    })
  }

  async addHolding(holding: Holding): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('holdings', 'readwrite')
      const request = store.add(holding)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to add holding'))
      }
    })
  }

  async updateHolding(holding: Holding): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('holdings', 'readwrite')
      const request = store.put(holding)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to update holding'))
      }
    })
  }

  async deleteHolding(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('holdings', 'readwrite')
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete holding'))
      }
    })
  }

  async deleteHoldingsByAssetId(assetId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('holdings', 'readwrite')
      const index = store.index('assetId')
      const request = index.openCursor(IDBKeyRange.only(assetId))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => {
        reject(new Error('Failed to delete holdings by asset ID'))
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

      // 迁移持仓数据
      if (state.holdings && Array.isArray(state.holdings)) {
        for (const holding of state.holdings) {
          try {
            // 确保 assetId 是字符串格式
            const fixedHolding = {
              ...holding,
              assetId: Array.isArray(holding.assetId) ? holding.assetId[0] : holding.assetId
            }
            await this.addHolding(fixedHolding)
          } catch (error) {
            console.warn('Failed to migrate holding:', holding.id, error)
          }
        }
      }

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
export type { Asset, Holding }