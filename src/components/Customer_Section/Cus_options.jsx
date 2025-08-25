import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import back_btn from '../../assets/img/cus_order/back_btn.svg';
import qr_btn from '../../assets/img/cus_order/qr_btn.svg';
import trans_btn from '../../assets/img/cus_order/trans_btn.svg';
import op01 from '../../assets/img/cus_options/op01.png';
import op02 from '../../assets/img/cus_options/op02.png';
import op03 from '../../assets/img/cus_options/op03.png';
import op04 from '../../assets/img/cus_options/op04.png';
import op05 from '../../assets/img/cus_options/op05.png';
import op06 from '../../assets/img/cus_options/op06.png';
import op07 from '../../assets/img/cus_options/op07.png';
import op08 from '../../assets/img/cus_options/op08.png';

const DRAFT_KEY = 'orderDraft_v1';

const Cus_options = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  // Cus_order에서 전달된 대상 아이템 index
  const stateIndex = location.state?.itemIndex;
  const queryIndex = Number.parseInt(search.get('item'), 10);
  const targetIndex = Number.isInteger(stateIndex)
    ? stateIndex
    : Number.isInteger(queryIndex)
    ? queryIndex
    : 0;

  const options = useMemo(
    () => [
      { title: '덜 맵게 해주세요', img: op01, iconClass: 'icon' },
      { title: '계란 빼주세요', img: op02, iconClass: 'icon' },
      { title: '간을 약하게 해주세요', img: op03, iconClass: 'icon3' },
      { title: '소스를 따로 주세요', img: op04, iconClass: 'icon4' },
      { title: '비건 변경을 원해요', img: op05, iconClass: 'icon' },
      { title: '마늘 빼주세요', img: op06, iconClass: 'icon' },
      { title: '유제품 빼주세요', img: op07, iconClass: 'icon' },
      { title: '밥을 많이 주세요', img: op08, iconClass: 'icon' },
      { title: '밥을 조금 주세요', img: op08, iconClass: 'icon' },
    ],
    []
  );

  // 선택 상태: 옵션 index 집합(해당 아이템에 한함)
  const [selected, setSelected] = useState(new Set());

  // 초기에 draft에서 해당 아이템의 기존 cardNames를 읽어와 선택 반영
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      const items = Array.isArray(draft?.items) ? draft.items : [];
      const it = items[targetIndex];
      const names = Array.isArray(it?.cardNames)
        ? it.cardNames
        : typeof it?.cardNames === 'string'
        ? String(it.cardNames).split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const idxSet = new Set();
      options.forEach((opt, i) => {
        if (names.includes(opt.title)) idxSet.add(i);
      });
      setSelected(idxSet);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex]);

  // draft 저장 함수(해당 아이템만 갱신)
  function applySelectionsToDraftForIndex(titles, idx) {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || !Array.isArray(draft.items)) return;
      if (idx < 0 || idx >= draft.items.length) return;

      const merged = Array.from(new Set(titles));
      const nextItems = draft.items.map((it, i) =>
        i === idx ? { ...it, cardNames: merged, cardQuantity: merged.length } : it
      );

      const nextDraft = { ...draft, items: nextItems };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(nextDraft));
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: DRAFT_KEY }));
      } catch {}
    } catch {}
  }

  const toggleOption = (idx) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);

      const titles = Array.from(next).map((i) => options[i].title);
      applySelectionsToDraftForIndex(titles, targetIndex);

      return next;
    });
  };

  return (
    <div id='cusoptions_wrap'  className='container'>
      <div className="header">
        <button className="back_btn" onClick={() => navigate('/cus_order')}>
          <img src={back_btn} alt="뒤로가기" />
        </button>
        <div className="right_btns">
          <button className="qr"><img src={qr_btn} alt="" /></button>
          <button className="trans"><img src={trans_btn} alt="" /></button>
        </div>
      </div>

      <div className="cp_main">
        <h1>ORDER CARD</h1>

        {options.map((opt, idx) => {
          const isSelected = selected.has(idx);
          return (
            <div
              key={idx}
              className={`opts ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleOption(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOption(idx); }}
            >
              <div className="opts_left">
                <span className='title'>{opt.title}</span>
                <div className={opt.iconClass}><img src={opt.img} alt="" /></div>
              </div>
              <div className="opts_right">
                <button className="add">{isSelected ? '삭제' : '추가'}</button>
              </div>
            </div>
          );
        })}

        <div className="cart">
          <div className="cart_left">주문 카트</div>
          <div className="cart_right">{selected.size}개</div>
        </div>
      </div>
    </div>
  );
};

export default Cus_options;
