import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, NavBar, Modal, Toast, List } from "antd-mobile";
import { EditSOutline, DeleteOutline, AddOutline } from "antd-mobile-icons";
import { useAppStore } from "../stores/useAppStore";
import "./AssetDetail.less";

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, holdings, deleteAsset, totalAssetValue } = useAppStore();

  const asset = assets.find((a) => a.id === id);
  const assetHoldings = holdings.filter((h) => h.assetId === id).sort((a, b) => b.amount - a.amount); // 按持仓金额从大到小排序

  if (!asset) {
    return (
      <div className="container-mobile">
        <NavBar onBack={() => navigate("/")}>资产详情</NavBar>
        <div className="page-padding flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">资产不存在</p>
            <Button
              color="primary"
              className="mt-4"
              onClick={() => navigate("/")}
            >
              返回首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 计算持仓总金额
  const totalHoldingValue = assetHoldings.reduce(
    (sum, holding) => sum + holding.amount,
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  // 计算实际占比
  const getActualRatio = () => {
    return totalAssetValue > 0
      ? Math.round((totalHoldingValue / totalAssetValue) * 100)
      : 0;
  };

  const actualRatio = getActualRatio();

  const handleDelete = async () => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除资产“${asset.name}”吗？此操作将同时删除所有相关持仓记录。`,
      confirmText: "删除",
      cancelText: "取消",
      onConfirm: async () => {
        try {
          await deleteAsset(asset.id);
          Toast.show("删除成功");
          navigate("/");
        } catch (error) {
          console.error("Error deleting asset:", error);
          Toast.show("删除失败，请重试");
        }
      },
    });
  };

  return (
    <div className="container-mobile">
      <NavBar
        onBack={() => navigate("/")}
        right={
          <>
            <Button
              size="middle"
              fill="none"
              onClick={() => navigate("/add-holding")}
            >
              <AddOutline />
            </Button>
            <Button
              fill="none"
              size="middle"
              onClick={() => navigate(`/edit-asset/${asset.id}`)}
              style={{ padding: "0 0.25rem" }}
            >
              <EditSOutline />
            </Button>
            <Button
              fill="none"
              size="middle"
              color="danger"
              onClick={handleDelete}
            >
              <DeleteOutline />
            </Button>
          </>
        }
      >
        资产详情
      </NavBar>

      <div className="page-padding" style={{paddingTop: 0}}>
        {/* 资产概览 */}
        <Card className="mb-4" style={{ backgroundColor: "#f9fafb" }}>
          <div className="text-center py-4">
            <span
              className="text-xl"
              style={{
                fontWeight: "bold",
                color: "#1f2937",
                marginRight: "1rem",
              }}
            >
              {asset.name}
            </span>
            <span
              className="text-lg"
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
            <span className="text-lg"> / </span>
            <span
              className="text-lg"
              style={{ fontWeight: "bold", color: "#3b82f6" }}
            >
              {asset.targetRatio}%
            </span>
            {asset.targetRatio && (
              <div className="mt-2">
                <div
                  className="flex items-center"
                  style={{ justifyContent: "space-evenly" }}
                ></div>
              </div>
            )}
          </div>
        </Card>

        {/* 持仓统计 */}
        <Card className="mb-4" style={{ backgroundColor: "#f9fafb" }}>
          <div className="text-center py-4">
            <div
              className="flex items-center"
              style={{ justifyContent: "space-evenly" }}
            >
              <div>
                <p className="text-sm text-gray-600 mb-1">持仓数量</p>
                <p
                  className="text-xl"
                  style={{ fontWeight: "bold", color: "#3B82F6" }}
                >
                  {assetHoldings.length}个
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">持仓总金额</p>
                <p
                  className="text-xl"
                  style={{ fontWeight: "bold", color: "#DC2626" }}
                >
                  {formatCurrency(totalHoldingValue)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 持仓列表 */}
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>持仓明细</span>
            </div>
          }
          className="mb-4"
          style={{ backgroundColor: "#f9fafb" }}
        >
          {assetHoldings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">还没有持仓记录</p>
              <Button
                color="primary"
                size="small"
                onClick={() => navigate("/add-holding")}
              >
                添加持仓
              </Button>
            </div>
          ) : (
            <List>
              {assetHoldings.map((holding) => (
                <List.Item
                  key={holding.id}
                  clickable
                  onClick={() => navigate(`/edit-holding/${holding.id}`)}
                  extra={
                    <div className="text-right">
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          color: "#DC2626",
                        }}
                      >
                        {formatCurrency(holding.amount)}
                      </div>
                    </div>
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bolder",
                        color: "#374151",
                        fontSize: "1rem",
                      }}
                    >
                      {holding.name}
                    </div>
                    {holding.code && (
                      <div className="text-sm text-gray-500">
                        {holding.code}
                      </div>
                    )}
                  </div>
                </List.Item>
              ))}
            </List>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AssetDetail;
