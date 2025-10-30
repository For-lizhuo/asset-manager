import { assetManagerDB, type Asset, type Holding } from './indexedDB'

// 导出数据接口
export interface ExportData {
  version: string
  exportDate: string
  assets: Asset[]
  holdings: Holding[]
  totalCount: {
    assets: number
    holdings: number
  }
}

// 导出数据到JSON文件
export const exportDataToJSON = async (): Promise<void> => {
  try {
    // 获取所有数据
    const [assets, holdings] = await Promise.all([
      assetManagerDB.getAllAssets(),
      assetManagerDB.getAllHoldings()
    ])

    // 构建导出数据结构
    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      assets,
      holdings,
      totalCount: {
        assets: assets.length,
        holdings: holdings.length
      }
    }

    // 创建文件并下载
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const fileName = `资产管理数据_${new Date().toISOString().slice(0, 10)}.json`
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = fileName
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    
    console.log('数据导出成功:', fileName)
  } catch (error) {
    console.error('导出数据失败:', error)
    throw new Error('导出数据失败，请重试')
  }
}

// 验证导入数据格式
const validateImportData = (data: unknown): data is ExportData => {
  if (!data || typeof data !== 'object') {
    return false
  }
  
  const dataObj = data as Record<string, unknown>
  
  // 检查必需字段
  if (!dataObj.assets || !Array.isArray(dataObj.assets)) {
    return false
  }
  
  if (!dataObj.holdings || !Array.isArray(dataObj.holdings)) {
    return false
  }
  
  // 验证资产数据结构
  for (const asset of dataObj.assets) {
    if (!asset || typeof asset !== 'object') return false
    const assetObj = asset as Record<string, unknown>
    if (!assetObj.id || !assetObj.name || !assetObj.createdAt || !assetObj.updatedAt) {
      return false
    }
  }
  
  // 验证持仓数据结构
  for (const holding of dataObj.holdings) {
    if (!holding || typeof holding !== 'object') return false
    const holdingObj = holding as Record<string, unknown>
    if (!holdingObj.id || !holdingObj.name || !holdingObj.assetId || 
        typeof holdingObj.amount !== 'number' || 
        !holdingObj.createdAt || !holdingObj.updatedAt) {
      return false
    }
    
    // 验证 institutionDetails 字段（如果存在）
    if (holdingObj.institutionDetails !== undefined) {
      if (!Array.isArray(holdingObj.institutionDetails)) {
        return false
      }
      
      // 验证每个机构明细项
      for (const detail of holdingObj.institutionDetails) {
        if (!detail || typeof detail !== 'object') return false
        const detailObj = detail as Record<string, unknown>
        if (typeof detailObj.institution !== 'string' || typeof detailObj.amount !== 'number') {
          return false
        }
      }
    }
  }
  
  return true
}

// 从JSON文件导入数据
export const importDataFromJSON = async (file: File): Promise<{ assets: number, holdings: number }> => {
  try {
    // 读取文件内容
    const text = await file.text()
    const data = JSON.parse(text)
    
    // 验证数据格式
    if (!validateImportData(data)) {
      throw new Error('数据格式无效，请确认文件是否正确')
    }
    
    // 清空现有数据前先备份（可选）
    console.log('开始导入数据...')
    
    let importedAssets = 0
    let importedHoldings = 0
    
    // 导入资产数据
    for (const asset of data.assets) {
      try {
        await assetManagerDB.addAsset(asset)
        importedAssets++
      } catch {
        // 如果资产已存在，尝试更新
        try {
          await assetManagerDB.updateAsset(asset)
          importedAssets++
        } catch {
          console.warn('无法导入资产:', asset.name)
        }
      }
    }
    
    // 导入持仓数据
    for (const holding of data.holdings) {
      try {
        await assetManagerDB.addHolding(holding)
        importedHoldings++
      } catch {
        // 如果持仓已存在，尝试更新
        try {
          await assetManagerDB.updateHolding(holding)
          importedHoldings++
        } catch {
          console.warn('无法导入持仓:', holding.name)
        }
      }
    }
    
    console.log(`数据导入成功: ${importedAssets} 个资产, ${importedHoldings} 个持仓`)
    
    return {
      assets: importedAssets,
      holdings: importedHoldings
    }
  } catch (error) {
    console.error('导入数据失败:', error)
    if (error instanceof SyntaxError) {
      throw new Error('文件格式错误，请确认是否为有效的JSON文件')
    }
    throw error
  }
}

// 清空所有数据（用于导入前清理）
export const clearAllData = async (): Promise<void> => {
  try {
    const [assets, holdings] = await Promise.all([
      assetManagerDB.getAllAssets(),
      assetManagerDB.getAllHoldings()
    ])
    
    // 删除所有持仓
    for (const holding of holdings) {
      await assetManagerDB.deleteHolding(holding.id)
    }
    
    // 删除所有资产
    for (const asset of assets) {
      await assetManagerDB.deleteAsset(asset.id)
    }
    
    console.log('所有数据已清空')
  } catch (error) {
    console.error('清空数据失败:', error)
    throw new Error('清空数据失败，请重试')
  }
}