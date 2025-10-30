import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  NavBar,
  Toast,
  Selector,
  Modal,
  List,
  Picker,
} from "antd-mobile";
import { DeleteOutline, AddOutline } from "antd-mobile-icons";
import { useAppStore } from "../../stores";
import "./index.less";

// 定义机构明细的接口
interface InstitutionDetail {
  id: string;
  institution: string;
  amount: string;
}

// 定义支持的机构选项
const institutionOptions = [
  { label: "东方财富", value: "东方财富" },
  { label: "支付宝", value: "支付宝" },
  { label: "京东金融", value: "京东金融" },
  { label: "天天基金", value: "天天基金" },
  { label: "微信零钱", value: "微信零钱" },
  {
    label: "招商银行",
    value: "招商银行",
  },
  {
    label: "建设银行",
    value: "建设银行",
  },
  {
    label: "中国银行",
    value: "中国银行",
  },
];

const AddHolding = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addHolding, updateHolding, deleteHolding, assets, holdings } =
    useAppStore();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [institutionDetails, setInstitutionDetails] = useState<
    InstitutionDetail[]
  >([{ id: Date.now().toString(), institution: "", amount: "" }]);

  // 判断是编辑模式还是添加模式
  const isEditMode = !!id;
  const existingHolding = isEditMode ? holdings.find((h) => h.id === id) : null;

  // 将资产转换为选择器选项
  const assetOptions = assets.map((asset) => ({
    label: asset.name,
    value: asset.id,
  }));

  // 计算总金额
  const calculateTotalAmount = () => {
    return institutionDetails
      .reduce((total, detail) => {
        const amount = parseFloat(detail.amount) || 0;
        return total + amount;
      }, 0)
      .toFixed(2);
  };

  // 初始化表单数据
  useEffect(() => {
    if (isEditMode && existingHolding) {
      form.setFieldsValue({
        name: existingHolding.name,
        code: existingHolding.code || "",
        assetId: [existingHolding.assetId], // Selector需要数组格式
      });

      // 初始化机构明细数据
      if (
        existingHolding.institutionDetails &&
        existingHolding.institutionDetails.length > 0
      ) {
        const detailsWithId = existingHolding.institutionDetails.map(
          (detail, index) => ({
            id: `detail_${index}_${Date.now()}`,
            institution: detail.institution,
            amount: detail.amount.toString(),
          })
        );
        setInstitutionDetails(detailsWithId);
      }
    }
  }, [isEditMode, existingHolding, form]);

  // 如果是编辑模式但找不到持仓记录，显示错误
  if (isEditMode && !existingHolding) {
    return (
      <div className="container-mobile">
        <NavBar onBack={() => navigate(-1)}>编辑持仓</NavBar>
        <div className="page-padding text-center py-8">
          <div className="text-gray-500 mb-4">持仓记录不存在</div>
          <Button color="primary" onClick={() => navigate(-1)}>
            返回上页
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!existingHolding) return;

    Modal.confirm({
      title: "确认删除",
      content: `确定要删除持仓"${existingHolding.name}"吗？`,
      confirmText: "删除",
      cancelText: "取消",
      onConfirm: async () => {
        try {
          await deleteHolding(existingHolding.id);
          Toast.show("删除成功");
          navigate(-1);
        } catch (error) {
          console.error("Error deleting holding:", error);
          Toast.show("删除失败，请重试");
        }
      },
    });
  };

  // 添加新的机构明细
  const addInstitutionDetail = () => {
    setInstitutionDetails([
      ...institutionDetails,
      { id: Date.now().toString(), institution: "", amount: "" },
    ]);
  };

  // 删除机构明细
  const removeInstitutionDetail = (id: string) => {
    if (institutionDetails.length <= 1) {
      Toast.show("至少需要保留一个机构明细");
      return;
    }
    setInstitutionDetails(
      institutionDetails.filter((detail) => detail.id !== id)
    );
  };

  // 更新机构明细
  const updateInstitutionDetail = (
    id: string,
    field: keyof InstitutionDetail,
    value: string
  ) => {
    setInstitutionDetails(
      institutionDetails.map((detail) =>
        detail.id === id ? { ...detail, [field]: value } : detail
      )
    );
  };

  const onFinish = async (values: {
    name: string;
    code?: string;
    assetId: string | string[];
  }) => {
    setLoading(true);

    try {
      // 验证机构明细
      if (
        institutionDetails.some(
          (detail) => !detail.institution.trim() || !detail.amount.trim()
        )
      ) {
        Toast.show("请填写完整的机构明细信息");
        return;
      }

      // 验证金额格式
      if (
        institutionDetails.some(
          (detail) =>
            isNaN(parseFloat(detail.amount)) || parseFloat(detail.amount) <= 0
        )
      ) {
        Toast.show("请输入有效的金额");
        return;
      }

      // 处理 assetId，确保它是字符串
      const assetId = Array.isArray(values.assetId)
        ? values.assetId[0]
        : values.assetId;

      if (!assetId) {
        Toast.show("请选择归属资产");
        return;
      }

      // 计算总金额
      const totalAmount = institutionDetails.reduce((total, detail) => {
        return total + parseFloat(detail.amount);
      }, 0);

      // 转换机构明细数据格式
      const formattedInstitutionDetails = institutionDetails.map((detail) => ({
        institution: detail.institution,
        amount: parseFloat(detail.amount),
      }));

      const holdingData = {
        name: values.name,
        code: values.code || "",
        assetId: assetId,
        amount: totalAmount,
        institutionDetails: formattedInstitutionDetails,
      };

      if (isEditMode && existingHolding) {
        // 编辑模式：更新持仓
        await updateHolding(existingHolding.id, holdingData);
        Toast.show("持仓更新成功");
      } else {
        // 添加模式：新增持仓
        await addHolding(holdingData);
        Toast.show("持仓添加成功");
      }

      navigate(-1);
    } catch (error) {
      console.error("Error saving holding:", error);
      Toast.show("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-mobile add-holding-page">
      <NavBar
        onBack={() => navigate(-1)}
        right={
          isEditMode && existingHolding ? (
            <Button
              fill="none"
              size="middle"
              color="danger"
              onClick={handleDelete}
            >
              <DeleteOutline />
            </Button>
          ) : undefined
        }
      >
        {isEditMode ? "编辑持仓" : "添加持仓"}
      </NavBar>

      <div className="page-padding">
        {!isEditMode && assets.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">您还没有创建任何资产</div>
            <div className="flex gap-2">
              <Button fill="outline" onClick={() => navigate(-1)}>
                返回上页
              </Button>
              <Button color="primary" onClick={() => navigate("/add-asset")}>
                先添加资产
              </Button>
            </div>
          </div>
        ) : (
          <Form
            form={form}
            onFinish={onFinish}
            footer={
              <Button
                block
                type="submit"
                color="primary"
                size="large"
                loading={loading}
              >
                {isEditMode ? "保存修改" : "添加持仓"}
              </Button>
            }
          >
            {/* 产品名称 */}
            <Form.Item
              name="name"
              label="产品名称"
              rules={[{ required: true, message: "请输入产品名称" }]}
            >
              <Input placeholder="请输入产品名称" />
            </Form.Item>

            {/* 产品代码 */}
            <Form.Item name="code" label="产品代码">
              <Input placeholder="请输入产品代码（可选）" />
            </Form.Item>

            {/* 归属资产 */}
            <Form.Item
              name="assetId"
              label="归属资产"
              rules={[{ required: true, message: "请选择归属资产" }]}
            >
              <Selector options={assetOptions} columns={1} multiple={false} />
            </Form.Item>

            {/* 总金额显示 */}
            <div className="total-amount">
              <span>总金额: ¥{calculateTotalAmount()}</span>
            </div>

            {/* 分布明细 */}
            <Form.Item label="分布明细" required>
              <div className="institution-details-section">
                {institutionDetails.map((detail) => (
                  <div key={detail.id} className="institution-detail-item">
                    <List>
                      <List.Item
                        description={
                          <div className="detail-inputs">
                            <div className="input-group">
                              <label>机构</label>
                              <Picker
                                columns={[institutionOptions]}
                                value={[detail.institution]}
                                onConfirm={(value) =>
                                  updateInstitutionDetail(
                                    detail.id,
                                    "institution",
                                    String(value[0] || "")
                                  )
                                }
                              >
                                {(_, actions) => (
                                  <Button onClick={actions.open} size="small">
                                    {detail.institution || "请选择机构"}
                                  </Button>
                                )}
                              </Picker>
                            </div>
                            <div className="input-group">
                              <label>金额</label>
                              <Input
                                placeholder="请输入金额"
                                type="number"
                                value={detail.amount}
                                onChange={(value) =>
                                  updateInstitutionDetail(
                                    detail.id,
                                    "amount",
                                    value
                                  )
                                }
                              />
                            </div>
                          </div>
                        }
                        extra={
                          <Button
                            fill="none"
                            size="small"
                            color="danger"
                            onClick={() => removeInstitutionDetail(detail.id)}
                            className="remove-btn"
                          >
                            删除
                          </Button>
                        }
                      />
                    </List>
                  </div>
                ))}

                {/* 添加按钮移到底部 */}
                <div className="add-button-container">
                  <Button
                    size="small"
                    fill="none"
                    onClick={addInstitutionDetail}
                    block
                  >
                    <AddOutline /> 添加机构明细
                  </Button>
                </div>
              </div>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
};

export default AddHolding;
