import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import back_btn from '../../assets/img/cus_order/back_btn.svg';
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';
import trans_btn from '../../assets/img/cus_order/trans_btn.svg';
import md01 from '../../assets/img/cus_order/md01.png';
import starEmpty from '../../assets/img/cus_order/star_empty.png';
import starFilled from '../../assets/img/cus_order/star_filled.png';

const Cus_order = () => {
  const navigate = useNavigate();

  // 모달/별점 상태
  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isThanksOpen, setIsThanksOpen] = useState(false);
  const [rating, setRating] = useState(0);

  // 주문 저장 응답의 주문 ID
  const [orderId, setOrderId] = useState(null);

  // ✅ 카드에 뿌릴 텍스트(기본은 전부 빈 문자열)
  const [displayCards, setDisplayCards] = useState([
    { title: '', desc: '', qty: '' }, // 카드 #1
    { title: '', desc: '', qty: '' }, // 카드 #2
  ]);

  // axios 인스턴스 (세션 쿠키 전송)
  const api = axios.create({
    withCredentials: true,                         // JSESSIONID 자동 전송
    headers: { 'Content-Type': 'application/json' }
  });

  // 옵션 페이지로 이동
  const goToOptions = () => navigate('/cus_options');

  // 모달 열릴 때만 스크롤 락
  useEffect(() => {
    const lock = isDoneOpen || isRatingOpen || isThanksOpen;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDoneOpen, isRatingOpen, isThanksOpen]);

  // 주문완료 → 별점 모달
  const openRating = () => {
    setIsDoneOpen(false);
    setRating(0);
    setIsRatingOpen(true);
  };

  // 별점 선택
  const selectStar = (n) => setRating(n);

  // ✅ 현재 주문(장바구니) 불러와 카드 텍스트 채우기: /api/orders/current
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/orders/current');
        // 응답 예시: { result:[ { items:[ {menuName, quantity, cardNames:[...]} ] } ] }
        const data = res?.data;
        const items =
          Array.isArray(data?.result) && data.result[0]?.items
            ? data.result[0].items
            : (Array.isArray(data?.items) ? data.items : []);

        // 최대 2장만 UI에 맵핑(부족하면 빈값 유지)
        const next = [0, 1].map((i) => {
          const it = items?.[i];
          if (!it) return { title: '', desc: '', qty: '' };
          const title = it.menuName || '';
          const qty   = Number(it.quantity) ? String(it.quantity) : '';
          // cardNames 배열에서 공백 제거 후 합치기 (요청사항)
          const desc  = Array.isArray(it.cardNames)
            ? it.cardNames.map(v => String(v || '').trim()).filter(Boolean).join(', ')
            : String(it.cardNames || '').trim();
          return { title, desc, qty };
        });

        setDisplayCards(next);
      } catch (err) {
        console.error('[cart load error]', {
          status: err?.response?.status,
          data: err?.response?.data,
          err,
        });
        // 실패 시 그대로 빈 카드 유지
        setDisplayCards([
          { title: '', desc: '', qty: '' },
          { title: '', desc: '', qty: '' },
        ]);
      }
    })();
  }, []);

  // ====== (2) 손님 주문저장: POST /api/orders?userId=1 ======
  const saveOrder = async () => {
    try {
      const payload = {
        tableId: 3,
        items: [
          {
            menuId: 1,
            quantity: 2,
            price: 12000,
            language: 'KO',
            cardQuantity: 1,
            cardNames: '고수 빼주세요',
          },
          {
            menuId: 2,
            quantity: 1,
            price: 8000,
            language: 'KO',
            cardQuantity: 0,
            cardNames: '',
          },
        ],
      };

      const res = await api.post('/api/orders', payload, { params: { userId: 1 } });
      const createdId = res?.data?.id;
      if (createdId) setOrderId(createdId);

      setIsDoneOpen(true);
      console.log('[order save OK]', res?.status, res?.data);
    } catch (err) {
      console.error('[order save error]', {
        status: err?.response?.status,
        data: err?.response?.data,
        err,
      });
    }
  };

  // ====== (1) 손님 주문평가 저장: POST /api/order-ratings ======
  const saveOrderRating = async () => {
    if (!orderId || rating === 0) return;
    try {
      const payload = { orderId, star: rating };
      const res = await api.post('/api/order-ratings', payload);

      setIsRatingOpen(false);
      setIsThanksOpen(true);
      console.log('[order-rating save OK]', res?.status, res?.data);
    } catch (err) {
      console.error('[order-rating save error]', {
        status: err?.response?.status,
        data: err?.response?.data,
        err,
      });
      // 서버 직렬화 에러가 계속되면 서버 DTO 반환으로 수정 필요
    }
  };

  return (
    <div className='cusorder_wrap container'>
      <div className="header">
       <Link to='/'>
        <button className="back_btn"><img src={back_btn} alt="" /></button>
       </Link>
        <div className="right_btns">
          <button className="qr"><img src={qr_btn} alt="" /></button>
          <button className="trans"><img src={trans_btn} alt="" /></button>
        </div>
      </div>

      <div className="co_main">
        <h1>ORDER</h1>

        {/* ✅ 카드 #1 — 기본 디자인 유지, 텍스트만 API로 채움(없으면 빈칸) */}
        <div className="menu_section">
          <div className="menu_sec">
            <div className="menu_left">
              <span className="title">{displayCards[0].title}</span>
              {displayCards[0].desc && (
                <p>{displayCards[0].desc}</p>
              )}
            </div>
            <div className="menu_right">
              {displayCards[0].qty && `${displayCards[0].qty}개`}
            </div>
          </div>
          <button className="add_cards" onClick={goToOptions}>주문카드 추가하기</button>
        </div>

        {/* ✅ 카드 #2 — 동일 방식 */}
        <div className="menu_section">
          <div className="menu_sec">
            <div className="menu_left">
              <span className="title">{displayCards[1].title}</span>
              {displayCards[1].desc && (
                <p>{displayCards[1].desc}</p>
              )}
            </div>
            <div className="menu_right">
              {displayCards[1].qty && `${displayCards[1].qty}개`}
            </div>
          </div>
          <button className="add_cards" onClick={goToOptions}>주문카드 추가하기</button>
        </div>

        <button className="add_order">주문 추가하기</button>

        <div className="total">
          <span className="how">총 가격</span>
          <span className="price">33,000</span>
        </div>

        <div className="total_2">
          <span className="how">주문카드 </span>
          <span className="price">2개</span>
        </div>

        {/* 주문하기 → 주문 저장 API 호출 후 주문완료 모달 */}
        <div
          className="go_order"
          role="button"
          tabIndex={0}
          onClick={saveOrder}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && saveOrder()}
        >
          주문하기
        </div>
      </div>

      {/* 주문완료 모달: 어디든 클릭 → 별점 모달 */}
      {isDoneOpen && (
        <div className="card_overlay" onClick={openRating} aria-modal="true" role="dialog">
          <div className="m_wrap" onClick={openRating}>
            <div className="md_img"><img src={md01} alt="주문 완료" /></div>
            <h1>주문 완료!</h1>
            <p>곧 맛있는 식사가 준비될 거예요.</p>
          </div>
        </div>
      )}

      {/* 별점 모달 */}
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
                  const isFilled = rating >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      className={`star ${isFilled ? 'filled' : ''}`}
                      aria-label={`${n}점`}
                      onClick={() => selectStar(n)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') selectStar(n);
                        if (e.key === 'ArrowLeft') selectStar(Math.max(0, rating - 1));
                        if (e.key === 'ArrowRight') selectStar(Math.min(5, rating + 1));
                      }}
                    >
                      <img
                        className="star_img"
                        src={isFilled ? starFilled : starEmpty}
                        alt={isFilled ? '채워진 별' : '빈 별'}
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
              onClick={saveOrderRating}
            >
              평가 완료
            </button>
          </div>
        </div>
      )}

      {/* 감사 모달 */}
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
