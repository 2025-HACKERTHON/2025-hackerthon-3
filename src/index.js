import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';               // 손님용
import Owner_App from './Onwer_App';   // 사장용 (파일명 오타 유지)
import './assets/sass/style.scss';
import './assets/sass/section/menu_detail.scss';
import './assets/sass/section/onboarding.scss';
import './assets/sass/section/login.scss';
import './assets/sass/section/signup.scss';
import './assets/sass/section/store_info.scss';
import './assets/sass/section/Owner_menu_language.scss';
import './assets/sass/section/Owner_QR.scss';

// ===== Minimal cart sync (no Menu.jsx changes) =====
(function setupCartSync() {
  const KEY = 'orderDraft_v1';

  function readCards() {
    const cards = document.querySelectorAll('.menu_card');
    const items = [];
    cards.forEach((card, idx) => {
      const nameEl = card.querySelector('.text h1');
      if (!nameEl) return;
      const nameKo = (nameEl.textContent || '').trim();

      const descEl = card.querySelector('.text p');
      const priceEl = card.querySelector('.text .price');
      const cntEl = card.querySelector('.order_count .count');

      const quantity = cntEl ? parseInt(cntEl.textContent.trim(), 10) || 0 : 0;
      if (quantity <= 0) return;

      const description = descEl ? descEl.textContent : '';
      const price = priceEl ? parseInt(priceEl.textContent.replace(/[^\d]/g, ''), 10) : null;

      items.push({
        id: nameKo || idx,
        menuId: undefined,
        nameKo,
        description,
        price,
        quantity,
        language: 'KO',
        cardQuantity: 0,
        cardNames: '',
      });
    });
    return items;
  }

  function persist() {
    const items = readCards();
    localStorage.setItem(KEY, JSON.stringify({ items, savedAt: Date.now(), userId: 1 }));
  }

  function handleClick(e) {
    const t = e.target;
    if (
      t.closest('.count_plus') ||
      t.closest('.count_minus') ||
      t.closest('.order_btn') ||
      t.closest('.cart_icon')
    ) {
      setTimeout(persist, 0);
    }
  }

  function onRoute() {
    const isMenu = document.getElementById('Menu_wrap');
    if (isMenu) {
      document.removeEventListener('click', handleClick);
      document.addEventListener('click', handleClick);
    }
  }

  document.addEventListener('DOMContentLoaded', onRoute);
  window.addEventListener('load', onRoute);

  const obs = new MutationObserver(() => {
    if (document.getElementById('Menu_wrap')) {
      persist();
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      {/* 사장 화면: /owner/* 네임스페이스 고정 */}
      <Route path="/owner/*" element={<Owner_App />} />
      {/* 손님 화면: 기본 루트 트리 */}
      <Route path="/*" element={<App />} />
      {/* 알 수 없는 경로는 루트로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
