import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';
import { Link } from 'react-router-dom';

const Owner_home_first = () => {
  const TOTAL_PAGES = 5;
  const current = 1;
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

  const tables = [
    {
      num: '테이블 1',
      menu: ['소고기 미역국 정식 1', '제육볶음 덮밥 1'],
      cardCount: '주문카드 2장',
      cards: [
        { title: '소고기 미역국 정식', desc: '비건 변경을 원해요' },
        { title: '제육볶음 덮밥', desc: '마늘 빼주세요' },
      ],
    },
    {
      num: '테이블 2',
      menu: ['소고기 미역국 정식 1', '제육볶음 덮밥 1'],
      cardCount: '주문카드 2장',
      cards: [
        { title: '소고기 미역국 정식', desc: '맵기 조절 부탁해요' },
        { title: '제육볶음 덮밥', desc: '밥은 적게 주세요' },
      ],
    },
    {
      num: '테이블 3',
      menu: ['소고기 미역국 정식 1', '제육볶음 덮밥 1'],
      cardCount: '주문카드 2장',
      cards: [
        { title: '소고기 미역국 정식', desc: '비건 변경을 원해요' },
        { title: '제육볶음 덮밥', desc: '마늘 빼주세요' },
      ],
    },
  ];

  const [openSet, setOpenSet] = useState(new Set());
  const toggleOpen = (idx) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); 
      else next.add(idx);                  
      return next;
    });
  };

  return (
    <div className='ownerhomef_wrap container'>
      <div className="header">
        <Link to='/menu_edit'>
          <button className="qr"><img src={qr_btn} alt="" /></button>
        </Link>
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

        <div className="rank">
          <div className="rank_first">
            <div className="rnum">1</div>
            <div className="rank_line">
              <span className='contry'>일본</span>
              <span className="precent">60%</span>
            </div>
          </div>
          <div className="rank_second">
            <div className="rnum">2</div>
            <div className="rank_line">
              <span className='contry'>중국</span>
              <span className="precent">30%</span>
            </div>
          </div>
          <div className="rank_third">
            <div className="rnum">3</div>
            <div className="rank_line"></div>
            <span className="country">영어권</span>
            <span className="percent">10%</span>
          </div>
        </div>
        <h2 className="sub_title">손님국적</h2>

        <div className="slider_footer">
          <div className="dots">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`dot ${page === current ? 'active' : ''}`}
                  onClick={() => navigate(pathFor(page))}
                  aria-label={`${page}번 페이지`}
                  aria-current={page === current ? 'page' : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Owner_home_first;
