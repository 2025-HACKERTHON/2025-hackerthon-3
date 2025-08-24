// src/components/Owner_Section/Owner_home_second.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';

const Owner_home_second = () => {
  const TOTAL_PAGES = 5;
  const current = 2;
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

  const [openSet, setOpenSet] = useState(new Set());
  const toggleOpen = (idx) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // 서버 쿠키 자동 전송
  axios.defaults.withCredentials = true;

  // 고유 시그니처 생성
  const orderSignatureFromApi = (apiOrder) => {
    const tableId = apiOrder?.tableId ?? '';
    const items = Array.isArray(apiOrder?.items) ? apiOrder.items : [];
    const parts = [String(tableId)];
    items.forEach((it) => {
      const nm = String(it?.menuName ?? '').trim();
      const q = Number(it?.quantity ?? 0);
      const cn = Array.isArray(it?.cardNames) ? it.cardNames : [];
      parts.push(`${nm}|${q}|${cn.filter(Boolean).join('^')}`);
    });
    return parts.join('::');
  };
  const orderSignatureFromTable = (t) => {
    const parts = [String(t?.tableId ?? ''), String(t?.num ?? '')];
    const menuStr = Array.isArray(t?.menu) ? t.menu.join('|') : '';
    parts.push(menuStr);
    const cardStr = Array.isArray(t?.cards)
      ? t.cards.map((c) => `${c.title}|${c.desc}`).join('|')
      : '';
    parts.push(cardStr);
    return parts.join('::');
  };
  const readHiddenSigs = () => {
    try {
      const raw = localStorage.getItem('owner_hidden_sigs');
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch { return new Set(); }
  };
  const addHiddenSig = (sig) => {
    try {
      const set = readHiddenSigs();
      set.add(sig);
      localStorage.setItem('owner_hidden_sigs', JSON.stringify(Array.from(set)));
      const raw = localStorage.getItem('owner_live_orders');
      const arr = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((e) => orderSignatureFromTable(e) !== sig);
      localStorage.setItem('owner_live_orders', JSON.stringify(filtered));
    } catch {}
  };

  // 카드 집계: 메뉴별 1장으로 합치기
  const aggregateCardsByMenu = (pairs) => {
    const grouped = {};
    pairs.forEach(({ title, desc }) => {
      const name = String(title || '메뉴');
      const text = String(desc || '').trim();
      if (!text) return;
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(text);
    });
    return Object.entries(grouped).map(([title, arr]) => ({
      title,
      desc: Array.from(new Set(arr)).join(', '),
    }));
  };

  // 화면용 상태
  const [tables, setTables] = useState([]);
  const [bestMenus, setBestMenus] = useState([]); // 일본 베스트 3

  // 서버 → 화면 모델
  const transformOrders = (apiList) => {
    if (!Array.isArray(apiList)) return [];
    return apiList.map((o) => {
      const sig = orderSignatureFromApi(o);
      const tableId = o?.tableId;
      const menuLines = [];
      const pairs = [];
      let cardTotal = 0;

      (o.items || []).forEach((it) => {
        const name = it.menuName || '메뉴';
        const qty = Number(it.quantity || 0);
        menuLines.push(`${name} ${qty}`);

        const arr = Array.isArray(it.cardNames) ? it.cardNames : [];
        const cleaned = arr.map((s) => String(s || '').trim()).filter(Boolean);
        cardTotal += cleaned.length;
        cleaned.forEach((desc) => pairs.push({ title: name, desc }));
      });

      const cards = aggregateCardsByMenu(pairs);

      return {
        sig,
        tableId,
        num: `테이블 ${tableId ?? '-'}`,
        menu: menuLines,
        cardCount: `주문카드 ${cardTotal}장`,
        cards,
        id: `srv-${tableId}-${sig}`,
        createdAt: new Date().toISOString(),
      };
    });
  };

  // 로컬 → 화면 모델 (Cus_order에서 브릿지로 쌓아둔 데이터)
  const readLocalOrders = () => {
    try {
      const raw = localStorage.getItem('owner_live_orders');
      const arr = raw ? JSON.parse(raw) : [];
      return arr.map((e) => {
        const sumCount = Array.isArray(e.cards)
          ? e.cards.filter((c) => c && String(c.desc || '').trim()).length
          : 0;
        const cards = aggregateCardsByMenu(
          (e.cards || []).map((c) => ({ title: c.title, desc: c.desc }))
        );
        const model = {
          ...e,
          cards,
          cardCount: `주문카드 ${sumCount}장`,
          num: e.num || (e.tableId ? `테이블 ${e.tableId}` : '테이블 -'),
          tableId: e.tableId ?? null,
        };
        return { ...model, sig: orderSignatureFromTable(model) };
      });
    } catch {
      return [];
    }
  };

  // 현재 주문 로드: 서버 우선, 실패 시 로컬. 숨김 시그니처 필터 적용
  const loadOwnerOrders = async () => {
    const hidden = readHiddenSigs();
    try {
      const res = await axios.get('/api/orders/current', { withCredentials: true });
      const arr = res?.data || [];
      const transformed = transformOrders(arr).filter((t) => !hidden.has(t.sig));
      if (transformed.length > 0) {
        setTables(transformed);
      } else {
        setTables(readLocalOrders().filter((t) => !hidden.has(t.sig)));
      }
    } catch {
      setTables(readLocalOrders().filter((t) => !hidden.has(t.sig)));
    }
  };

  // 일본 베스트 메뉴 3개
  const loadJapanTop3 = async () => {
    try {
      const res = await axios.get('/api/statistics/menus/top3/1/JAN', { withCredentials: true });
      const arr = Array.isArray(res?.data) ? res.data : [];
      setBestMenus(arr.map((s) => String(s || '').trim()).filter(Boolean).slice(0, 3));
    } catch {
      setBestMenus([]);
    }
  };

  useEffect(() => {
    loadOwnerOrders();
    loadJapanTop3();

    const iv = setInterval(() => {
      loadOwnerOrders();
      loadJapanTop3();
    }, 1500);

    const onStorage = (ev) => {
      if (ev.key === 'owner_live_orders' || ev.key === 'owner_hidden_sigs') {
        loadOwnerOrders();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(iv);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const bubble1 = bestMenus[0] || '소고기 미역국 정식';
  const bubble2 = bestMenus[1] || '제육볶음 덮밥';
  const bubble3 = bestMenus[2] || '김치전';

  return (
    <div id='ownerhomes_wrap' className='container'>
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

        {tables.length === 0 ? (
          <div className="no_orders">현재 접수된 주문이 없습니다.</div>
        ) : (
          tables.map((t, idx) => (
            <div
              key={t.id || idx}
              className={`table ${openSet.has(idx) ? 'is-open' : ''}`}
              style={openSet.has(idx) ? { height: 'auto', paddingBottom: 16 } : undefined}
            >
              <div className="table_left">
                <span className="num">{t.num || `테이블 ${t.tableId ?? '-'}`}</span>
                <div className="menu">
                  {t.menu.map((m, i) => <p key={i}>{m}</p>)}
                </div>
                <span className="cnum">{t.cardCount}</span>
              </div>

              <div className="table_right">
                <button className="open" onClick={() => toggleOpen(idx)}>
                  {openSet.has(idx) ? '접기' : '열기'}
                </button>
                <button
                  className="close"
                  onClick={() => {
                    const sig = t.sig || orderSignatureFromTable(t);
                    addHiddenSig(sig);
                    setTables((prev) => prev.filter((_, i) => i !== idx));
                  }}
                >
                  완료
                </button>
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
          ))
        )}
      </div>

      <div className="trend_section">
        <h1 className="sec_title">최근 주문 경향</h1>

        <div className="bubble_chart">
          <div className="bubble big" aria-label="최다 주문">
            <span className="label">{bubble1}</span>
          </div>
          <div className="bubble mid" aria-label="두 번째로 많은 주문">
            <span className="label">{bubble2}</span>
          </div>
          <div className="bubble small" aria-label="가장 적은 주문">
            <span className="label">{bubble3}</span>
          </div>
        </div>

        <h2 className="sub_title">일본 인기 메뉴</h2>

        <div className="slider_footer">
          <div className="dots">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`dot ${page === 2 ? 'active' : ''}`}
                  onClick={() => navigate(pathFor(page))}
                  aria-label={`${page}번 페이지`}
                  aria-current={page === 2 ? 'page' : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Owner_home_second;
