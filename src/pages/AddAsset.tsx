import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Form, 
  Input, 
  Button, 
  NavBar,
  Toast
} from 'antd-mobile'
import { useAppStore } from '../stores/useAppStore'
import './AddAsset.less'

const AddAsset = () => {
  const navigate = useNavigate()
  const { addAsset } = useAppStore()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: {
    name: string
    targetRatio?: string
  }) => {
    setLoading(true)
    
    try {
      const assetData = {
        name: values.name,
        targetRatio: values.targetRatio ? parseInt(values.targetRatio) : undefined
      }

      await addAsset(assetData)
      Toast.show('资产添加成功')
      navigate('/')
    } catch (error) {
      console.error('Error adding asset:', error)
      Toast.show('添加失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-mobile">
      <NavBar onBack={() => navigate('/')}>
        添加资产
      </NavBar>

      <div className="page-padding">
        <Form
          onFinish={onFinish}
          footer={
            <Button 
              block 
              type="submit" 
              color="primary" 
              size="large"
              loading={loading}
            >
              添加资产
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

export default AddAsset