import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Vector from '../../assets/img/Vector 5.png';
import QR from '../../assets/img/bx_qr (1).png';
import VectorChoice from '../../assets/img/owner_menu_edit/Vector_language .png';
import QRadd from '../../assets/img/owner_menu_edit/Frame 17.png';
import Edit from '../../assets/img/owner_menu_edit/Frame 8.png';
import Vectorup from '../../assets/img/owner_menu_edit/Vector up .png';

const Menu_English = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 현재 경로에 따라 선택된 언어 이름을 반환하는 함수
  const getSelectedLang = () => {
    if (location.pathname.includes("english")) return "영어";
    if (location.pathname.includes("chinese")) return "중국어";
    if (location.pathname.includes("japanese")) return "일본어";
    return "영어";
  };

  // 언어 선택 드롭다운에서 언어를 클릭했을 때 호출되는 함수
  const handleLanguageSelect = (lang) => {
    if (lang === "영어") navigate("/menu_english");
    if (lang === "중국어") navigate("/menu_chinese");
    if (lang === "일본어") navigate("/menu_japanese");
    setShowLanguageMenu(false);
  };

  // 컴포넌트가 마운트되거나 location.state가 변경될 때 실행
  useEffect(() => {
    // 1. Menu_Edit에서 전달받은 state 데이터가 있는지 확인
    if (location.state && location.state.restaurantInfo && location.state.menuList) {
      setRestaurantInfo(location.state.restaurantInfo);
      setMenuList(location.state.menuList);
      setLoading(false);
    } else {
      // 2. 전달받은 state가 없는 경우 (예: 직접 URL로 접근), API 호출
      const userId = localStorage.getItem('userId') || '17'; // 로컬 스토리지에서 userId를 가져옴
      const lang = location.pathname.split('/').pop(); // URL에서 현재 언어 추출

      fetch(`http://3.38.135.47:8080/api/store/${userId}/settings/menu_info/lang/${lang}`)
        .then(res => res.json())
        .then(data => {
          setRestaurantInfo(data.restaurantInfo);
          setMenuList(data.menuList);
          setLoading(false);
        })
        .catch(err => {
          console.error("API 호출 실패:", err);
          setLoading(false);
        });
    }
  }, [location.state, location.pathname]); // location.state와 pathname이 변경될 때마다 재실행

  if (loading) {
    return <div>로딩 중...</div>;
  }
  
  // 데이터가 없을 경우 에러 메시지
  if (!restaurantInfo || !menuList) {
    return <div>데이터를 불러오는 데 실패했습니다.</div>;
  }

  return (
    <div>
      <div className="Menu_English_wrap">
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
            <p>No special features</p>
          )}
        </div>

        {/* 메뉴 목록 */}
        <div className="menu_edit">
          <div className="title">
            <p>{getSelectedLang()} 메뉴</p>
          </div>
          <div className="menu_box">
            {menuList.map(menu => (
              <div key={menu.id} className="menu_item">
                <button><img src={Edit} alt="편집" /></button>
                {/* 언어별 메뉴명과 설명 표시 */}
                <h3>{menu.nameEn || menu.nameKo}</h3>
                <h4>{menu.descriptionEn || menu.description}</h4>
                <p>{menu.price ? `${menu.price.toLocaleString()}원` : '가격 정보 없음'}</p>
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
    </div>
  );
};

export default Menu_English;