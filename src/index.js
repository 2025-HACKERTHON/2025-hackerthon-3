import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Owner_App from './Onwer_App'
import './assets/sass/style.scss'
import './assets/sass/section/menu_detail.scss'
import './assets/sass/section/onboarding.scss'
import './assets/sass/section/login.scss'
import './assets/sass/section/signup.scss'
import './assets/sass/section/store_info.scss'
import './assets/sass/section/Owner_menu_language.scss'
import './assets/sass/section/Owner_QR.scss'

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
        id: nameKo || idx,  // 임시 id
        menuId: undefined,  // API 연동 시 서버에서 매핑
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
      t.closest('.order_btn') ||   // "담기/주문" 버튼
      t.closest('.cart_icon')       // 장바구니 아이콘 이동 직전 저장
    ) {
      // DOM의 수량 텍스트가 반영된 뒤 저장되도록
      setTimeout(persist, 0);
    }
  }

  // 메뉴 화면에서만 동작(있으면)
  function onRoute() {
    const isMenu = document.getElementById('Menu_wrap');
    if (isMenu) {
      document.removeEventListener('click', handleClick);
      document.addEventListener('click', handleClick);
    }
  }

  // 첫 진입 + SPA 라우팅 대비
  document.addEventListener('DOMContentLoaded', onRoute);
  window.addEventListener('load', onRoute);

  // 간단한 MutationObserver로 메뉴 DOM 생겼을 때도 한 번 저장
  const obs = new MutationObserver(() => {
    if (document.getElementById('Menu_wrap')) {
      persist();
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <Owner_App />
  </React.StrictMode>
);

