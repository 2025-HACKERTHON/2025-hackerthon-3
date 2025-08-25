import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Vector from '../../assets/img/Vector 5.png';
import QR from '../../assets/img/bx_qr (1).png';
import VectorChoice from '../../assets/img/owner_menu_edit/Vector_language .png';
import QRadd from '../../assets/img/owner_menu_edit/Frame 17.png';
import Edit from '../../assets/img/owner_menu_edit/Frame 8.png';
import Vectorup from '../../assets/img/owner_menu_edit/Vector up .png';

const Menu_Japanese = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // 🔹 API 데이터 상태
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ API 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = 2; // 👉 실제 로그인한 userId로 교체 필요
        const response = await fetch(
          `https://www.taekyeong.shop/api/store/${userId}/settings/menu_info/lang/ja`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📌 API 응답:", data);

        setRestaurantInfo(data.restaurantInfo || {});
        setMenuList(data.menuList || []);
      } catch (err) {
        console.error("❌ API 호출 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSelectedLang = () => {
    if (location.pathname.includes("english")) return "영어";
    if (location.pathname.includes("chinese")) return "중국어";
    if (location.pathname.includes("japanese")) return "일본어";
    return "영어";
  };

  const handleLanguageSelect = (lang) => {
    if (lang === "영어") navigate("/menu_en");
    if (lang === "중국어") navigate("/menu_ch");
    if (lang === "일본어") navigate("/menu_ja");
    setShowLanguageMenu(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!restaurantInfo) {
    return <div>식당 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div>
      <div className="Menu_Japanese_wrap">
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
          <p>{getSelectedLang()} 메뉴</p>
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
                  className={getSelectedLang() === "영어" ? "active" : ""}
                >
                  영어
                </p>
                <p
                  onClick={() => handleLanguageSelect("중국어")}
                  className={getSelectedLang() === "중국어" ? "active" : ""}
                >
                  중국어
                </p>
                <p
                  onClick={() => handleLanguageSelect("일본어")}
                  className={getSelectedLang() === "일본어" ? "active" : ""}
                >
                  일본어
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 식당 정보 */}
        <div className="menu_name">
          <h1>{restaurantInfo.restaurantName || "이름 없음"}</h1>
          <h2>{restaurantInfo.shortDescription || ""}</h2>
          <p>{restaurantInfo.longDescription || ""}</p>
          <p>{restaurantInfo.restaurantAddress || ""}</p>
        </div>

        {/* 특징 */}
        <div className="detail_box">
          {restaurantInfo.features && restaurantInfo.features.length > 0 ? (
            restaurantInfo.features.map((feature, idx) => (
              <div key={idx} className={`detail${idx + 1}`}>
                <p>{typeof feature === "string" ? feature : feature.name}</p>
              </div>
            ))
          ) : (
            <p>特徴なし</p>
          )}
        </div>

        {/* 메뉴 리스트 */}
        <div className="menu_edit">
          <div className="title">
            <p>메뉴 편집</p>
          </div>
          <div className="menu_box">
            {menuList.length > 0 ? (
              menuList.map((menu) => (
                <div key={menu.id} className="menu_item">
                  <button>
                    <img src={Edit} alt="편집" />
                  </button>
                  <h3>{menu.nameKo || "메뉴 이름 없음"}</h3>
                  <h4>{menu.description || ""}</h4>
                  <p>{Number(menu.price).toLocaleString()}원</p>
                </div>
              ))
            ) : (
              <p>登録されたメニューがありません。</p>
            )}
          </div>
          <div className="bottom">
            <button onClick={() => navigate('/owner_qr')}>
              <img src={QRadd} alt="추가" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu_Japanese;
