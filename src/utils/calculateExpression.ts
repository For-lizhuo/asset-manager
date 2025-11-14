/**
 * 计算数学表达式
 * @param expression 数学表达式字符串，如 "110+220"
 * @returns 计算结果或null（如果表达式无效）
 */
export const calculateExpression = (expression: string): number | null => {
  // 移除所有空格
  const cleanedExpression = expression.replace(/\s/g, '');
  
  // 检查是否以等号结尾
  if (cleanedExpression.endsWith('=')) {
    const exprWithoutEquals = cleanedExpression.slice(0, -1);
    
    // 验证表达式是否只包含数字、小数点和基本运算符
    if (!/^[\d.+*/-]+$/.test(exprWithoutEquals)) {
      return null;
    }
    
    try {
      // 使用Function构造器安全地计算表达式（比eval更安全）
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${exprWithoutEquals}`)();
      
      // 检查结果是否为有效数字
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return Math.round(result * 100) / 100; // 保留两位小数
      }
    } catch {
      // 表达式计算出错
      return null;
    }
  }
  
  return null;
};