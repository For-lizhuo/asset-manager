import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Form, 
  Input, 
  Button, 
  NavBar,
  Toast,
  Selector
} from 'antd-mobile'
import { useAppStore } from '../../stores'
import './index.less'

const AddHolding = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { addHolding, updateHolding, assets, holdings } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  
  // 判断是编辑模式还是添加模式
  const isEditMode = !!id
  const existingHolding = isEditMode ? holdings.find(h => h.id === id) : null
  
  // 将资产转换为选择器选项
  const assetOptions = assets.map(asset => ({
    label: asset.name,
    value: asset.id
  }))
  
  // 初始化表单数据
  useEffect(() => {
    if (isEditMode && existingHolding) {
      form.setFieldsValue({
        name: existingHolding.name,
        code: existingHolding.code || '',
        assetId: [existingHolding.assetId], // Selector需要数组格式
        amount: existingHolding.amount.toString()
      })
    }
  }, [isEditMode, existingHolding, form])
  
  // 如果是编辑模式但找不到持仓记录，显示错误
  if (isEditMode && !existingHolding) {
    return (
      <div className="container-mobile">
        <NavBar onBack={() => navigate('/')}>编辑持仓</NavBar>
        <div className="page-padding text-center py-8">
          <div className="text-gray-500 mb-4">
            持仓记录不存在
          </div>
          <Button 
            color="primary" 
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  const onFinish = async (values: {
    name: string
    code?: string
    assetId: string | string[]
    amount: string
  }) => {
    setLoading(true)
    
    try {
      // 处理 assetId，确保它是字符串
      const assetId = Array.isArray(values.assetId) 
        ? values.assetId[0] 
        : values.assetId
      
      if (!assetId) {
        Toast.show('请选择归属资产')
        return
      }
      
      const holdingData = {
        name: values.name,
        code: values.code || '',
        assetId: assetId,
        amount: parseFloat(values.amount)
      }

      if (isEditMode && existingHolding) {
        // 编辑模式：更新持仓
        await updateHolding(existingHolding.id, holdingData)
        Toast.show('持仓更新成功')
      } else {
        // 添加模式：新增持仓
        await addHolding(holdingData)
        Toast.show('持仓添加成功')
      }
      
      navigate('/')
    } catch (error) {
      console.error('Error saving holding:', error)
      Toast.show('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-mobile">
      <NavBar onBack={() => navigate('/')}>
        {isEditMode ? '编辑持仓' : '添加持仓'}
      </NavBar>

      <div className="page-padding">
        {!isEditMode && assets.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              您还没有创建任何资产
            </div>
            <Button 
              color="primary" 
              onClick={() => navigate('/add-asset')}
            >
              先添加资产
            </Button>
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
                {isEditMode ? '保存修改' : '添加持仓'}
              </Button>
            }
          >
            {/* 产品名称 */}
            <Form.Item
              name="name"
              label="产品名称"
              rules={[{ required: true, message: '请输入产品名称' }]}
            >
              <Input placeholder="请输入产品名称" />
            </Form.Item>

            {/* 产品代码 */}
            <Form.Item
              name="code"
              label="产品代码"
            >
              <Input placeholder="请输入产品代码（可选）" />
            </Form.Item>

            {/* 归属资产 */}
            <Form.Item
              name="assetId"
              label="归属资产"
              rules={[{ required: true, message: '请选择归属资产' }]}
            >
              <Selector
                options={assetOptions}
                columns={1}
                multiple={false}
              />
            </Form.Item>

            {/* 持仓金额 */}
            <Form.Item
              name="amount"
              label="持仓金额（元）"
              rules={[
                { required: true, message: '请输入持仓金额' },
                { 
                  pattern: /^\d+(\.\d{1,2})?$/, 
                  message: '请输入有效的金额' 
                }
              ]}
            >
              <Input 
                placeholder="请输入持仓金额" 
                type="number"
                step="0.01"
              />
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  )
}

export default AddHolding