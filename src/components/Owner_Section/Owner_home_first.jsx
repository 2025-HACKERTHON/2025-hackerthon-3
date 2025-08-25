// src/components/Owner_Section/Owner_home_first.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 폴링 제어용 상수
  const BASE_INTERVAL_MS = 8000;     // 기본 폴링 주기
  const MAX_INTERVAL_MS = 60000;     // 최대 백오프 주기
  const LANG_MIN_INTERVAL_MS = 30000;// 언어 통계 최소 재조회 간격

  // 폴링 제어용 ref
  const pollTimerRef = useRef(null);
  const inFlightRef = useRef(false);
  const backoffRef = useRef(BASE_INTERVAL_MS);
  const etagRef = useRef(null);
  const abortRef = useRef(null);
  const lastLangAtRef = useRef(0);

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
  // 표시용 테이블 번호 계산: 숫자, 문자열("테이블 3", "1번"), 객체({id:3}, {tableId:3}, {num:"테이블 3"}) 모두 처리
  const computeDisplayTableId = (raw) => {
    const pick = (v) => {
      // 숫자면 바로
      if (typeof v === 'number') return v;
      // 문자열이면 첫 숫자만 추출
      if (typeof v === 'string') {
        const m = v.match(/\d+/);
        return m ? Number(m[0]) : NaN;
      }
      // 객체면 흔한 키들을 검사
      if (v && typeof v === 'object') {
        const cands = [
          v.tableId, v.tableNo, v.tableNumber, v.table_id,
          v.table?.id, v.table?.tableId, v.table?.no,
          v.num, v.name, v.title // 예: "테이블 3"
        ];
        for (const cand of cands) {
          const n = pick(cand);
          if (Number.isFinite(n) && n > 0) return n;
        }
      }
      return NaN;
    };

    const n = pick(raw);
    if (Number.isFinite(n) && n > 0) return n;

    // 서버에서 못 얻으면 로컬 선택값으로 폴백
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
      const tableIdForDisplay = computeDisplayTableId(o);
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

        const displayTableId = computeDisplayTableId(e);

        const model = {
          ...e,
          tableId: displayTableId,
          num: `테이블 ${displayTableId}`,
          cards,
          cardCount: `주문카드 ${sumCount}장`,
        };
        return { ...model, sig: orderSignatureFromTable(model), createdAt: e.createdAt || new Date().toISOString(), id: e.id || `local-${displayTableId}-${Date.now()}` };
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
  const loadOwnerOrdersOnce = async () => {
    const hidden = readHiddenSigs();

    // 중복 요청 방지
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    // 이전 요청 취소
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const headers = {};
      // 조건부 요청: 서버가 ETag를 지원하는 경우 304로 응답 가능
      if (etagRef.current) {
        headers['If-None-Match'] = etagRef.current;
      }

      const res = await axios.get('https://www.taekyeong.shop/api/orders/current', {
        params: { userId: 1 },
        withCredentials: true,
        headers,
        signal: controller.signal,
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      });

      // ETag 보관
      const et = res.headers?.etag || res.headers?.ETag;
      if (et) etagRef.current = et;

      let merged;
      if (res.status === 304) {
        // 변경 없음. 기존 상태 유지
        merged = tables;
      } else {
        // 서버가 배열 또는 { result: [] } 둘 다 대응
        const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.result) ? res.data.result : []);
        const srv = transformOrders(arr).filter((t) => !hidden.has(t.sig));
        const loc = readLocalOrders().filter((t) => !hidden.has(t.sig));
        merged = mergeBySignature(srv, loc);
      }

      setTables(merged);
      // 성공 시 백오프 초기화
      backoffRef.current = BASE_INTERVAL_MS;
      return true;
    } catch {
      // 실패 시 로컬 폴백
      const hidden = readHiddenSigs();
      setTables(readLocalOrders().filter((t) => !hidden.has(t.sig)));
      // 백오프 증가
      backoffRef.current = Math.min(Math.max(backoffRef.current * 2, BASE_INTERVAL_MS), MAX_INTERVAL_MS);
      return false;
    } finally {
      inFlightRef.current = false;
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

  const loadLanguageStatsOnce = async () => {
    const now = Date.now();
    if (now - lastLangAtRef.current < LANG_MIN_INTERVAL_MS) return; // 너무 잦은 호출 방지
    lastLangAtRef.current = now;

    try {
      const res = await axios.get('https://www.taekyeong.shop/api/statistics/languages', {
        params: { userId: 1 },
        withCredentials: true,
      });
      const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.result) ? res.data.result : []);
      const sorted = [...arr].sort((a, b) => (b.percentage || 0) - (a.percentage || 0)).slice(0, 3);
      setLangStats(sorted);
    } catch {
      // 실패 시 유지
    }
  };

  // 가시성 기반 폴링 루프
  const scheduleNext = (delay) => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = setTimeout(runLoopOnce, delay);
  };

  const runLoopOnce = async () => {
    // 문서가 보이지 않으면 폴링 중단
    if (document.visibilityState !== 'visible') {
      // 보일 때 다시 시작
      return;
    }
    // 주문 갱신
    const ok = await loadOwnerOrdersOnce();
    // 언어 통계는 덜 자주
    loadLanguageStatsOnce();
    // 다음 실행 예약
    scheduleNext(ok ? BASE_INTERVAL_MS : backoffRef.current);
  };

  useEffect(() => {
    // 최초 1회 즉시 실행
    runLoopOnce();

    // 가시성 변화에 따라 폴링 시작/정지
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        // 즉시 한 번 실행하고 루프 재개
        runLoopOnce();
      } else {
        // 숨겨지면 타이머 정지 및 진행 중 요청 취소
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        if (abortRef.current) abortRef.current.abort();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // 포커스/페이지쇼 시 즉시 한 번 업데이트
    const onFocus = () => runLoopOnce();
    const onPageShow = () => runLoopOnce();
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);

    // 로컬스토리지 이벤트는 디바운스 후 반영
    let storageT;
    const onStorage = (ev) => {
      if (ev.key === 'owner_live_orders' || ev.key === 'owner_hidden_sigs' || ev.key === 'orderDraft_v1') {
        if (storageT) clearTimeout(storageT);
        storageT = setTimeout(() => runLoopOnce(), 200);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (abortRef.current) abortRef.current.abort();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const top1 = langStats[0] || { language: '', percentage: 0 };
  const top2 = langStats[1] || { language: '', percentage: 0 };
  const top3 = langStats[2] || { language: '', percentage: 0 };

  // 상단 import/변수들 아래에 추가
const [storeName, setStoreName] = useState('가게명');
const userId = 1; // Menu_Edit에서 쓰는 것과 동일하게 맞추세요

useEffect(() => {
  // 1) 로컬 우선 반영 (화면 전환 즉시 보여주기)
  const saved = localStorage.getItem('restaurantName');
  if (saved) setStoreName(saved);
https://www.taekyeong.shop
  // 2) 서버 값으로 최종 동기화 (정확한 값 보장)
  axios.get(`https://www.taekyeong.shop/api/store/${userId}`)
    .then(res => {
      const nm = res?.data?.restaurantName;
      if (nm) {
        setStoreName(nm);
        // 혹시 로컬에도 최신 반영
        localStorage.setItem('restaurantName', nm);
      }
    })
    .catch(() => {/* 실패 시 로컬 값 유지 */});
}, []);


  return (
    <div id='ownerhomef_wrap' className='container'>
      <div className="header">
        <button
          className="qr"
          onClick={() => navigate('/menu_edit')}
        >
          <img src={qr_btn} alt="QR 버튼" />
        </button>
      </div>

      <div className="text">
        <h1>RESTAURANT</h1>
        <h2>{storeName}</h2>
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
                      <p className="desc">
                        {c.desc}
                        <span className="table_no">{" "}– 테이블 {t.tableId}</span>
                      </p>
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
