import React, { useEffect, useState } from 'react';
import table from '../../assets/img/cus_menu/table.svg';

const numbers = [1,2,3,4,5,6,7,8,9,10];

function NumberSelector() {
  const [mode, setMode] = useState('circle'); // 'circle' | 'selector' | 'selected'
  const [selected, setSelected] = useState(null);

  // 초기 값: 저장된 테이블 번호가 있으면 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem('orderDraft_v1');
      if (!raw) return;
      const p = JSON.parse(raw);
      const n = Number(p?.tableId ?? p?.selectedTableId);
      if (Number.isFinite(n) && n > 0) {
        setSelected(n);
        setMode('selected');
      }
    } catch {}
  }, []);

  // 선택 저장 함수 (핵심)
  const saveSelectedTable = (n) => {
    setSelected(n);
    setMode('selected');

    try {
      const raw = localStorage.getItem('orderDraft_v1');
      const prev = raw ? JSON.parse(raw) : {};
      const next = {
        ...prev,
        tableId: n,              // 백엔드로 보낼 표준 키
        selectedTableId: n,      // 혹시 모를 다른 화면 호환
      };
      localStorage.setItem('orderDraft_v1', JSON.stringify(next));

      // 다른 탭/컴포넌트 갱신용 이벤트
      window.dispatchEvent(new StorageEvent('storage', { key: 'orderDraft_v1' }));
    } catch {}
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
      {mode === 'circle' && (
        <div
          style={{
            width:57, height:57, borderRadius:'50%', background:'#58C9F3',
            display:'flex', justifyContent:'center', alignItems:'center',
            fontSize:48, cursor:'pointer',
          }}
          onClick={() => setMode('selector')}
        >
          <img src={table} alt="" style={{ width:23, height:28 }}/>
        </div>
      )}

      {mode === 'selector' && (
        <div
          style={{
            width:57, height:170, borderRadius:28, background:'#58C9F3',
            display:'flex', flexDirection:'column', justifyContent:'center',
            alignItems:'center', overflowY:'scroll'
          }}
        >
          {numbers.map(n => (
            <div
              key={n}
              style={{ fontSize:20, margin:10, cursor:'pointer', color:'white' }}
              onClick={() => saveSelectedTable(n)}
            >
              {n}
            </div>
          ))}
        </div>
      )}

      {mode === 'selected' && (
        <div
          style={{
            width:57, height:57, borderRadius:'50%', background:'#58C9F3', color:'#fff',
            display:'flex', justifyContent:'center', alignItems:'center', fontSize:20, cursor:'pointer'
          }}
          onClick={() => setMode('selector')}
          title="테이블 번호 변경"
        >
          {selected}
        </div>
      )}
    </div>
  );
}

export default NumberSelector;
