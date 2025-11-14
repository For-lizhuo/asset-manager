import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Form, 
  Input, 
  Button, 
  NavBar,
  Toast,
  List,
  Picker
} from 'antd-mobile'
import { AddOutline } from 'antd-mobile-icons'
import { useAppStore } from '../../stores'
import { calculateExpression } from '../../utils/calculateExpression'
import './index.less'

// 定义机构明细的接口
interface InstitutionDetail {
  id: string
  institution: string
  amount: string
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
]

const EditAsset = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { assets, updateAsset } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [institutionDetails, setInstitutionDetails] = useState<InstitutionDetail[]>([])

  const asset = assets.find(a => a.id === id)

  useEffect(() => {
    if (asset) {
      form.setFieldsValue({
        name: asset.name,
        targetRatio: asset.targetRatio?.toString() || ''
      })
      
      // 初始化机构明细数据
      const detailsWithId = asset.institutions.map((institution, index) => ({
        id: `detail_${index}_${Date.now()}`,
        institution: institution.institution,
        amount: institution.amount.toString(),
      }))
      setInstitutionDetails(detailsWithId)
    }
  }, [asset, form])

  if (!asset) {
    return (
      <div className="container-mobile">
        <NavBar onBack={() => navigate(`/assets/${id}`)}>
          编辑资产
        </NavBar>
        <div className="page-padding flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">资产不存在</p>
            <Button 
              color="primary" 
              className="mt-4"
              onClick={() => navigate('/')}
            >
              返回首页
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 添加新的机构明细
  const addInstitutionDetail = () => {
    setInstitutionDetails([
      ...institutionDetails,
      { id: Date.now().toString(), institution: "", amount: "" }
    ])
  }

  // 删除机构明细
  const removeInstitutionDetail = (id: string) => {
    if (institutionDetails.length <= 1) {
      Toast.show("至少需要保留一个机构明细")
      return
    }
    setInstitutionDetails(
      institutionDetails.filter((detail) => detail.id !== id)
    )
  }

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
    )
  }

  // 处理金额输入框的变化，支持实时运算
  const handleAmountChange = (
    id: string,
    value: string
  ) => {
    // 检查是否需要计算表达式
    const calculationResult = calculateExpression(value);
    if (calculationResult !== null) {
      // 如果表达式有效，更新为计算结果
      updateInstitutionDetail(id, "amount", calculationResult.toString());
    } else {
      // 否则，正常更新输入值
      updateInstitutionDetail(id, "amount", value);
    }
  }

  const onFinish = async (values: {
    name: string
    targetRatio?: string
  }) => {
    setLoading(true)
    
    try {
      // 验证机构明细
      if (
        institutionDetails.some(
          (detail) => !detail.institution.trim() || !detail.amount.trim()
        )
      ) {
        Toast.show("请填写完整的机构明细信息")
        return
      }

      // 验证金额格式
      if (
        institutionDetails.some(
          (detail) =>
            isNaN(parseFloat(detail.amount)) || parseFloat(detail.amount) <= 0
        )
      ) {
        Toast.show("请输入有效的金额")
        return
      }

      // 转换机构明细数据格式
      const formattedInstitutionDetails = institutionDetails.map((detail) => ({
        institution: detail.institution,
        amount: parseFloat(detail.amount),
      }))

      const updateData = {
        name: values.name,
        targetRatio: values.targetRatio ? parseInt(values.targetRatio) : undefined,
        institutions: formattedInstitutionDetails
      }

      await updateAsset(asset.id, updateData)
      Toast.show('资产更新成功')
      navigate(`/assets/${asset.id}`)
    } catch (error) {
      console.error('Error updating asset:', error)
      Toast.show('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-mobile">
      <NavBar onBack={() => navigate(`/assets/${asset.id}`)}>
        编辑资产
      </NavBar>

      <div className="page-padding">
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
              保存修改
            </Button>
          }
        >
          {/* 资产名称 */}
          <Form.Item
            name="name"
            label="资产名称"
            rules={[{ required: true, message: '请输入资产名称' }]}
          >
            <Input placeholder="请输入资产名称" />
          </Form.Item>

          {/* 目标占比 */}
          <Form.Item
            name="targetRatio"
            label="目标占比（%）"
            rules={[
              { 
                pattern: /^[1-9]\d*$|^0$/, 
                message: '请输入有效的整数' 
              }
            ]}
          >
            <Input 
              placeholder="请输入目标占比（可选）" 
              type="number"
            />
          </Form.Item>

          {/* 机构明细 */}
          <Form.Item label="机构明细" required>
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
                              type="text" // 改为text类型以支持表达式输入
                              value={detail.amount}
                              onChange={(value) =>
                                handleAmountChange(
                                  detail.id,
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

              {/* 添加按钮 */}
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
      </div>
    </div>
  )
}

export default EditAsset