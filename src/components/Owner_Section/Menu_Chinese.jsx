import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 추가
import Vector from '../../assets/img/Vector 5.png'
import QR from '../../assets/img/bx_qr (1).png'
import VectorChoice from '../../assets/img/owner_menu_edit/Vector_language .png'
import QRadd from '../../assets/img/owner_menu_edit/Frame 17.png'
import Edit from '../../assets/img/owner_menu_edit/Frame 8.png'
import Vectorup from '../../assets/img/owner_menu_edit/Vector up .png'

const Menu_Chinese = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const getSelectedLang = () => {
    if (location.pathname.includes("english")) return "영어";
    if (location.pathname.includes("chinese")) return "중국어";
    if (location.pathname.includes("japanese")) return "일본어";
    return "영어";
  };

  const handleLanguageSelect = (lang) => {
    if (lang === "영어") navigate("/owner/menu_english");
    if (lang === "중국어") navigate("/owner/menu_chinese");
    if (lang === "일본어") navigate("/owner/menu_japanese");

    setShowLanguageMenu(false);
  };

  return (
    <div>
      <div className="Menu_Chinese_wrap">
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

        <div className="language_bar">
          <p>{getSelectedLang()}메뉴</p>
          <div className="language_choice">
             <button onClick={() => setShowLanguageMenu(!showLanguageMenu)}>
                {showLanguageMenu ? (
                <img src={Vectorup} alt="언어 선택 닫기" />
                ) : (
                <img src={VectorChoice} alt="언어 선택" />
                )}
            </button>
            {showLanguageMenu && (
              <div className="language_dropdown">
                <p
                  onClick={() => handleLanguageSelect("영어")}
                  className={getSelectedLang() === "영어" ? "active" : ""}>
                  영어
                </p>
                <p
                  onClick={() => handleLanguageSelect("중국어")}
                  className={getSelectedLang() === "중국어" ? "active" : ""}>
                  중국어
                </p>
                <p
                  onClick={() => handleLanguageSelect("일본어")}
                  className={getSelectedLang() === "일본어" ? "active" : ""}>
                  일본어
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="menu_name">
          <h1>韩格鲁特</h1>
          <h2>与韩国友谊共度的温馨餐点</h2>
          <p>
            一道热腾腾的汤品和随着季节变化的米饭<br />
            这是一家温馨的当地餐厅，精心端上一碗。</p>
          <p>
            首尔西大门区洪杰5洞汉娜大楼一楼</p>
        </div>

        <div className="detail_box">
          <div className="detail1">
            <p>可以控制辣味</p>
          </div>
          <div className="detail2">
            <p>可以改变素食者</p>
          </div>
        </div>

        <div className="menu_edit">
          <div className="title">
            <p>메뉴 편집</p>
          </div>
          <div className="menu_box">
            <div className="menu_1">
              <button><img src={Edit} alt="" /></button>
              <h3>牛肉海藻汤品套装</h3>
              <h4>
                海藻汤配软牛肉和浓汤+米饭+三道<br />
                小菜。 它不辣！
              </h4>
            </div>
            <div className="menu_2">
              <button><img src={Edit} alt="" /></button>
              <h3>麻辣猪肉配米饭</h3>
              <h4>
                从辛辣甜美的炒猪肉到美味的煎<br />
                蛋。
              </h4>
            </div>
            <div className="menu_3">
              <button><img src={Edit} alt="" /></button>
              <h3>紫苏油拌饭</h3>
              <h4>
                韩国素食石锅拌饭，混合了五种草<br />
                药、大米、紫苏油和酱油。
              </h4>
            </div>
            <div className="menu_4">
              <button><img src={Edit} alt="" /></button>
              <h3>海鲜和豆腐鸡块</h3>
              <h4>
                味道温和的软豆腐，富含虾、鱿鱼<br />
                和蛤蜊。
              </h4>
            </div>
            <div className="menu_5">
              <button><img src={Edit} alt="" /></button>
              <h3>辛奇煎饼</h3>
              <h4>
                一套简单的早午餐套餐，配有脆脆的<br />
                辛奇煎饼和新鲜的柑橘类水果。
              </h4>
            </div>
          </div>
          <div className="bottom">
            <button onClick={() => navigate('/owner_qr')}>
              <img src={QRadd} alt="" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu_Chinese;