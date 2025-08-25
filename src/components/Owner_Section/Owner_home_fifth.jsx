// src/components/Owner_Section/Owner_home_fifth.jsx
import React, { useEffect, useRef, useState } from 'react';
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

  // 폴링 제어 상수
  const BASE_INTERVAL_MS = 8000;      // 주문 목록 폴링 기본 주기
  const MAX_INTERVAL_MS = 60000;      // 주문 목록 폴링 최대 백오프
  const RATING_MIN_INTERVAL_MS = 10000; // 최신 별점 최소 호출 간격

  // 폴링 제어용 ref
  const pollTimerRef = useRef(null);
  const inFlightOrdersRef = useRef(false);
  const inFlightRatingRef = useRef(false);
  const backoffRef = useRef(BASE_INTERVAL_MS);
  const ordersEtagRef = useRef(null);
  const ordersAbortRef = useRef(null);
  const lastRatingAtRef = useRef(0);

  // 세션 쿠키 존재 여부(세션 방식일 때만 사용. JWT면 무시)
  const hasSession = () => {
    try {
      return document.cookie.split(';').some(c => c.trim().startsWith('JSESSIONID='));
    } catch { return false; }
  };

  // 상태
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
  const [avgRating, setAvgRating] = useState(4); // 기본값 4

  // 공통 유틸
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
      // 로컬 브릿지에서도 제거
      const raw = localStorage.getItem('owner_live_orders');
      const arr = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((e) => orderSignatureFromTable(e) !== sig);
      localStorage.setItem('owner_live_orders', JSON.stringify(filtered));
      // 다른 탭 반영
      window.dispatchEvent(new StorageEvent('storage', { key: 'owner_hidden_sigs' }));
    } catch { }
  };

  // 서버 → 화면 모델
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

  // 로컬 → 화면 모델
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

  // 서버/로컬 병합 (서버 우선, 숨김 필터 적용)
  const mergeBySignature = (serverArr, localArr, hidden) => {
    const bySig = new Map();
    serverArr.forEach((x) => { if (!hidden.has(x.sig)) bySig.set(x.sig, x); });
    localArr.forEach((x) => { if (!hidden.has(x.sig) && !bySig.has(x.sig)) bySig.set(x.sig, x); });
    return Array.from(bySig.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // 주문 1회 로드: ETag 조건부 요청, 실패 시 지수 백오프
  async function loadOwnerOrdersOnce() {
    const hidden = readHiddenSigs();

    if (inFlightOrdersRef.current) return true;
    inFlightOrdersRef.current = true;

    if (ordersAbortRef.current) ordersAbortRef.current.abort();
    const controller = new AbortController();
    ordersAbortRef.current = controller;

    try {
      if (!hasSession()) {
        setTables(mergeBySignature([], readLocalOrders(), hidden));
        backoffRef.current = BASE_INTERVAL_MS;
        return true;
      }

      const headers = {};
      if (ordersEtagRef.current) headers['If-None-Match'] = ordersEtagRef.current;

      const res = await api.get('https://www.taekyeong.shop/api/orders/current', {
        headers,
        signal: controller.signal,
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      });

      const et = res.headers?.etag || res.headers?.ETag;
      if (et) ordersEtagRef.current = et;

      if (res.status === 304) {
        backoffRef.current = BASE_INTERVAL_MS;
        return true;
      }

      const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.result) ? res.data.result : []);
      const srv = transformOrders(arr);
      const loc = readLocalOrders();
      setTables(mergeBySignature(srv, loc, hidden));

      backoffRef.current = BASE_INTERVAL_MS;
      return true;
    } catch {
      setTables(mergeBySignature([], readLocalOrders(), hidden));
      backoffRef.current = Math.min(Math.max(backoffRef.current * 2, BASE_INTERVAL_MS), MAX_INTERVAL_MS);
      return false;
    } finally {
      inFlightOrdersRef.current = false;
    }
  }

  // 최신 별점 1회 로드: 최소 호출 간격 보장
  async function loadLatestRatingOnce() {
    const now = Date.now();
    if (now - lastRatingAtRef.current < RATING_MIN_INTERVAL_MS) return;
    if (inFlightRatingRef.current) return;
    inFlightRatingRef.current = true;
    lastRatingAtRef.current = now;

    try {
      const res = await api.get('https://www.taekyeong.shop/api/order-ratings/recent?limit=1 주문 평가 조회	/api/order-ratings/recent?limit=1');
      const star = Number(
        res?.data?.star ??
        (Array.isArray(res?.data) ? res.data[0]?.star : undefined) ??
        res?.data?.result?.star
      );
      if (Number.isFinite(star) && star >= 1 && star <= 5) {
        setAvgRating(star);
      }
    } catch {
      // 실패 시 기존 값 유지
    } finally {
      inFlightRatingRef.current = false;
    }
  }

  // 가시성 기반 폴링 루프
  const scheduleNext = (delay) => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = setTimeout(runLoopOnce, delay);
  };

  const runLoopOnce = async () => {
    if (document.visibilityState !== 'visible') return;
    const ok = await loadOwnerOrdersOnce();
    await loadLatestRatingOnce();
    scheduleNext(ok ? BASE_INTERVAL_MS : backoffRef.current);
  };

  useEffect(() => {
    // 최초 1회 실행
    runLoopOnce();

    // 가시성 변화에 따라 폴링 시작/정지
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        runLoopOnce();
      } else {
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        if (ordersAbortRef.current) ordersAbortRef.current.abort();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // 포커스/페이지쇼 시 즉시 갱신
    const onFocus = () => runLoopOnce();
    const onPageShow = () => runLoopOnce();
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);

    // 로컬스토리지 변화는 디바운스로 묶어 과도한 호출 방지
    let storageT;
    const onStorage = (ev) => {
      if (
        ev.key === 'owner_live_orders' ||
        ev.key === 'owner_hidden_sigs' ||
        ev.key === 'orderDraft_v1'
      ) {
        if (storageT) clearTimeout(storageT);
        storageT = setTimeout(() => runLoopOnce(), 200);
      }
      // 같은 기기에서 별점 남겼을 때 즉시 반영하고 싶다면 아래 키를 Cus_order에서 setItem 해주면 된다.
      // if (ev.key === 'owner_latest_rating_hint') runLoopOnce();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (ordersAbortRef.current) ordersAbortRef.current.abort();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 별점 카드 표현
  const score = Math.max(1, Math.min(5, Math.round(avgRating)));

  const TITLE_BY_SCORE = {
    1: '주문이 너무 불편했어요...',
    2: '메뉴나 기능이 헷갈렸어요',
    3: '그럭저럭 쓸 수 있었어요',
    4: '잘 썼고 편했어요',
    5: '엄청 편했어요! 또 이용할래요!',
  };

  const DETAIL_BY_SCORE = {
    1: 'QR 안내 위치나 테이블 인식 상태, 번역 상태를 다시 확인하면 좋습니다.',
    2: '중요 메뉴나 추천 메뉴가 눈에 띄지 않거나, 추가 요청 카드 위치가 분명하지 않았을 수 있습니다.',
    3: '요청사항 선택이나 결제 단계에서 약간의 고민이 있었을 수 있습니다.',
    4: '추천 메뉴와 요청사항 반영이 잘 동작했습니다. 외국어 표현을 한 번 더 점검해보세요.',
    5: 'QR 진입부터 결제까지 매끄럽게 연결되었습니다. 지금처럼 운영하면 재방문율이 더 올라갈 것입니다.',
  };

  // 상단 import/변수들 아래에 추가
  const [storeName, setStoreName] = useState('가게명');
  const userId = 1; // Menu_Edit에서 쓰는 것과 동일하게 맞추세요

  useEffect(() => {
    // 1) 로컬 우선 반영 (화면 전환 즉시 보여주기)
    const saved = localStorage.getItem('restaurantName');
    if (saved) setStoreName(saved);

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
      .catch(() => {/* 실패 시 로컬 값 유지 */ });
  }, []);


  return (
    <div id='ownerhomefifth_wrap' className='container'>
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
                    <strong className="card_title">{c.title}</strong>
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

        {/* 최신 별점 표시: 최소 간격으로만 폴링하며 가시성 기반으로 동작 */}
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
