import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Vector from '../../assets/img/Vector 5.png';
import QR from '../../assets/img/bx_qr (1).png';
import VectorChoice from '../../assets/img/owner_menu_edit/Vector_language .png';
import QRadd from '../../assets/img/owner_menu_edit/Frame 17.png';
import Edit from '../../assets/img/owner_menu_edit/Frame 8.png';
import Vectorup from '../../assets/img/owner_menu_edit/Vector up .png';

const Menu_Chinese = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const storedUserId = localStorage.getItem('userId');
  // 🔹 API 상태
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [menuList, setMenuList] = useState([]);
  const [error, setError] = useState(null);

  // ✅ API 호출
  useEffect(() => {

    const userId = 2; // 👉 실제 userId로 교체 필요
    fetch(`https://www.taekyeong.shop/api/store/${userId}/settings/menu_info/lang/ch`)

      .then(res => {
        if (!res.ok) throw new Error("API 응답 에러: " + res.status);
        return res.json();
      })
      .then(data => {
        console.log("📌 API 응답:", data);

        // 응답 구조에 따라 분기
        if (data.restaurantInfo) {
          setRestaurantInfo(data.restaurantInfo);
          setMenuList(data.menuList || []);
        } else {
          // 만약 data 자체가 식당 정보라면
          setRestaurantInfo(data);
          setMenuList(data.menuList || []);
        }
      })
      .catch(err => {
        console.error("API 호출 실패:", err);
        setError(err.message);
      });
  }, []);

  // ✅ 언어 표시
  const getSelectedLang = () => {
    if (location.pathname.includes("english")) return "영어";
    if (location.pathname.includes("chinese")) return "중국어";
    if (location.pathname.includes("japanese")) return "일본어";
    return "영어";
  };

  // ✅ 언어 선택
  const handleLanguageSelect = (lang) => {
    if (lang === "영어") navigate("/menu_en");
    if (lang === "중국어") navigate("/menu_ch");
    if (lang === "일본어") navigate("/menu_ja");
    setShowLanguageMenu(false);
  };

  if (error) return <div>에러 발생: {error}</div>;
  if (!restaurantInfo) return <div>Loading...</div>;

  return (
    <div className="Menu_Chinese_wrap">
      {/* 상단 네비 */}
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

      {/* 언어 선택 */}
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

      {/* 식당 정보 */}
      <div className="menu_name">
        <h1>{restaurantInfo.restaurantName}</h1>
        <h2>{restaurantInfo.shortDescription}</h2>
        <p>{restaurantInfo.longDescription}</p>
        <p>{restaurantInfo.restaurantAddress}</p>
      </div>

      {/* 특징 */}
      <div className="detail_box">
        {restaurantInfo.features && restaurantInfo.features.length > 0 ? (
          restaurantInfo.features.map((feature, idx) => (
            <div key={idx} className={`detail${idx+1}`}>
              <p>{feature}</p>
            </div>
          ))
        ) : (
          <p>没有特别的特点</p>
        )}
      </div>

      {/* 메뉴 리스트 */}
      <div className="menu_edit">
        <div className="title">
          <p>메뉴 편집</p>
        </div>
        <div className="menu_box">
          {menuList.map(menu => (
            <div key={menu.menuId} className="menu_item">
              <button><img src={Edit} alt="편집" /></button>
              <h3>{menu.nameKo}</h3>
              <h4>{menu.description}</h4>
              <p>{menu.price?.toLocaleString()}원</p>
            </div>
          ))}
        </div>
        <div className="bottom">
          <button onClick={() => navigate('/owner_qr')}>
            <img src={QRadd} alt="추가" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu_Chinese;
