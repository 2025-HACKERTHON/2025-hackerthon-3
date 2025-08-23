import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';
import starEmpty from '../../assets/img/cus_order/star_empty.png';
import starFilled from '../../assets/img/cus_order/star_filled.png';

const Owner_home_fifth = () => {
  const TOTAL_PAGES = 5;
  const current = 5;
  const navigate = useNavigate();

  const PAGE_SLUGS = ['first', 'second', 'third', 'fourth', 'fifth'];
  const pathFor = (n) => `/owner_home_${PAGE_SLUGS[(n - 1) % TOTAL_PAGES]}`;

  const goNext = () => navigate(pathFor((current % TOTAL_PAGES) + 1));
  const goPrev = () => navigate(pathFor(((current - 2 + TOTAL_PAGES) % TOTAL_PAGES) + 1));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ✅ API 응답을 화면 구조로 변환
  const transformToTables = (apiResult = []) =>
    apiResult.map((row) => {
      const menu = (row.items ?? []).map((it) => `${it.menuName} ${it.quantity}`);
      const cardCountNum = (row.items ?? []).reduce(
        (sum, it) => sum + (Number(it.cardQuantity) || 0),
        0
      );
      const cards = [];
      (row.items ?? []).forEach((it) => {
        const names = Array.isArray(it.cardNames) ? it.cardNames : [];
        names.forEach((name) => {
          const text = String(name || '').trim();
          if (text.length > 0) {
            cards.push({ title: it.menuName, desc: text });
          }
        });
      });

      return {
        num: `테이블 ${row.tableId}`,
        menu,
        cardCount: `주문카드 ${cardCountNum}장`,
        cards,
      };
    });

  // ✅ 하드코드 → API 연동 상태
  const [tables, setTables] = useState([]);
  const [openSet, setOpenSet] = useState(new Set());
  const toggleOpen = (idx) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // ✅ 주문 현황 호출 (/api/orders/current) — proxy + 쿠키 전송
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/orders/current', {
          withCredentials: true, // JSESSIONID 자동 전송
        });
        const data = res?.data?.result ?? [];
        setTables(transformToTables(data));
      } catch (err) {
        // UI 변경 없이 콘솔만
        console.error('[orders/current GET error]', {
          status: err?.response?.status,
          data: err?.response?.data,
          err,
        });
      }
    })();
  }, []);

  // 최신 별점 가져와서 표시 (기본값 4로 시작, 실패 시 그대로 유지)
  const [avgRating, setAvgRating] = useState(4);
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/order-ratings/latest', {
          withCredentials: true, // JSESSIONID 자동 전송
        });
        // 응답 예시 가정: { star: 1~5 }
        const star = Number(res?.data?.star);
        if (Number.isFinite(star) && star >= 1 && star <= 5) {
          setAvgRating(star);
        }
      } catch (err) {
        // UI 변경 없이 콘솔만
        console.error('[latest rating GET error]', {
          status: err?.response?.status,
          data: err?.response?.data,
          err,
        });
      }
    })();
  }, []);

  const score = Math.max(1, Math.min(5, Math.round(avgRating)));

  const TITLE_BY_SCORE = {
    1: '주문이 너무 불편했어요...🥲',
    2: '메뉴나 기능이 헷갈렸어요 🤯',
    3: '그럭저럭 쓸 수 있었어요 🙂',
    4: '잘 썼고 편했어요 😄',
    5: '엄청 편했어요! 또 이용할래요! 💖',
  };

  const DETAIL_BY_SCORE = {
    1: 'QR 안내 위치나 테이블 인식 상태, 번역 상태를 다시 확인하면 좋을 것 같아요.',
    2: '중요 메뉴나 추천 메뉴가 눈에 띄지 않거나, 추가 요청 카드 위치가 분명하지 않았을 가능성이 있어요. 메뉴 구성과 순서를 간단하게 조정해 보시면 좋아요.',
    3: '요청사항 선택이나 결제 단계에서 약간의 고민이 있었을 수 있어요. 텍스트에 이모지를 추가해 직관성을 높이는 건 어때요?',
    4: '추천 메뉴가 효과적으로 보였고, 추가 요청사항도 잘 반영된 것으로 보여요. 외국어 표현 중 일부 오해가 있을 수 있으니 번역 표현을 한 번 더 점검해보세요.',
    5: 'QR 진입, 메뉴 구성, 요청사항 선택, 결제까지 모두 매끄럽게 연결됐어요. 지금처럼만 운영하시면 외국인 손님 재방문율도 더 올라갈 거예요!',
  };

  return (
    <div className='ownerhomefifth_wrap container'>
      <div className="header">
        <button className="qr"><img src={qr_btn} alt="" /></button>
      </div>

      <div className="text">
        <h1>RESTAURANT</h1>
        <h2>한그릇</h2>
        <div className="on">운영중</div>
      </div>

      <div className="table_list">
        <h1>실시간 주문 현황</h1>

        {tables.map((t, idx) => (
          <div key={idx} className={`table ${openSet.has(idx) ? 'is-open' : ''}`}>
            <div className="table_left">
              <span className="num">{t.num}</span>
              <div className="menu">
                {t.menu.map((m, i) => <p key={i}>{m}</p>)}
              </div>
              <span className="cnum">{t.cardCount}</span>
            </div>

            <div className="table_right">
              <button className="open" onClick={() => toggleOpen(idx)}>
                {openSet.has(idx) ? '접기' : '열기'}
              </button>
              <button className="close">완료</button>
            </div>

            {openSet.has(idx) && (
              <div className="orders_area" aria-live="polite">
                {t.cards.map((c, i) => (
                  <div className="order_card" key={i}>
                    <strong className="title">{c.title}</strong>
                    <p className="desc">{c.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="trend_section">
        <h1 className="sec_title">최근 주문 경향</h1>

        {/* 최신 별점 표시 */}
        <div className="rating">
          <div className="rating_text">{TITLE_BY_SCORE[score]}</div>

          <div className="stars" role="img" aria-label={`별점 ${score}점`}>
            {Array.from({ length: 5 }, (_, i) => (
              <img
                key={i}
                src={i < score ? starFilled : starEmpty}
                alt={i < score ? '채워진 별' : '빈 별'}
                className={i < score ? 'starFilled' : 'starEmpty'}
              />
            ))}
          </div>

          <div className="rating_detail">{DETAIL_BY_SCORE[score]}</div>
        </div>

        <h2 className="sub_title">주문 만족도</h2>

        <div className="slider_footer">
          <div className="dots">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`dot ${page === 5 ? 'active' : ''}`}
                  onClick={() => navigate(pathFor(page))}
                  aria-label={`${page}번 페이지`}
                  aria-current={page === 5 ? 'page' : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Owner_home_fifth;
