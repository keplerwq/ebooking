# 复制功能
  
```
<CopyTextToClipboard 
  text={`用户名: ${detail.username}\n密码: ${detail.password}`}
/>
<br/>
<CopyTextToClipboard 
  text={`用户名: ${detail.username}\n密码: ${detail.password}`}
  successCallback={() => message.success('复制成功, hahahah')}
>
  <a title="点击复制鉴权信息">自定义内容</a>
</CopyTextToClipboard>
```