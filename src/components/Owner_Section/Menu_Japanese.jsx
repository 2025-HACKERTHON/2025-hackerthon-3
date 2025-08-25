import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 추가
import Vector from '../../assets/img/Vector 5.png'
import QR from '../../assets/img/bx_qr (1).png'
import VectorChoice from '../../assets/img/owner_menu_edit/Vector_language .png'
import QRadd from '../../assets/img/owner_menu_edit/Frame 17.png'
import Edit from '../../assets/img/owner_menu_edit/Frame 8.png'
import Vectorup from '../../assets/img/owner_menu_edit/Vector up .png'

const Menu_Japanese = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);


  // 🔹 API 데이터 상태
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [menuList, setMenuList] = useState([]);

  // ✅ API 호출
  useEffect(() => {

    const userId = 2; // 👉 실제 로그인한 userId로 바꿔주세요
    fetch(`https://www.taekyeong.shop/api/store/${userId}/settings/menu_info/lang/ja`)

      .then(res => res.json())
      .then(data => {
        setRestaurantInfo(data.restaurantInfo);
        setMenuList(data.menuList);
      })
      .catch(err => console.error("API 호출 실패:", err));
  }, []);


  const getSelectedLang = () => {
    if (location.pathname.includes("english")) return "영어";
    if (location.pathname.includes("chinese")) return "중국어";
    if (location.pathname.includes("japanese")) return "일본어";
    return "영어";
  };

  const handleLanguageSelect = (lang) => {
    if (lang === "영어") navigate("/owner/menu_english");
    if (lang === "중국어") navigate("/owner/menu_chinese");
    if (lang === "일본어") navigate("owner/menu_japanese");

    setShowLanguageMenu(false);
  };

  return (
    <div>
      <div className="Menu_Japanese_wrap">
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
          <h1>一杯</h1>
          <h2>温かい食事と韓国の友情があります</h2>
          <p>
            季節ごとに変わる温かいスープ料理とご飯です<br />
            ボウルを丁寧に提供する温かい地元のレストランです。</p>
          <p>
            ソウル特別市西大門区弘済5洞ハナビル1階</p>
        </div>

        <div className="detail_box">
          <div className="detail1">
            <p>辛さを抑えることができます</p>
          </div>
          <div className="detail2">
            <p>ビーガンを変えることができます</p>
          </div>
        </div>

        <div className="menu_edit">
          <div className="title">
            <p>메뉴 편집</p>
          </div>
          <div className="menu_box">
            <div className="menu_1">
              <button><img src={Edit} alt="" /></button>
              <h3>牛わかめスープセット</h3>
              <h4>
                わかめスープに牛肉と濃いスープ<br />
                +ご飯+おかず3つです。 辛くないで<br />
                す！
              </h4>
            </div>
            <div className="menu_2">
              <button><img src={Edit} alt="" /></button>
              <h3>豚肉ライススパイシー</h3>
              <h4>
                豚肉の辛く甘い炒め物と香ばしい目<br />
                玉焼きです。
              </h4>
            </div>
            <div className="menu_3">
              <button><img src={Edit} alt="" /></button>
              <h3>エゴマ油ビビンバ</h3>
              <h4>
                韓国のベジタリアンビビンバは、<br />
                ハーブ、ご飯、エゴマ油、醤油の5<br />
                種類を混ぜて食べます。
              </h4>
            </div>
            <div className="menu_4">
              <button><img src={Edit} alt="" /></button>
              <h3>海鮮豆腐チゲ</h3>
              <h4>
                まろやかな味のスンドゥブと、エ <br />
                ビ、イカ、アサリがたっぷり入って<br />
                います。
              </h4>
            </div>
            <div className="menu_5">
              <button><img src={Edit} alt="" /></button>
              <h3>キムチチヂミ</h3>
              <h4>
                サクサクしたキムチチヂミと新鮮な<br />
                柑橘類のエイドが一緒に提供される<br />
                シンプルなブランチセットです。
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

export default Menu_Japanese;