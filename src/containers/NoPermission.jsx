/**
 * 无权限页面
 */
import React from 'react';
import imgBg from 'src/resource/no-permisson.png'

const style = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  marginTop: '-200px',
  marginLeft: '-350px',
  width: '700px',
  height: '400px',
  textAlign: 'center',
}

function NoPermisson({ title, info }) {
  return (
    <div style={style}>
      <img src={imgBg} alt=""/>
      <h1 style={{marginBottom: '20px'}}>{title}</h1>
      <p>{info}</p>
    </div>
  )
}

export default NoPermisson;