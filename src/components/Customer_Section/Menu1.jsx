import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Vector from '../../assets/img/Vector 5.png';
import QR from '../../assets/img/bx_qr.png';
import Language from '../../assets/img/flowbite_language-outline.png';
import Order_list from '../../assets/img/Frame 8.png';
import Shopping from '../../assets/img/Frame 258.png';
import NumberSelector from './Menu_Table'
import { Link } from 'react-router-dom'

const Menu1 = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { menu } = location.state || {};

    const [counts, setCounts] = useState({});
    const [selected1, setSelected1] = useState(false);
    const [selected2, setSelected2] = useState(false);
    const handlePlus = (menuId) => {
        setCounts(prev => ({ ...prev, [menuId]: (prev[menuId] || 0) + 1 }));
    };
    const handleMinus = (menuId) => {
        setCounts(prev => ({ ...prev, [menuId]: Math.max(0, (prev[menuId] || 0) - 1) }));
    };

    if (!menu) {
        return <div>메뉴 정보를 불러올 수 없습니다.</div>;
    }

    return (
        <div>
            <div className="Menu_wrap">
                <div className="Menu1_wrap">
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
                        <h1>{menu.menuName}</h1>
                        <p>{menu.price}원</p>
                    </div>
                    <div className="Menu_detail">
                        {/* menu.image 값이 있을 때만 <img> 태그를 렌더링합니다. */}
                        {menu.image && <img src={menu.image} alt={menu.menuName} />}
                        <p>{menu.longDescription}</p>
                        <div className="detail_box">
                            <button
                                className={`detail_1 ${selected1 ? 'selected' : ''}`}
                                onClick={() => setSelected1(!selected1)}
                            >
                                <p>일본인 인기 No.1 메뉴</p>
                            </button>
                            <button
                                className={`detail_2 ${selected2 ? 'selected' : ''}`}
                                onClick={() => setSelected2(!selected2)}
                            >
                                <p>비건 변경 가능</p>
                            </button>
                        </div>
                        <div className="quantity">
                            <div className="quantity_count">
                                <span>개수</span>
                                <div>
                                    <button className="count_minus" onClick={(e) => { e.preventDefault(); handleMinus(menu.id); }}>-</button>
                                    <div className="count">{counts[menu.id] || 0}</div>
                                    <button className="count_plus" onClick={(e) => { e.preventDefault(); handlePlus(menu.id); }}>+</button>
                                </div>
                            </div>
                            <div className="order_list" onClick={(e) => e.preventDefault()}>
                                <button><img src={Order_list} alt="" /></button>
                            </div>
                        </div>
                    </div>
                    <div className="shop">
                        <button>
                        <NumberSelector /></button>
                    </div>
                    <div className="shopping">
                      <Link to='/cus_order'>
                        <button><img src={Shopping} alt="" /></button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Menu1;