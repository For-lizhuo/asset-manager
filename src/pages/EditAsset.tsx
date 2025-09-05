import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Form, 
  Input, 
  Button, 
  NavBar,
  Toast
} from 'antd-mobile'
import { useAppStore } from '../stores/useAppStore'

const EditAsset = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { assets, updateAsset } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const asset = assets.find(a => a.id === id)

  useEffect(() => {
    if (asset) {
      form.setFieldsValue({
        name: asset.name,
        targetRatio: asset.targetRatio?.toString() || ''
      })
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

  const onFinish = async (values: {
    name: string
    targetRatio?: string
  }) => {
    setLoading(true)
    
    try {
      const updateData = {
        name: values.name,
        targetRatio: values.targetRatio ? parseInt(values.targetRatio) : undefined
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
        </Form>
      </div>
    </div>
  )
}

export default EditAsset