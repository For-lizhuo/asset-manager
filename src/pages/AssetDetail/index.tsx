import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, NavBar, Modal, Toast, List } from "antd-mobile";
import { EditSOutline, DeleteOutline } from "antd-mobile-icons";
import { useAppStore } from "../../stores";
import "./index.less";

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, deleteAsset, totalAssetValue: globalTotalAssetValue } = useAppStore();

  const asset = assets.find((a) => a.id === id);

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

  // 计算资产总金额
  const assetTotalValue = asset.institutions.reduce(
    (sum, institution) => sum + institution.amount,
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
    return globalTotalAssetValue > 0
      ? Math.round((assetTotalValue / globalTotalAssetValue) * 100)
      : 0;
  };

  const actualRatio = getActualRatio();

  const handleDelete = async () => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除资产“${asset.name}”吗？此操作将同时删除所有相关机构记录。`,
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

        {/* 资产统计 */}
        <Card className="mb-4" style={{ backgroundColor: "#f9fafb" }}>
          <div className="text-center py-4">
            <div
              className="flex items-center"
              style={{ justifyContent: "space-evenly" }}
            >
              <div>
                <p className="text-sm text-gray-600 mb-1">机构数量</p>
                <p
                  className="text-xl"
                  style={{ fontWeight: "bold", color: "#3B82F6" }}
                >
                  {asset.institutions.length}个
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">资产总金额</p>
                <p
                  className="text-xl"
                  style={{ fontWeight: "bold", color: "#DC2626" }}
                >
                  {formatCurrency(assetTotalValue)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 机构列表 */}
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>机构明细</span>
            </div>
          }
          className="mb-4"
          style={{ backgroundColor: "#f9fafb" }}
        >
          {asset.institutions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">还没有机构记录</p>
            </div>
          ) : (
            <List>
              {asset.institutions.map((institution, index) => (
                <List.Item
                  key={index}
                  extra={
                    <div className="text-right">
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          color: "#DC2626",
                        }}
                      >
                        {formatCurrency(institution.amount)}
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
                      {institution.institution}
                    </div>
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