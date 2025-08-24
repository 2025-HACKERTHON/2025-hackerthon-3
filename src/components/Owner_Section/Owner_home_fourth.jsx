// src/components/Owner_Section/Owner_home_fourth.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';

const Owner_home_fourth = () => {
  const TOTAL_PAGES = 5;
  const current = 4;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 전역 인터셉터 영향을 피하기 위한 로컬 axios 인스턴스
  const api = axios.create({ withCredentials: true });

  // 세션 쿠키 존재 여부(세션 방식일 때만 사용. JWT 쓰면 이 함수 무시됨)
  const hasSession = () => {
    try {
      return document.cookie.split(';').some(c => c.trim().startsWith('JSESSIONID='));
    } catch {
      return false;
    }
  };

  // ---------- 공통 유틸(First/Third와 동일 철학) ----------
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

  // ---------- 상태 ----------
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
  const [engTop3, setEngTop3] = useState([]);         // 영어권 베스트 메뉴 3개
  const [langStats, setLangStats] = useState([]);     // 언어 통계(화면 구조는 그대로 유지)

  // ---------- 서버/로컬 변환 & 병합 ----------
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

  // ---------- API 호출 ----------
  async function loadOwnerOrders() {
    const hidden = readHiddenSigs();

    // 세션 쿠키 없으면 로컬 폴백
    if (!hasSession()) {
      setTables(mergeBySignature([], readLocalOrders(), hidden));
      return;
    }

    try {
      const res = await api.get('/api/orders/current');
      // 서버가 배열 또는 { result: [] } 형태 둘 다 가능하게 처리
      const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.result) ? res.data.result : []);
      const srv = transformOrders(arr);
      const loc = readLocalOrders();
      setTables(mergeBySignature(srv, loc, hidden));
    } catch {
      setTables(mergeBySignature([], readLocalOrders(), hidden));
    }
  }

  async function loadLanguageStats() {
    try {
      const res = await api.get('/api/statistics/languages', { params: { userId: 1 } });
      const arr = Array.isArray(res?.data?.result) ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
      setLangStats(arr);
      // 필요시: console.log('[fourth] languages', arr);
    } catch {
      setLangStats([]);
    }
  }

  async function loadEnglishTop3() {
    try {
      const res = await api.get('/api/statistics/menus/top3/1/ENG');
      const arr = Array.isArray(res?.data?.result) ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
      setEngTop3(arr.map(s => String(s || '').trim()).filter(Boolean).slice(0, 3));
    } catch {
      setEngTop3([]);
    }
  }

  useEffect(() => {
    // 최초 로드
    loadOwnerOrders();
    loadLanguageStats();
    loadEnglishTop3();

    // 주기 갱신
    const iv = setInterval(() => {
      loadOwnerOrders();
      loadLanguageStats();
      loadEnglishTop3();
    }, 1500);

    // 로컬스토리지 브릿지 이벤트 대응 (숨김/로컬 변경 모두)
    const onStorage = (ev) => {
      if (
        ev.key === 'owner_live_orders' ||
        ev.key === 'owner_hidden_sigs' ||
        ev.key === 'orderDraft_v1'
      ) {
        loadOwnerOrders();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(iv);
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 버블 차트 라벨: API 응답 반영(없으면 기존 문자열 유지)
  const bubble1 = engTop3[0] || '소고기 미역국 정식';
  const bubble2 = engTop3[1] || '제육볶음 덮밥';
  const bubble3 = engTop3[2] || '김치전';

  return (
    <div id='ownerhomefo_wrap' className='container'>
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
          <div key={t.id || idx} className={`table ${openSet.has(idx) ? 'is-open' : ''}`}>
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
                  // 완료 = 숨김 시그니처에 등록 + 화면에서 제거 (서버 삭제 아님)
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

        <h2 className="sub_title">영어권 인기 메뉴</h2>

        <div className="slider_footer">
          <div className="dots">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`dot ${page === 4 ? 'active' : ''}`}
                  onClick={() => navigate(pathFor(page))}
                  aria-label={`${page}번 페이지`}
                  aria-current={page === 4 ? 'page' : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Owner_home_fourth;
