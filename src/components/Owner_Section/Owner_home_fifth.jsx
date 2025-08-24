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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 전역 인터셉터 영향 최소화를 위한 로컬 axios 인스턴스
  const api = axios.create({ withCredentials: true });

  // ───────────────── 공통 유틸 (first/third/fourth와 동일 철학) ─────────────────
  const hasSession = () => {
    try {
      return document.cookie.split(';').some(c => c.trim().startsWith('JSESSIONID='));
    } catch { return false; }
  };

  const getFallbackTableId = () => {
    try {
      const raw = localStorage.getItem('orderDraft_v1');
      if (!raw) return null;
      const p = JSON.parse(raw);
      const v = p.tableId ?? p.selectedTableId ?? null;
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch { return null; }
  };

  const computeDisplayTableId = (raw) => {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n; // 서버 우선
    const fallback = getFallbackTableId();
    return fallback ?? 1;
  };

  const normalizeCardNames = (raw) => {
    if (Array.isArray(raw)) return raw.map(s => String(s || '').trim()).filter(Boolean);
    if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

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

  const orderSignatureFromApi = (o) => {
    const tableId = o?.tableId ?? '';
    const items = Array.isArray(o?.items) ? o.items : [];
    const parts = [String(tableId)];
    items.forEach((it) => {
      const nm = String(it?.menuName ?? '').trim();
      const q = Number(it?.quantity ?? 0);
      const cn = normalizeCardNames(it?.cardNames);
      parts.push(`${nm}|${q}|${cn.join('^')}`);
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
      // 로컬 브릿지에도 반영(있다면 제거)
      const raw = localStorage.getItem('owner_live_orders');
      const arr = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((e) => orderSignatureFromTable(e) !== sig);
      localStorage.setItem('owner_live_orders', JSON.stringify(filtered));
      // 스토리지 이벤트로 다른 탭/컴포넌트 갱신
      window.dispatchEvent(new StorageEvent('storage', { key: 'owner_hidden_sigs' }));
    } catch {}
  };

  // ───────────────── 상태 ─────────────────
  const [openSet, setOpenSet] = useState(new Set());
  const toggleOpen = (idx) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const [tables, setTables] = useState([]);
  const [avgRating, setAvgRating] = useState(4); // 기본 4

  // ───────────────── 서버/로컬 변환 & 병합 ─────────────────
  function transformOrders(apiList) {
    if (!Array.isArray(apiList)) return [];
    return apiList.map((o) => {
      const sig = orderSignatureFromApi(o);
      const tableId = computeDisplayTableId(o?.tableId);

      const menuLines = [];
      const pairs = [];
      let cardTotal = 0;

      (o.items || []).forEach((it) => {
        const name = it.menuName || '메뉴';
        const qty = Number(it.quantity || 0);
        menuLines.push(`${name} ${qty}`);

        const cleaned = normalizeCardNames(it.cardNames);
        const cnt = (typeof it.cardQuantity === 'number') ? it.cardQuantity : cleaned.length;
        cardTotal += cnt;

        cleaned.forEach(desc => pairs.push({ title: name, desc }));
      });

      const cards = aggregateCardsByMenu(pairs);

      return {
        sig,
        tableId,
        num: `테이블 ${tableId}`,
        menu: menuLines,
        cardCount: `주문카드 ${cardTotal}장`,
        cards,
        id: `srv-${tableId}-${sig}`,
        createdAt: new Date().toISOString()
      };
    });
  }

  function readLocalOrders() {
    try {
      const raw = localStorage.getItem('owner_live_orders');
      const arr = raw ? JSON.parse(raw) : [];
      return arr.map((e) => {
        const displayTableId = computeDisplayTableId(e.tableId);
        const cards = aggregateCardsByMenu(
          (Array.isArray(e.cards) ? e.cards : []).map((c) => ({ title: c.title, desc: c.desc }))
        );
        const sumCount = cards.reduce((a, c) => a + (c.desc ? c.desc.split(',').length : 0), 0);
        const model = {
          ...e,
          tableId: displayTableId,
          num: `테이블 ${displayTableId}`,
          cards,
          menu: Array.isArray(e.menu) ? e.menu : [],
          cardCount: `주문카드 ${sumCount}장`,
          createdAt: e.createdAt || new Date().toISOString()
        };
        return { ...model, sig: orderSignatureFromTable(model), id: e.id || `local-${displayTableId}-${Date.now()}` };
      });
    } catch {
      return [];
    }
  }

  const mergeBySignature = (serverArr, localArr, hidden) => {
    const bySig = new Map();
    serverArr.forEach((x) => { if (!hidden.has(x.sig)) bySig.set(x.sig, x); });
    localArr.forEach((x) => { if (!hidden.has(x.sig) && !bySig.has(x.sig)) bySig.set(x.sig, x); });
    return Array.from(bySig.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // ───────────────── API 호출 ─────────────────
  async function loadOwnerOrders() {
    const hidden = readHiddenSigs();
    if (!hasSession()) {
      setTables(mergeBySignature([], readLocalOrders(), hidden));
      return;
    }
    try {
      const res = await api.get('/api/orders/current');
      const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.result) ? res.data.result : []);
      const srv = transformOrders(arr);
      const loc = readLocalOrders();
      setTables(mergeBySignature(srv, loc, hidden));
    } catch {
      setTables(mergeBySignature([], readLocalOrders(), hidden));
    }
  }

  async function loadLatestRating() {
    try {
      // 필요하면 ?userId=1 같은 파라미터 추가 가능
      const res = await api.get('/api/order-ratings/latest');
      const star = Number(
        res?.data?.star ??
        (Array.isArray(res?.data) ? res.data[0]?.star : undefined) ??
        res?.data?.result?.star
      );
      if (Number.isFinite(star) && star >= 1 && star <= 5) {
        setAvgRating(star);
      }
    } catch {
      // 실패 시 기존 값 유지(폴백)
    }
  }

  useEffect(() => {
    // 최초 로드
    loadOwnerOrders();
    loadLatestRating();

    // 주기 갱신(실시간 느낌)
    const iv = setInterval(() => {
      loadOwnerOrders();
      loadLatestRating();
    }, 1500);

    // 로컬스토리지 브릿지 이벤트 대응
    const onStorage = (ev) => {
      if (
        ev.key === 'owner_live_orders' ||
        ev.key === 'owner_hidden_sigs' ||
        ev.key === 'orderDraft_v1'
      ) {
        loadOwnerOrders();
      }
      // (선택) 같은 기기에서 별점 남길 때 즉시 반영하고 싶다면,
      // if (ev.key === 'owner_latest_rating_hint') loadLatestRating();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(iv);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // 별점카드
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
    <div id='ownerhomefifth_wrap' className='container'>
      <div className="header">
        <button className="qr"><img src={qr_btn} alt="" /></button>
      </div>

      <div className="text">
        <h1>RESTAURANT</h1>
        <h2>한그릇</h2>
        <div className="on">운영중</div>
      </div>

      <h1 className='title'> 실시간 주문 현황</h1>
      <div className="table_list">
        

        {tables.map((t, idx) => (
          <div
            key={t.id || idx}
            className={`table ${openSet.has(idx) ? 'is-open' : ''}`}
            style={openSet.has(idx) ? { height: 'auto', paddingBottom: 16 } : undefined}
          >
            <div className="table_left">
              <span className="num">{t.num || `테이블 ${t.tableId || ''}`}</span>
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
                  setTables(prev => prev.filter((_, i) => i !== idx));
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
        ))}
      </div>

      <div className="trend_section">
        <h1 className="sec_title">최근 주문 경향</h1>

        {/* 최신 별점 표시 (실시간 폴링 반영) */}
        <div className="rating">
          <div className="rating_text">{TITLE_BY_SCORE[score]}</div>

          <div className="stars" role="img" aria-label={`별점 ${score}점`}>
            {Array.from({ length: 5 }, (_, i) => (
              <img
                key={i}
                src={i < score ? starFilled : starEmpty}
                alt={i < score ? '채워진 별' : '빈 별'}
                className={i < score ? 'starFilled' : 'starEmpty'}
                draggable="false"
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
