// src/components/Owner_Section/Owner_home_first.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';

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
  const [langStats, setLangStats] = useState([]);

  axios.defaults.withCredentials = true;

  // 로컬에 저장된 최근 테이블 번호를 읽는다
  const getFallbackTableId = () => {
    try {
      const raw = localStorage.getItem('orderDraft_v1');
      if (!raw) return null;
      const p = JSON.parse(raw);
      const v = p.tableId ?? p.selectedTableId ?? null;
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  };

  // 표시용 테이블 번호: 서버 값이 정상이면 그대로, 아니면 로컬 fallback
  const computeDisplayTableId = (raw) => {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n; // 서버 우선
    const fallback = getFallbackTableId();
    return fallback ?? 1;
  };

  // 서버 응답에서 카드명 배열 정규화
  const normalizeCardNames = (raw) => {
    if (Array.isArray(raw)) {
      return raw.map((s) => String(s || '').trim()).filter(Boolean);
    }
    if (typeof raw === 'string') {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  // 고유 시그니처
  const orderSignatureFromApi = (apiOrder) => {
    const tableId = apiOrder?.tableId ?? '';
    const items = Array.isArray(apiOrder?.items) ? apiOrder.items : [];
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
      const raw = localStorage.getItem('owner_live_orders');
      const arr = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((e) => orderSignatureFromTable(e) !== sig);
      localStorage.setItem('owner_live_orders', JSON.stringify(filtered));
    } catch { }
  };

  // 메뉴별 한 장으로 집계
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

  // 서버 -> 화면 모델
  const transformOrders = (apiList) => {
    if (!Array.isArray(apiList)) return [];
    return apiList.map((o) => {
      const sig = orderSignatureFromApi(o);
      const tableIdForDisplay = computeDisplayTableId(o?.tableId);
      const menuLines = [];
      const pairs = [];
      let cardTotal = 0;

      (o.items || []).forEach((it) => {
        const name = it.menuName || '메뉴';
        const qty = Number(it.quantity || 0);
        menuLines.push(`${name} ${qty}`);

        const cleaned = normalizeCardNames(it.cardNames);
        const cq = Number(it.cardQuantity);
        const addCount = Number.isFinite(cq) && cq >= 0 ? cq : cleaned.length;
        cardTotal += addCount;

        cleaned.forEach((desc) => pairs.push({ title: name, desc }));
      });

      const cards = aggregateCardsByMenu(pairs);

      return {
        sig,
        tableId: tableIdForDisplay,
        num: `테이블 ${tableIdForDisplay}`,
        menu: menuLines,
        cardCount: `주문카드 ${cardTotal}장`,
        cards,
        id: `srv-${tableIdForDisplay}-${sig}`,
        createdAt: new Date().toISOString(),
      };
    });
  };

  // 로컬 -> 화면 모델
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

        const displayTableId = computeDisplayTableId(e.tableId);

        const model = {
          ...e,
          tableId: displayTableId,
          num: `테이블 ${displayTableId}`,
          cards,
          cardCount: `주문카드 ${sumCount}장`,
        };
        return { ...model, sig: orderSignatureFromTable(model) };
      });
    } catch {
      return [];
    }
  };

  // 서버/로컬 병합 (서버 우선, 중복 제거)
  const mergeBySignature = (serverArr, localArr) => {
    const bySig = new Map();
    serverArr.forEach((x) => bySig.set(x.sig, x));
    localArr.forEach((x) => { if (!bySig.has(x.sig)) bySig.set(x.sig, x); });
    return Array.from(bySig.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // 서버 우선, 실패 시 로컬
  const loadOwnerOrders = async () => {
    const hidden = readHiddenSigs();
    try {
      const res = await axios.get('/api/orders/current', { withCredentials: true });
      const arr = res?.data || [];
      const srv = transformOrders(arr);
      const loc = readLocalOrders();
      const merged = mergeBySignature(srv, loc).filter((t) => !hidden.has(t.sig));
      setTables(merged);
    } catch {
      setTables(readLocalOrders().filter((t) => !hidden.has(t.sig)));
    }
  };

  // 언어 통계
  const langLabel = (code) => {
    switch ((code || '').toUpperCase()) {
      case 'KO': return '한국';
      case 'JAN':
      case 'JAP': return '일본';
      case 'ENG': return '영어권';
      case 'CHA':
      case 'CHN': return '중국';
      default: return code || '';
    }
  };
  const fmtPct = (v) => `${Math.round(Number(v || 0))}%`;

  const loadLanguageStats = async () => {
    try {
      const res = await axios.get('/api/statistics/languages', {
      params: { userId: 1 },
      withCredentials: true,
      });
      const arr = Array.isArray(res?.data) ? res.data : [];
      const sorted = [...arr].sort((a, b) => (b.percentage || 0) - (a.percentage || 0)).slice(0, 3);
      setLangStats(sorted);
    } catch { setLangStats([]); }
  };

  useEffect(() => {
    loadOwnerOrders();
    loadLanguageStats();
    const iv = setInterval(() => {
      loadOwnerOrders();
      loadLanguageStats();
    }, 1500);
    const onStorage = (ev) => {
      if (ev.key === 'owner_live_orders' || ev.key === 'owner_hidden_sigs' || ev.key === 'orderDraft_v1') {
        loadOwnerOrders();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(iv); window.removeEventListener('storage', onStorage); };
  }, []);

  const top1 = langStats[0] || { language: '', percentage: 0 };
  const top2 = langStats[1] || { language: '', percentage: 0 };
  const top3 = langStats[2] || { language: '', percentage: 0 };

  return (
    <div className='ownerhomef_wrap container'>
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

        <div className="rank">
          <div className="rank_first">
            <div className="rnum">1</div>
            <div className="rank_line">
              <span className='contry'>{langLabel(top1.language)}</span>
              <span className="precent">{fmtPct(top1.percentage)}</span>
            </div>
          </div>
          <div className="rank_second">
            <div className="rnum">2</div>
            <div className="rank_line">
              <span className='contry'>{langLabel(top2.language)}</span>
              <span className="precent">{fmtPct(top2.percentage)}</span>
            </div>
          </div>
          <div className="rank_third">
            <div className="rnum">3</div>
            <div className="rank_line"></div>
            <span className="country">{langLabel(top3.language)}</span>
            <span className="percent">{fmtPct(top3.percentage)}</span>
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
