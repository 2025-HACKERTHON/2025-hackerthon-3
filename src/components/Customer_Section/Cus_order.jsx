import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import back_btn from '../../assets/img/cus_order/back_btn.svg';
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';
import trans_btn from '../../assets/img/cus_order/trans_btn.svg';
import md01 from '../../assets/img/cus_order/md01.png';
import starEmpty from '../../assets/img/cus_order/star_empty.png';
import starFilled from '../../assets/img/cus_order/star_filled.png';
import { Link } from 'react-router-dom';

const Cus_order = () => {
  const navigate = useNavigate();

  //  현재 사용하는 상태만 유지
  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isThanksOpen, setIsThanksOpen] = useState(false); // ← useEffect 위로 이동
  const [rating, setRating] = useState(0);

  // 옵션 페이지로 이동
  const goToOptions = () => navigate('/cus_options');

  // 모달 열릴 때만 스크롤 락
  useEffect(() => {
    const lock = isDoneOpen || isRatingOpen || isThanksOpen;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDoneOpen, isRatingOpen, isThanksOpen]);

  //  주문완료 → 별점 모달
  const openRating = () => {
    setIsDoneOpen(false);
    setRating(0);
    setIsRatingOpen(true);
  };

  // 주문하기 → 주문완료 모달
  const openDone = () => setIsDoneOpen(true);

  //  별점 선택
  const selectStar = (n) => setRating(n);

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

        <div className="menu_section">
          <div className="menu_sec">
            <div className="menu_left">
              <span className="title">소고기 미역국 정식</span>
              <p>부드러운 소고기와 진한 국물의<br />미역국 + 밥 + 반찬 3종. 맵지 않아요!</p>
            </div>
            <div className="menu_right">1개</div>
          </div>
          <button className="add_cards" onClick={goToOptions}>주문카드 추가하기</button>
        </div>

        <div className="menu_section">
          <div className="menu_sec">
            <div className="menu_left">
              <span className="title">제육볶음 덮밥</span>
              <p>매콤달콤하게 볶은 돼지고기 제육에<br />고소한 계란프라이까지.</p>
            </div>
            <div className="menu_right">1개</div>
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

        {/* 주문하기 → 주문완료 모달 */}
        <div
          className="go_order"
          role="button"
          tabIndex={0}
          onClick={openDone}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openDone()}
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
              onClick={() => {
                if (rating === 0) return;        // 안전 가드(비활성 상태면 무시)
                setIsRatingOpen(false);          // 별점 모달 닫기
                setIsThanksOpen(true);           // 감사 모달 열기
              }}
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
          onClick={() => setIsThanksOpen(false)}     // 바깥 클릭 시 닫힘
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
