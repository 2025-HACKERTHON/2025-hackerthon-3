import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Vector from '../../assets/img/Vector 5.png'
import QR from '../../assets/img/bx_qr (1).png'
import QRimg from '../../assets/img/owner_menu_edit/image 9.png'
import Save from '../../assets/img/owner_menu_edit/download .png'

const Owner_QR = () => {
    const navigate = useNavigate();

  return (
    <div>
      <div className="Owner_QR_wrap">
        <div className="nav">
                  <button className="vector" onClick={() => navigate(-1)}>
                    <img src={Vector} alt="뒤로가기" />
                  </button>
                  <div className="function">
                    <div className="function1">
                      <button onClick={() => navigate('/owner_qr')}>
                        <img src={QR} alt="QR 코드" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="Menu_name">
                          <h2>QR SCAN</h2>
                          <h1>QR을 스캔해주세요!</h1>
                        </div>
                        
                        <div className="Menu_detail">
                          <img src={QRimg} alt="" />
                          
                      </div>
                      <div className="save">
                            <button><img src={Save} alt="" /></button>
                            <p>QR 코드를 휴대폰 카메라로 찍으면<br />
                          EATO의 메뉴판으로 연결돼요.</p>
                        </div>

      </div>
    </div>
  )
}

export default Owner_QR
