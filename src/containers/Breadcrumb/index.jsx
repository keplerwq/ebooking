
import React from 'react';
import { NavLink } from 'react-router-dom';
import arrowIcon from 'src/resource/img/arrow.png';
import './style.scss';

export default function Breadcrumb(props) {

  let { nav = {} , onClick} = props;

  return ( 
  
    <div className="g-menu-title"  >
      <div className="menu-title-bread ant-menu-item-selected">
        {
          onClick ? 
            <span onClick={onClick}>
              <img src={arrowIcon} alt=""/> {nav.title} 
            </span>
            :
            <NavLink to={nav.key}>
              <img src={arrowIcon} alt=""/> {nav.title} 
            </NavLink>
        }
        <label> > </label>
        <span> { nav.name } </span>
      </div>
    </div>
  )
}
