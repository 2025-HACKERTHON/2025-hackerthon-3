// src/components/Owner_Section/Owner_home_second.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';

const Owner_home_second = () => {
  const TOTAL_PAGES = 5;
  const current = 2;
  const navigate = useNavigate();

  const PAGE_SLUGS = ['first', 'second', 'third', 'fourth', 'fifth'];
  const pathFor = (n) => `owner_home_${PAGE_SLUGS[(n - 1) % TOTAL_PAGES]}`;

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

  // 서버 쿠키 자동 전송
  axios.defaults.withCredentials = true;

  // 폴링 제어 상수
  const BASE_INTERVAL_MS = 8000;      // 기본 폴링 주기
  const MAX_INTERVAL_MS = 60000;      // 최대 백오프 주기
  const JP_MIN_INTERVAL_MS = 30000;   // 일본 베스트 3 최소 재조회 간격

  // 폴링 제어 ref
  const pollTimerRef = useRef(null);
  const inFlightRef = useRef(false);
  const backoffRef = useRef(BASE_INTERVAL_MS);
  const ordersEtagRef = useRef(null);
  const ordersAbortRef = useRef(null);
  const lastJapanAtRef = useRef(0);

  // 상태
  const [tables, setTables] = useState([]);
  const [bestMenus, setBestMenus] = useState([]); // 일본 베스트 3

  // 로컬 저장된 최근 테이블 번호 읽기
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
    if (Number.isFinite(n) && n > 0) return n;
    const fallback = getFallbackTableId();
    return fallback ?? 1;
  };

  // 서버 응답에서 카드명 배열 정규화
  const normalizeCardNames = (raw) => {
    if (Array.isArray(raw)) return raw.map((s) => String(s || '').trim()).filter(Boolean);
    if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  };

  // 고유 시그니처 생성
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

  // 서버 → 화면 모델
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
        cardTotal += cleaned.length;
        cleaned.forEach((desc) => pairs.push({ title: name, desc }));
      });

      const cards = aggregateCardsByMenu(pairs);

      return {
        sig,
        tableId: tableIdForDisplay,
        num: `테이블 ${tableIdForDisplay ?? '-'}`,
        menu: menuLines,
        cardCount: `주문카드 ${cardTotal}장`,
        cards,
        id: `srv-${tableIdForDisplay}-${sig}`,
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
        const cards = aggregateCardsByMenu(
          (e.cards || []).map((c) => ({ title: c.title, desc: c.desc }))
        );
        const sumCount = cards.reduce((a, c) => a + (c.desc ? c.desc.split(',').length : 0), 0);
        const displayTableId = computeDisplayTableId(e.tableId);
        const model = {
          ...e,
          tableId: displayTableId,
          num: e.num || (displayTableId ? `테이블 ${displayTableId}` : '테이블 -'),
          cards,
          menu: Array.isArray(e.menu) ? e.menu : [],
          cardCount: `주문카드 ${sumCount}장`,
          createdAt: e.createdAt || new Date().toISOString(),
        };
        return { ...model, sig: orderSignatureFromTable(model), id: e.id || `local-${displayTableId}-${Date.now()}` };
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

  // 현재 주문 로드: 서버 우선, 실패 시 로컬. 숨김 시그니처 필터 적용
  const loadOwnerOrdersOnce = async () => {
    const hidden = readHiddenSigs();

    // 중복 요청 방지
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    // 이전 요청 취소
    if (ordersAbortRef.current) ordersAbortRef.current.abort();
    const controller = new AbortController();
    ordersAbortRef.current = controller;

    try {
      const headers = {};
      if (ordersEtagRef.current) headers['If-None-Match'] = ordersEtagRef.current;

      const res = await axios.get('https://3.38.135.47:8080/api/orders/current', {
        withCredentials: true,
        headers,
        signal: controller.signal,
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      });

      const et = res.headers?.etag || res.headers?.ETag;
      if (et) ordersEtagRef.current = et;

      if (res.status === 304) {
        // 변경 없음
        // 성공으로 간주하고 백오프 초기화
        backoffRef.current = BASE_INTERVAL_MS;
        return true;
      }

      const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.result) ? res.data.result : []);
      const srv = transformOrders(arr).filter((t) => !hidden.has(t.sig));
      const loc = readLocalOrders().filter((t) => !hidden.has(t.sig));
      const merged = mergeBySignature(srv, loc);
      setTables(merged);

      backoffRef.current = BASE_INTERVAL_MS; // 성공 시 초기화
      return true;
    } catch {
      // 실패 시 로컬 폴백
      const hidden2 = readHiddenSigs();
      setTables(readLocalOrders().filter((t) => !hidden2.has(t.sig)));
      // 백오프 증가
      backoffRef.current = Math.min(Math.max(backoffRef.current * 2, BASE_INTERVAL_MS), MAX_INTERVAL_MS);
      return false;
    } finally {
      inFlightRef.current = false;
    }
  };

  // 일본 베스트 메뉴 3개: 최소 30초 간격
  const loadJapanTop3Once = async () => {
    const now = Date.now();
    if (now - lastJapanAtRef.current < JP_MIN_INTERVAL_MS) return;
    lastJapanAtRef.current = now;

    try {
      const res = await axios.get('https://www.taekyeong.shop/api/statistics/menus/top3/1/JAN', { withCredentials: true });
      const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.result) ? res.data.result : []);
      setBestMenus(arr.map((s) => String(s || '').trim()).filter(Boolean).slice(0, 3));
    } catch {
      // 실패 시 기존 값 유지
    }
  };

  // 가시성 기반 폴링 루프
  const scheduleNext = (delay) => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = setTimeout(runLoopOnce, delay);
  };

  const runLoopOnce = async () => {
    if (document.visibilityState !== 'visible') {
      return; // 숨겨진 상태면 폴링 중단
    }
    const ok = await loadOwnerOrdersOnce();
    loadJapanTop3Once();
    scheduleNext(ok ? BASE_INTERVAL_MS : backoffRef.current);
  };

  useEffect(() => {
    // 최초 실행
    runLoopOnce();

    // 가시성 변화
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        runLoopOnce();
      } else {
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        if (ordersAbortRef.current) ordersAbortRef.current.abort();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // 포커스/페이지쇼 시 즉시 한 번
    const onFocus = () => runLoopOnce();
    const onPageShow = () => runLoopOnce();
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);

    // 로컬스토리지 트리거는 디바운스
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
      if (ordersAbortRef.current) ordersAbortRef.current.abort();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bubble1 = bestMenus[0] || '소고기 미역국 정식';
  const bubble2 = bestMenus[1] || '제육볶음 덮밥';
  const bubble3 = bestMenus[2] || '김치전';

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
    .catch(() => {/* 실패 시 로컬 값 유지 */});
}, []);


  return (
    <div id='ownerhomes_wrap' className='container'>
      <div className="header">
              <button
                className="qr"
                onClick={() => navigate('menu_edit')}
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
