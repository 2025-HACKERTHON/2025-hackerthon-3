import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';

const Owner_home_third = () => {
  const TOTAL_PAGES = 5;
  const current = 3;
  const navigate = useNavigate();

  const PAGE_SLUGS = ['first', 'second', 'third', 'fourth', 'fifth'];
  const pathFor = (n) => `/owner_home_${PAGE_SLUGS[(n - 1) % TOTAL_PAGES]}`;

  const goNext = () => navigate(pathFor((current % TOTAL_PAGES) + 1));
  const goPrev = () =>
    navigate(pathFor(((current - 2 + TOTAL_PAGES) % TOTAL_PAGES) + 1));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // API 응답을 화면 구조로 변환
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

  // 하드코드 → API 연동
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

  // API 호출 (proxy: http://3.38.135.47:8080)
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/orders/current', {
          withCredentials: true, // 브라우저에 저장된 JSESSIONID 자동 전송
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

  return (
    <div className='ownerhometh_wrap container'>
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

        <div className="bubble_chart">
          <div className="bubble big" aria-label="최다 주문">
            <span className="label">소고기 미역국 정식</span>
          </div>

          <div className="bubble mid" aria-label="두 번째로 많은 주문">
            <span className="label">제육볶음 덮밥</span>
          </div>

          <div className="bubble small" aria-label="가장 적은 주문">
            <span className="label">김치전</span>
          </div>
        </div>

        <h2 className="sub_title">중국 인기 메뉴</h2>

        <div className="slider_footer">
          <div className="dots">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`dot ${page === 3 ? 'active' : ''}`}
                  onClick={() => navigate(pathFor(page))}
                  aria-label={`${page}번 페이지`}
                  aria-current={page === 3 ? 'page' : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Owner_home_third;
