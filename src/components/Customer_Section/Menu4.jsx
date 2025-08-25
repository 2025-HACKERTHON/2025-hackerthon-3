import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Vector from '../../assets/img/Vector 5.png'
import Menu4_img from '../../assets/img/image 7.png'
import QR from '../../assets/img/bx_qr.png'
import Language from '../../assets/img/flowbite_language-outline.png'
import Order_list from '../../assets/img/Frame 8.png'
import Shopping from '../../assets/img/Frame 258.png'
import Table from '../../assets/img/Frame 320.png'


const Menu4 = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(1);
  const [selected1, setSelected1] = useState(false);
  const [selected2, setSelected2] = useState(false);

  return (
    <div>
      <div className="Menu_wrap">
      <div className="Menu4_wrap">
         
        <div className="nav">
         <button className="vector" onClick={() => navigate(-1)}>
          <img src={Vector} alt="뒤로가기" />
          </button>

          <div className="function">
            <div className="function1">
              <button onClick={() => navigate('/qr')}>
              <img src={QR} alt="QR 코드" />
              </button>
            </div>
            <div className="function2">
              <button><img src={Language} alt="" /></button>
            </div>
          </div>
        </div>
        <div className="Menu_name">
          <h2>MENU</h2>
          <h1>해물순두부찌개</h1>
          <p>13,000원</p>
        </div>
        <div className="Menu_detail">
          <img src={Menu4_img} alt="" />
          <p>순한 맛의 순두부에 새우, 오징어,<br />
            바지락이 푸짐하게.</p>
          <div className="detail_box">
            <button className={`detail_1 ${selected1 ? 'selected' : ''}`}
            onClick={() => setSelected1(!selected1)}>
           <p>덜 맵게 가능</p>
           </button>
          <button className={`detail_2 ${selected2 ? 'selected' : ''}`}
            onClick={() => setSelected2(!selected2)}>
            <p>비건 변경 가능</p>
          </button>
          </div>

          <div className="quantity">
            <div className="quantity_count">
            <span>개수</span>
            <div>
              <button onClick={() => count > 1 && setCount(count - 1)}>-</button>
              <span>{count}</span>
              <button onClick={() => setCount(count + 1)}>+</button>
              </div>
            </div>
            <div className="order_list">
              <button><img src={Order_list} alt="" /></button>
            </div></div>
        </div>
        
        <div className="shop">
          <button><img src={Table} alt="" /></button>
        </div>

        <div className="shopping">
          <button><img src={Shopping} alt="" /></button>
        </div>

        
      </div>
    </div>
    </div>
  )
}

export default Menu4
