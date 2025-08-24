// src/components/Customer_Section/Cus_order.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import back_btn from '../../assets/img/cus_order/back_btn.svg';
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';
import trans_btn from '../../assets/img/cus_order/trans_btn.svg';
import md01 from '../../assets/img/cus_order/md01.png';
import starEmpty from '../../assets/img/cus_order/star_empty.png';
import starFilled from '../../assets/img/cus_order/star_filled.png';

const Cus_order = () => {
  const navigate = useNavigate();

  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isThanksOpen, setIsThanksOpen] = useState(false);
  const [rating, setRating] = useState(0);

  const [orderId, setOrderId] = useState(null);
  const [items, setItems] = useState([]);
  const [menuIndex, setMenuIndex] = useState({});

  // 장바구니 로드: 기본은 orderDraft_v1, 비어있으면 캐시(orderDraft_items_cache)로 복구
  const getCartPayload = () => {
    try {
      const raw = localStorage.getItem('orderDraft_v1');
      const parsed = raw ? JSON.parse(raw) : null;

      const tableId = parsed?.tableId ?? parsed?.selectedTableId ?? 1;
      const userId  = parsed?.userId ?? 1;

      let loadedItems = Array.isArray(parsed?.items) ? parsed.items : [];

      // items가 없거나 빈 배열이면 캐시에서 복구
      if (!loadedItems || loadedItems.length === 0) {
        const cacheRaw = localStorage.getItem('orderDraft_items_cache');
        if (cacheRaw) {
          const cache = JSON.parse(cacheRaw);
          if (Array.isArray(cache)) loadedItems = cache;
          else if (Array.isArray(cache?.items)) loadedItems = cache.items;
        }
      }

      return { items: loadedItems || [], tableId, userId };
    } catch {
      // 완전 실패 시에도 캐시 시도
      try {
        const cacheRaw = localStorage.getItem('orderDraft_items_cache');
        const cache = cacheRaw ? JSON.parse(cacheRaw) : [];
        const loadedItems = Array.isArray(cache) ? cache : (Array.isArray(cache?.items) ? cache.items : []);
        return { items: loadedItems || [], tableId: 1, userId: 1 };
      } catch {
        return { items: [], tableId: 1, userId: 1 };
      }
    }
  };

  // 장바구니를 다시 읽어와 상태 반영
  const loadFromStorage = () => {
    const { items: saved } = getCartPayload();
    setItems(saved || []);
    const lastOrderId = localStorage.getItem('lastOrderId');
    if (lastOrderId) setOrderId(parseInt(lastOrderId, 10) || null);
  };

  // 최초 1회 로드
  useEffect(() => {
    loadFromStorage();
  }, []);

  // 같은 탭 내에서 페이지 복귀/포커스 시에도 항상 재로딩
  useEffect(() => {
    const onFocus = () => loadFromStorage();
    const onPageShow = () => loadFromStorage();
    const onStorage = (e) => {
      if (e.key === 'orderDraft_v1' || e.key === 'orderDraft_items_cache') {
        loadFromStorage();
      }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // items 스냅샷을 캐시에 저장해 두어 옵션 선택 후에도 복구 가능하게 함
  useEffect(() => {
    try {
      if (Array.isArray(items)) {
        localStorage.setItem('orderDraft_items_cache', JSON.stringify(items));
      }
    } catch {}
  }, [items]);

  // 메뉴 메타 인덱스
  useEffect(() => {
    (async () => {
      try {
        const userId = 1;
        const res = await axios.get(`/api/store/${userId}/all`);
        console.log(res)
        const menusRaw = res?.data?.menus;
        const menus = Array.isArray(menusRaw) ? menusRaw : Object.values(menusRaw || {});
        const index = {};
        menus.forEach(m => {
          if (!m) return;
          const key = (m.nameKo || '').trim();
          if (!key) return;
          index[key] = {
            id: Number(m.menuId ?? m.id),
            price: m.price != null ? Number(m.price) : undefined,
          };
        });
        setMenuIndex(index);
        
      } catch(err){
        console.log(err)
      }
    })();
  }, []);

  // 모달 열림시 스크롤 락
  useEffect(() => {
    const lock = isDoneOpen || isRatingOpen || isThanksOpen;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDoneOpen, isRatingOpen, isThanksOpen]);

  const openRating = () => { setIsDoneOpen(false); setRating(0); setIsRatingOpen(true); };
  const selectStar = (n) => setRating(n);

  const totalCount = useMemo(
    () => items.reduce((a, it) => a + (it.quantity || 0), 0),
    [items]
  );
  const totalPrice = useMemo(() => {
    if (items.length === 0) return 0;
    if (items.some(it => it.price == null)) return null;
    return items.reduce((a, it) => a + (Number(it.price) * (it.quantity || 0)), 0);
  }, [items]);

  // 사장님 화면용 로컬 브릿지 추가
  function pushOwnerFeedEntry(createdOrderId) {
    const { tableId } = getCartPayload();
    const tableNo = Number(tableId || 1);

    const menuLines = items.map(it => {
      const name = it.nameKo || it.menuName || '메뉴';
      const qty = it.quantity || 0;
      return `${name} ${qty}`;
    });

    const cards = [];
    let cardTotal = 0;
    items.forEach(it => {
      const name = it.nameKo || it.menuName || '메뉴';
      const raw = Array.isArray(it.cardNames) ? it.cardNames : (it.cardNames ? String(it.cardNames).split(',') : []);
      const trimmed = raw.map(s => String(s).trim()).filter(Boolean);
      cardTotal += trimmed.length;
      trimmed.forEach(desc => {
        cards.push({ title: name, desc });
      });
    });

    const entry = {
      id: createdOrderId || `local-${Date.now()}`,
      tableId: tableNo,
      num: `테이블 ${tableNo}`,
      menu: menuLines,
      cardCount: `주문카드 ${cardTotal}장`,
      cards,
      createdAt: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem('owner_live_orders');
      const arr = raw ? JSON.parse(raw) : [];
      const next = [entry, ...arr].slice(0, 50);
      localStorage.setItem('owner_live_orders', JSON.stringify(next));
      window.dispatchEvent(new StorageEvent('storage', { key: 'owner_live_orders' }));
    } catch {}
  }

  // 메뉴 인덱스가 비어있을 때 1회 보강
  const ensureMenuIndex = async () => {
    if (Object.keys(menuIndex || {}).length > 0) return;
    try {
      const userId = 1;
      const res = await axios.get(`/api/store/${userId}/all`);
      const menusRaw = res?.data?.menus;
      const menus = Array.isArray(menusRaw) ? menusRaw : Object.values(menusRaw || {});
      const index = {};
      menus.forEach((m) => {
        const key = (m?.nameKo || '').trim();
        if (!key) return;
        index[key] = {
          id: Number(m.menuId ?? m.id),
          price: m.price != null ? Number(m.price) : undefined,
        };
      });
      setMenuIndex(index);
    } catch {}
  };

  // 주문하기: 페이로드 정규화로 400 방지
  const handleOrder = async () => {
    setIsDoneOpen(true);

    await ensureMenuIndex();

    const { tableId, userId } = getCartPayload();

    const normalized = (items || [])
      .map((it) => {
        const name = (it.nameKo || it.menuName || '').trim();
        const idxInfo = name ? menuIndex[name] : undefined;

        const menuId   = Number(it.menuId ?? it.id ?? idxInfo?.id);
        const quantity = Number(it.quantity ?? 0);
        const price    = Number(it.price ?? idxInfo?.price);

        const cardArr  = Array.isArray(it.cardNames)
          ? it.cardNames
          : (typeof it.cardNames === 'string'
              ? it.cardNames.split(',').map((s) => s.trim()).filter(Boolean)
              : []);

        return {
          menuId,
          quantity,
          price,
          language: String(it.language || 'KO').toUpperCase(),
          cardQuantity: Number.isFinite(it.cardQuantity) ? Number(it.cardQuantity) : cardArr.length,
          cardNames: cardArr.join(', '),
        };
      })
      .filter(
        (r) =>
          Number.isFinite(r.menuId) && r.menuId > 0 &&
          Number.isFinite(r.quantity) && r.quantity > 0 &&
          Number.isFinite(r.price) && r.price > 0
      );

    if (normalized.length === 0) {
      pushOwnerFeedEntry(null);
      return;
    }

    const body = {
      tableId: Number(tableId || 1),
      items: normalized,
    };

    try {
      const res = await axios.post('/api/orders', body, {
        params: { userId: Number(userId || 1) },
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        withCredentials: true,
      });
      const createdId = res?.data?.id;
      if (createdId) {
        setOrderId(createdId);
        localStorage.setItem('lastOrderId', String(createdId));
      }
      pushOwnerFeedEntry(createdId);
    } catch {
      pushOwnerFeedEntry(null);
    }
  };

  const handleSubmitRating = async () => {
    if (!rating) return;

    if (!orderId) {
      setIsRatingOpen(false);
      setIsThanksOpen(true);
      return;
    }

    try {
      await axios.post('/api/order-ratings', { orderId, star: rating });
      setIsRatingOpen(false);
      setIsThanksOpen(true);
    } catch {
      setIsRatingOpen(false);
      setIsThanksOpen(true);
    }
  };

  // 각 메뉴별 옵션 편집으로 이동(해당 아이템 index 전달)
  const goToOptions = (itemIndex) => {
    navigate('/cus_options', { state: { itemIndex } });
  };

  return (
    <div className='cusorder_wrap container'>
      <div className="header">
        <Link to='/'><button className="back_btn"><img src={back_btn} alt="" /></button></Link>
        <div className="right_btns">
          <button className="qr"><img src={qr_btn} alt="" /></button>
          <button className="trans"><img src={trans_btn} alt="" /></button>
        </div>
      </div>

      <div className="co_main">
        <h1>ORDER</h1>

        {items.length === 0 ? (
          <div className="empty_cart">
            <p>담긴 주문이 없습니다.</p>
            <button className="add_cards" onClick={() => navigate('/')}>메뉴 보러가기</button>
          </div>
        ) : (
          <>
            {items.map((it, idx) => (
              <div className="menu_section" key={it.id || it.menuId || `${it.nameKo}-${idx}`}>
                <div className="menu_sec">
                  <div className="menu_left">
                    <span className="title">{it.nameKo || it.menuName || `메뉴 ${idx + 1}`}</span>
                    {it.description && (
                      <p
                        dangerouslySetInnerHTML={{
                          __html: String(it.description).replace(/\n/g, '<br />'),
                        }}
                      />
                    )}
                    {it.price != null && (
                      <div className="price_each">{Number(it.price).toLocaleString()}원</div>
                    )}
                  </div>
                  <div className="menu_right">{it.quantity || 0}개</div>
                </div>

                {/* 옵션 편집 버튼 */}
                <button className="add_cards" onClick={() => goToOptions(idx)}>
                  주문카드 추가하기
                </button>
              </div>
            ))}

            <div className="total">
              <span className="how">총 가격</span>
              <span className="price">
                {totalPrice == null ? '-' : totalPrice.toLocaleString()}
              </span>
            </div>

            <div className="total_2">
              <span className="how">주문카드 </span>
              <span className="price">{totalCount}개</span>
            </div>

            <div
              className="go_order"
              role="button"
              tabIndex={0}
              onClick={handleOrder}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOrder()}
            >
              주문하기
            </div>
          </>
        )}
      </div>

      {isDoneOpen && (
        <div className="card_overlay" onClick={openRating} aria-modal="true" role="dialog">
          <div className="m_wrap" onClick={openRating}>
            <div className="md_img"><img src={md01} alt="주문 완료" /></div>
            <h1>주문 완료!</h1>
            <p>곧 맛있는 식사가 준비될 거예요.</p>
          </div>
        </div>
      )}

      {isRatingOpen && (
        <div
          className="card_overlay"
          aria-modal="true"
          role="dialog"
          onClick={() => setIsRatingOpen(false)}
        >
          <div className="rating_wrap" onClick={(e) => e.stopPropagation()}>
            <div className="rating_modal">
              <h3>이번 주문은 어땠나요?</h3>

              <div className="stars" role="group" aria-label="별점 선택">
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = rating >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      className={`star ${filled ? 'filled' : ''}`}
                      aria-label={`${n}점`}
                      onClick={() => selectStar(n)}
                    >
                      <img
                        className="star_img"
                        src={filled ? starFilled : starEmpty}
                        alt=""
                        draggable="false"
                      />
                    </button>
                  );
                })}
              </div>

              <p className="hint">주문 만족도를 남겨주세요.</p>
            </div>

            <button
              className={`confirm_btn rate_btn_outside ${rating > 0 ? 'active' : ''}`}
              disabled={rating === 0}
              onClick={handleSubmitRating}
            >
              평가 완료
            </button>
          </div>
        </div>
      )}

      {isThanksOpen && (
        <div
          className="card_overlay"
          aria-modal="true"
          role="dialog"
          onClick={() => setIsThanksOpen(false)}
        >
          <div className="thanks" onClick={(e) => e.stopPropagation()}>
            <h1>감사합니다!</h1>
            <p>곧 주문하신 식사가 준비될 거예요!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cus_order;
