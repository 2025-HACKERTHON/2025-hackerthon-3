import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Vector from '../../assets/img/Vector 5.png'
import Menu2_img from '../../assets/img/image 5.png'
import QR from '../../assets/img/bx_qr.png'
import Language from '../../assets/img/flowbite_language-outline.png'
import Order_list from '../../assets/img/Frame 8.png'
import Shopping from '../../assets/img/Frame 258.png'
import Table from '../../assets/img/Frame 320.png'


const Menu2 = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(1);
  const [selected1, setSelected1] = useState(false);
  const [selected2, setSelected2] = useState(false);

  return (
    <div>
      <div className="Menu_wrap">
      <div className="Menu2_wrap">
         
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
          <h1>제육볶음 덮밥</h1>
          <p>10,000원</p>
        </div>
        <div className="Menu_detail">
          <img src={Menu2_img} alt="" />
          <p>매콤달콤하게 볶은 돼지고기 제육에<br />
          고소한 계란후라이까지.</p>
          <div className="detail_box">
            <button className={`detail_1 ${selected1 ? 'selected' : ''}`}
            onClick={() => setSelected1(!selected1)}>
           <p>일본인 인기 No.2 메뉴</p>
           </button>
          <button className={`detail_2 ${selected2 ? 'selected' : ''}`}
            onClick={() => setSelected2(!selected2)}>
            <p>덜 맵게 가능</p>
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

export default Menu2
