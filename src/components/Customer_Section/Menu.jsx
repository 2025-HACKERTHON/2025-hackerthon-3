// src/components/Customer_Section/Menu.jsx
import React, { useState, useEffect, useCallback } from 'react';
import qr from '../../assets/img/cus_menu/qr.svg';
import language from '../../assets/img/cus_menu/language.svg';
import main from '../../assets/img/cus_menu/main.png';
import header from '../../assets/img/cus_menu/header.png';
import cart from '../../assets/img/cus_menu/cart.svg';
import { Link } from 'react-router-dom';
import NumberSelector from './Menu_Table';

const Menu = () => {
  const [storeInfo, setStoreInfo] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 메뉴 카운트
  const [counts, setCounts] = useState({});
  const handlePlus = (menuId) =>
    setCounts((prev) => ({ ...prev, [menuId]: (prev[menuId] || 0) + 1 }));
  const handleMinus = (menuId) =>
    setCounts((prev) => ({ ...prev, [menuId]: Math.max(0, (prev[menuId] || 0) - 1) }));

  // ★ 테이블 저장 API 콜백
  const handleTableSelect = useCallback(async (tableId) => {
    try {
      const res = await fetch('https://www.taekyeong.shop/api/table-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, tableId }), // 필요 시 userId 조정
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`table-save 실패 (${res.status}) ${t}`);
      }
      const data = await res.json();
      console.log('[table-save 성공]', data);
    } catch (e) {
      console.error('[table-save 오류]', e);
    }
  }, []);

  // ★ NumberSelector 커스텀 이벤트 커버
  useEffect(() => {
    const onEvt = (e) => {
      const tid = e?.detail?.tableId ?? e?.detail;
      if (tid != null) handleTableSelect(tid);
    };
    window.addEventListener('table-select', onEvt);
    return () => window.removeEventListener('table-select', onEvt);
  }, [handleTableSelect]);

  // === 중요: menu_edit.jsx와 동일한 엔드포인트/스키마 사용 ===
  useEffect(() => {
    // menu_edit.jsx에서 현재 하드코딩된 사용자 ID가 '17'이므로 맞춰줌
    const userId = '17';

    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 캐시 버스트 쿼리로 최신값 강제
        const res = await fetch(`https://www.taekyeong.shop/api/store/${userId}?t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error(`API 호출 실패 (${res.status})`);
        const data = await res.json();

        // storeInfo 구조를 menu_edit.jsx와 동일하게 맞춤
        setStoreInfo({
          name: data.restaurantName || '',
          address: data.restaurantAddress || '',
          shortDescription: data.shortDescription || '',
          longDescription: data.longDescription || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
        });

        // 메뉴 배열: menu_edit.jsx는 data.menuList 사용
        if (Array.isArray(data.menuList)) {
          setMenus(data.menuList);
        } else {
          setMenus([]);
        }
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // 다른 탭에서 수정 후 돌아왔을 때 최신 반영 (옵션)
    const onFocus = () => fetchAllData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div id="Menu_wrap" className="container">
      <img src={main} alt="" className="main" />
      <header>
        <div className="header_icon">
          <Link to="/qr"><img src={qr} alt="" /></Link>
          <img src={language} alt="" />
        </div>
        <div className="header"><img src={header} alt="" /></div>
      </header>

      <main>
        {storeInfo && (
          <div className="store_info">
            <div className="store">RESTAURANT</div>
            <h1>{storeInfo.name}</h1>
            <p>{storeInfo.shortDescription}</p>
            <div
              className="text"
              dangerouslySetInnerHTML={{
                __html: (storeInfo.longDescription || '').replace(/\n/g, '<br />'),
              }}
            />
            <div className="map">{storeInfo.address}</div>
            <div className="tags">
              {storeInfo.tags.map((tag, i) => (
                <div key={`${tag}-${i}`} className="tag">{tag}</div>
              ))}
            </div>
          </div>
        )}

        <div className="menu">
          <h1 className="menu_text">메뉴 보기</h1>
          <div className="tags">
            <div id="select_tag" className="tag"><Link to="/">전체 메뉴</Link></div>
            <div className="tag"><Link to="/menu_best">베스트 메뉴</Link></div>
            <div className="tag"><Link to="/menu_language">언어 기반 메뉴 추천</Link></div>
            <div className="tag">비건 메뉴</div>
            <div className="tag">맵지 않은 메뉴</div>
          </div>

          <div className="menu_list">
            {menus.map((menu, idx) => (
              <div key={menu.id || idx}>
                <Link
                  to="/menu1"
                  state={{
                    menu: {
                      menuId: menu.id,
                      menuName: menu.nameKo,
                      shortDescription: menu.description,
                      longDescription: menu.description,
                      price: menu.price,
                      image: menu.imageUrl,
                    },
                  }}
                >
                  <div className={`menu_card menu${idx + 1}`}>
                    <div className="text">
                      <h1>{menu.nameKo}</h1>
                      <p>{menu.description}</p>
                      {/* 가격 노출 원하면 아래 주석 해제 */}
                      {/* <p className="price">{Number(menu.price).toLocaleString()}원</p> */}
                    </div>
                    <div className="order">
                      <button
                        className="order_btn"
                        onClick={(e) => e.preventDefault()}
                      >
                        주문
                      </button>
                      <div className="order_count">
                        <button
                          className="count_minus"
                          onClick={(e) => {
                            e.preventDefault();
                            handleMinus(menu.id);
                          }}
                        >
                          -
                        </button>
                        <div className="count">{counts[menu.id] || 0}</div>
                        <button
                          className="count_plus"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePlus(menu.id);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="icon">
        <Link to="/cus_order">
          <div id="icon" className="cart_icon">
            <div className="cart"><img src={cart} alt="" /></div>
          </div>
        </Link>

        <div id="icon" className="table_icon">
          {/* ★ 테이블 선택 시 자동 저장 */}
          <NumberSelector
            onChange={handleTableSelect}
            onSelect={handleTableSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default Menu;
