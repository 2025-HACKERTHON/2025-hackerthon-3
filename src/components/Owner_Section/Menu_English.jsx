import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 추가
import Vector from '../../assets/img/Vector 5.png'
import QR from '../../assets/img/bx_qr (1).png'
import VectorChoice from '../../assets/img/owner_menu_edit/Vector_language .png'
import QRadd from '../../assets/img/owner_menu_edit/Frame 17.png'
import Edit from '../../assets/img/owner_menu_edit/Frame 8.png'
import Vectorup from '../../assets/img/owner_menu_edit/Vector up .png'

const Menu_English = () => {
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
      <div className="Menu_English_wrap">
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
          <h1>Han Greut</h1>
          <h2>A Warm Meal with Korean Friendship</h2>
          <p>
            A hot soup dish and rice that changes from season to season<br />
            It is a warm local restaurant that carefully serves a bowl.
          </p>
          <p>
            1st floor of Hana Building in Hongje 5-dong,<br />
            Seodaemun-gu, Seoul
          </p>
        </div>

        <div className="detail_box">
          <div className="detail1">
            <p>can control the spicy taste</p>
          </div>
          <div className="detail2">
            <p>can change vegan</p>
          </div>
        </div>

        <div className="menu_edit">
          <div className="title">
            <p>메뉴 편집</p>
          </div>
          <div className="menu_box">
            <div className="menu_1">
              <button><img src={Edit} alt="" /></button>
              <h3>Beef seaweed soup set</h3>
              <h4>
                Seaweed soup with soft beef and<br />
                thick soup + rice + 3 side dishes.<br />
                It's not spicy!
              </h4>
            </div>
            <div className="menu_2">
              <button><img src={Edit} alt="" /></button>
              <h3>Spicy Pork with Rice</h3>
              <h4>
                From spicy and sweet stir-fried<br />
                pork and savory fried eggs.
              </h4>
            </div>
            <div className="menu_3">
              <button><img src={Edit} alt="" /></button>
              <h3>Perilla oil bibimbap</h3>
              <h4>
                Korean vegetarian bibimbap mixed<br />
                with 5 kinds of herbs, rice, perilla<br />
                oil, and soy sauce.
              </h4>
            </div>
            <div className="menu_4">
              <button><img src={Edit} alt="" /></button>
              <h3>Seafood and Tofu Jjigae</h3>
              <h4>
                Soft tofu with a mild taste and<br />
                plenty of shrimp, squid, and clams.
              </h4>
            </div>
            <div className="menu_5">
              <button><img src={Edit} alt="" /></button>
              <h3>Kimchi pancake</h3>
              <h4>
                A simple brunch set that comes<br />
                with crispy kimchi pancake and<br />
                fresh citrus ade.
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

export default Menu_English;