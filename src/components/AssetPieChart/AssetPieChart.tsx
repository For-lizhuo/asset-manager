import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { useAppStore } from '../../stores'
import './AssetPieChart.less'

interface PieChartProps {
  height?: number
}

interface TooltipParams {
  data: {
    name: string
    value: number
    targetRatio?: number
  }
  name: string
  value: number
}

interface LabelParams {
  name: string
  value: number
}

const AssetPieChart = ({ height = 280 }: PieChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const { assets, initialized, loading } = useAppStore()
  
  // 单独的状态来跟踪图表是否已准备好
  const [chartReady, setChartReady] = useState(false)

  useLayoutEffect(() => {
    // 确保 DOM 元素已挂载且图表实例尚未创建
    if (!chartRef.current) {
      console.log('图表 DOM 元素尚未准备好')
      return
    }
    
    if (chartInstance.current) {
      console.log('图表实例已存在，跳过初始化')
      return
    }

    console.log('开始初始化图表，DOM元素已准备好')
    
    try {
      // 初始化图表
      chartInstance.current = echarts.init(chartRef.current)
      setChartReady(true)
      console.log('图表实例已创建')
    } catch (error) {
      console.error('图表初始化失败:', error)
    }

    return () => {
      if (chartInstance.current) {
        console.log('清理图表实例')
        chartInstance.current.dispose()
        chartInstance.current = null
      }
      setChartReady(false)
    }
  }, []) // 空依赖数组，只在组件挂载时执行

  useEffect(() => {
    // 如果图表实例未创建但 DOM 元素已准备好，尝试初始化
    if (!chartInstance.current && chartRef.current && !chartReady) {
      console.log('在数据更新时发现图表未初始化，尝试初始化...')
      chartInstance.current = echarts.init(chartRef.current)
      setChartReady(true)
      console.log('图表实例在数据更新时创建成功')
    }
    
    // 只有在图表实例准备好且数据已初始化时才更新图表
    if (!chartInstance.current || !chartReady || !initialized) {
      console.log('图表未准备好或数据未初始化:', { 
        chartReady, 
        initialized, 
        hasChartInstance: !!chartInstance.current 
      })
      return
    }

    // 确保 assets 存在
    if (!assets) {
      console.log('资产数据未定义')
      return
    }

    console.log('饼图数据更新:', { 
      assetsCount: assets.length, 
      initialized,
      loading,
      chartReady
    })

    // 计算每个资产的机构金额和占比
    const assetData = assets.map(asset => {
      const assetValue = asset.institutions.reduce((sum, institution) => sum + institution.amount, 0)
      return {
        name: asset.name,
        value: assetValue,
        targetRatio: asset.targetRatio || 0
      }
    }).filter(item => item.value > 0) // 只显示有机构的资产

    const totalValue = assetData.reduce((sum, item) => sum + item.value, 0)

    // 配置图表选项
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: TooltipParams) => {
          const data = params.data
          const actualRatio = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : '0.0'
          return `
            <div style="font-size: 14px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
              <div>资产金额: ¥${data.value.toLocaleString()}</div>
              <div>实际占比: ${actualRatio}%</div>
              ${(data.targetRatio && data.targetRatio > 0) ? `<div>目标占比: ${data.targetRatio}%</div>` : ''}
            </div>
          `
        }
      },
      legend: {
        show: false
      },
      series: [
        {
          type: 'pie',
          radius: ['25%', '60%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            fontSize: 11,
            color: '#666',
            formatter: (params: LabelParams) => {
              const actualRatio = totalValue > 0 ? ((params.value / totalValue) * 100).toFixed(0) : '0'
              // 限制标签长度，避免溢出
              const name = params.name.length > 6 ? params.name.substring(0, 6) + '...' : params.name
              return `${name} ${actualRatio}%`
            },
            // 防止标签溢出
            overflow: 'break'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 8,
            lineStyle: {
              color: '#ccc',
              width: 1
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
              formatter: (params: LabelParams) => {
                const actualRatio = totalValue > 0 ? ((params.value / totalValue) * 100).toFixed(1) : '0.0'
                return `${params.name}\n${actualRatio}%`
              }
            },
            labelLine: {
              show: true
            }
          },
          data: assetData.length > 0 ? assetData : [
            { 
              name: '暂无数据', 
              value: 1,
              itemStyle: {
                color: '#e5e7eb'
              }
            }
          ],
          color: [
            '#3b82f6', // 蓝色
            '#10b981', // 绿色
            '#f59e0b', // 橙色
            '#ef4444', // 红色
            '#8b5cf6', // 紫色
            '#06b6d4', // 青色
            '#84cc16', // 浅绿色
            '#f97316', // 深橙色
          ]
        }
      ]
    }

    chartInstance.current.setOption(option)

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [assets, chartReady, initialized, loading])

  // 加载状态
  if (loading || !initialized) {
    return (
      <div 
        className="flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <div className="text-4xl mb-4">🔄</div>
        <div className="text-center">
          <div className="font-semibold mb-2">加载中...</div>
          <div className="text-sm">正在加载资产数据</div>
        </div>
      </div>
    )
  }

  // 确保 assets 存在
  if (!assets) {
    return (
      <div 
        className="flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <div className="text-4xl mb-4">📊</div>
        <div className="text-center">
          <div className="font-semibold mb-2">暂无资产数据</div>
          <div className="text-sm">请先添加资产和机构</div>
        </div>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <div className="text-4xl mb-4">📊</div>
        <div className="text-center">
          <div className="font-semibold mb-2">暂无资产数据</div>
          <div className="text-sm">请先添加资产和机构</div>
        </div>
      </div>
    )
  }

  // 确保 assets 存在后再调用 some 方法
  const hasInstitutions = assets && assets.some(asset => 
    asset.institutions && asset.institutions.some(institution => institution.amount > 0)
  )
  
  if (!hasInstitutions) {
    return (
      <div 
        className="flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <div className="text-4xl mb-4">📈</div>
        <div className="text-center">
          <div className="font-semibold mb-2">暂无机构数据</div>
          <div className="text-sm">请添加机构记录</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={chartRef} 
      style={{ height, width: '100%' }}
      className="bg-white rounded-lg"
    />
  )
}

export default AssetPieChart