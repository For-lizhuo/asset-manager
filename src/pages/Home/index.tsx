import { Card, List, ActionSheet, Toast, Dialog } from "antd-mobile";
import {
  EyeOutline,
  EyeInvisibleOutline,
  AddCircleOutline,
  MoreOutline,
  UploadOutline,
  DownlandOutline,
} from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores";
import { useEffect, useState, useRef } from "react";
import moment from "moment";
import AssetPieChart from "../../components/AssetPieChart";
import { exportDataToJSON, importDataFromJSON, clearAllData } from "../../db/dataExportImport";
import "./index.less";

// 设置moment为中文
moment.locale("zh-cn");

const Home = () => {
  const navigate = useNavigate();
  const [showAmounts, setShowAmounts] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    totalAssetValue,
    calculateTotalValue,
    initializeApp,
    initialized,
    assets,
    holdings,
    reloadData,
  } = useAppStore();

  useEffect(() => {
    // 确保应用已初始化，然后计算总资产
    const initAndCalculate = async () => {
      if (!initialized) {
        await initializeApp();
      }
      calculateTotalValue();
    };

    initAndCalculate();
  }, [initializeApp, initialized, calculateTotalValue]);

  const formatCurrency = (amount: number) => {
    if (!showAmounts) {
      return "****";
    }
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  // 切换金额显示状态
  const toggleAmountVisibility = () => {
    setShowAmounts(!showAmounts);
  };

  // 获取资产的持仓信息（按金额从大到小排序）
  const getAssetHoldings = (assetId: string) => {
    return holdings
      .filter((holding) => holding.assetId === assetId)
      .sort((a, b) => b.amount - a.amount); // 按持仓金额从大到小排序
  };

  // 计算资产总金额
  const getAssetTotalValue = (assetId: string) => {
    const assetHoldings = getAssetHoldings(assetId);
    return assetHoldings.reduce((sum, holding) => sum + holding.amount, 0);
  };

  // 计算实际占比（整数）
  const getActualRatio = (assetValue: number) => {
    return totalAssetValue > 0
      ? Math.round((assetValue / totalAssetValue) * 100)
      : 0;
  };

  // 设置菜单选项
  const settingsActions = [
    {
      text: '导出数据',
      key: 'export',
      icon: <DownlandOutline />,
    },
    {
      text: '导入数据',
      key: 'import', 
      icon: <UploadOutline />,
    },
    {
      text: '取消',
      key: 'cancel',
      description: ''
    }
  ];

  // 处理设置菜单点击
  const handleSettingsAction = (action: { key: string | number }) => {
    setSettingsVisible(false);
    
    switch (action.key) {
      case 'export':
        handleExportData();
        break;
      case 'import':
        handleImportData();
        break;
      default:
        break;
    }
  };

  // 导出数据
  const handleExportData = async () => {
    try {
      await exportDataToJSON();
      Toast.show({
        content: '数据导出成功',
        position: 'center'
      });
    } catch (error) {
      Toast.show({
        content: error instanceof Error ? error.message : '导出失败',
        position: 'center'
      });
    }
  };

  // 导入数据
  const handleImportData = () => {
    if (assets.length > 0 || holdings.length > 0) {
      Dialog.confirm({
        content: '导入数据将会替换当前所有数据，是否继续？',
        onConfirm: () => {
          fileInputRef.current?.click();
        }
      });
    } else {
      fileInputRef.current?.click();
    }
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      Toast.show({
        content: '正在导入数据...',
        position: 'center',
        duration: 0
      });

      // 清空现有数据
      await clearAllData();
      
      // 导入新数据
      const result = await importDataFromJSON(file);
      
      // 重新加载数据
      await reloadData();
      
      Toast.clear();
      Toast.show({
        content: `导入成功：${result.assets} 个资产，${result.holdings} 个持仓`,
        position: 'center'
      });
    } catch (error) {
      Toast.clear();
      Toast.show({
        content: error instanceof Error ? error.message : '导入失败',
        position: 'center'
      });
    }
    
    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-padding home-container">
      {/* 总资产卡片 */}
      <div className="total-asset-card">
        <div className="total-asset-content">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span className="label">总资产</span>
            <button
              className="eye-button"
              onClick={toggleAmountVisibility}
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                padding: "4px",
                marginLeft: "8px",
                color: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showAmounts ? <EyeOutline /> : <EyeInvisibleOutline />}
            </button>
          </div>

          <div className="amount-section">
            <span className="amount">{formatCurrency(totalAssetValue)}</span>
          </div>
        </div>
      </div>

      {/* 资产分布图表 */}
      <Card title="资产分布" className="chart-card">
        <AssetPieChart height={180} />
      </Card>

      {/* 资产列表 */}
      <Card
        title={
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span>资产清单</span>
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: "1rem",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => navigate("/add-asset")}
            >
              <AddCircleOutline />
            </button>
          </div>
        }
        className="asset-list-card"
      >
        {assets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-text">还没有资产记录</div>
            <div className="empty-subtext">点击添加按钮创建您的第一个资产</div>
          </div>
        ) : (
          <div className="asset-cards-container">
            {assets
              .map((asset) => {
                const assetHoldings = getAssetHoldings(asset.id);
                const assetTotalValue = getAssetTotalValue(asset.id);
                return {
                  asset,
                  assetHoldings,
                  assetTotalValue,
                  actualRatio: getActualRatio(assetTotalValue),
                };
              })
              .sort((a, b) => b.assetTotalValue - a.assetTotalValue) // 按资产总金额从大到小排序
              .map(({ asset, assetHoldings, assetTotalValue, actualRatio }) => {
                return (
                  <Card
                    key={asset.id}
                    className="asset-card"
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    {/* 资产概览信息 */}
                    <div className="asset-overview">
                      <div className="asset-header">
                        <div className="asset-info">
                          <div className="asset-title-row">
                            <h3 style={{color: "#1677ff"}}>{asset.name}</h3>
                            <div className="progress-text">
                              <span
                                className="text-sm"
                                style={{
                                  fontWeight: "bold",
                                  color:
                                    actualRatio < (asset.targetRatio || 0)
                                      ? "#10b981"
                                      : "#DC2626",
                                }}
                              >
                                {actualRatio}%
                              </span>
                              <span className="text-sm"> / </span>
                              <span
                                className="text-sm"
                                style={{ fontWeight: "bold" }}
                              >
                                {asset.targetRatio}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="asset-amount">
                          <div className="amount">
                            {formatCurrency(assetTotalValue)}
                          </div>
                        </div>
                      </div>

                      {/* 进度条 */}
                      <div className="progress-section">
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${actualRatio}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 持仓列表 */}
                    {assetHoldings.length > 0 ? (
                      <div className="holdings-section">
                        <List className="holdings-list">
                          {assetHoldings.map((holding) => (
                            <List.Item
                              key={holding.id}
                              clickable
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/edit-holding/${holding.id}`);
                              }}
                              extra={
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "0.9rem",
                                    color: "#dc2626",
                                  }}
                                >
                                  {formatCurrency(holding.amount)}
                                </div>
                              }
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {holding.name}
                                </div>
                                {holding.code && (
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "#9ca3af",
                                    }}
                                  >
                                    {holding.code}
                                  </div>
                                )}
                              </div>
                            </List.Item>
                          ))}
                        </List>
                      </div>
                    ) : (
                      <div className="empty-holdings">
                        <div className="empty-text">暂无持仓</div>
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>
        )}
      </Card>

      {/* 悬浮设置按钮 */}
      <div
        style={{
          position: 'fixed',
          right: '1.5rem',
          bottom: '3rem', // 避免与底部导航重叠
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          backgroundColor: '#1677ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.2s ease'
        }}
        onClick={() => setSettingsVisible(true)}
      >
        <MoreOutline style={{ fontSize: '24px', color: 'white' }} />
      </div>

      {/* 设置操作菜单 */}
      <ActionSheet
        visible={settingsVisible}
        actions={settingsActions}
        onClose={() => setSettingsVisible(false)}
        onAction={handleSettingsAction}
      />

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default Home;
