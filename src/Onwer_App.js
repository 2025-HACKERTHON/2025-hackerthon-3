import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Onboarding from './components/Owner_Section/Onboarding';
import Login from './components/Owner_Section/Login';
import Signup from './components/Owner_Section/Signup';
import Store_info from './components/Owner_Section/Store_info';

import Owner_home_first from './components/Owner_Section/Owner_home_first';
import Owner_home_second from './components/Owner_Section/Owner_home_second';
import Owner_home_third from './components/Owner_Section/Owner_home_third';
import Owner_home_fourth from './components/Owner_Section/Owner_home_fourth';
import Owner_home_fifth from './components/Owner_Section/Owner_home_fifth';

import Menu_English from './components/Owner_Section/Menu_English';
import Menu_Japanese from './components/Owner_Section/Menu_Japanese';
import Menu_Chinese from './components/Owner_Section/Menu_Chinese';
import Owner_QR from './components/Owner_Section/Owner_QR';

import Menu_Edit from './components/Owner_Section/Menu_Edit';
import Menu_Edit_Popup1 from './components/Owner_Section/Menu_Edit_Popup1';
import Menu_Edit_Popup2 from './components/Owner_Section/Menu_Edit_Popup2';

const Owner_App = () => {
  // (필요하면 사장 쪽 상태/함수들 여기에 배치)
  const [menuSections, setMenuSections] = useState([
    { id: 0, name: '', description: '', price: '', imagePreviewUrl: null },
  ]);

  const addMenuSection = () => {
    setMenuSections(prev => [
      ...prev,
      { id: prev.length, name: '', description: '', price: '' },
    ]);
  };

  const updateMenuSection = (id, newdata) => {
    setMenuSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, ...newdata } : section
      )
    );
  };

  const deleteMenuSection = (id) => {
    setMenuSections(prev => prev.filter(section => section.id !== id));
  };

  const [storeInfo, setStoreInfo] = useState({
    name: '',
    description: '',
    detail: '',
    address: '',
  });

  const [selectedTags, setSelectedTags] = useState([]);
  const saveStoreData = (info, tags) => {
    setStoreInfo(info);
    setSelectedTags(tags);
  };
  const saveTags = (tags) => setSelectedTags(tags);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const saveImage = (file, previewUrl) => {
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
  };

  return (
    // 부모(index.js)에서 /owner/*로 들어오기 때문에
    // 아래 자식 경로는 "앞에 슬래시(/) 없이" 작성해야 /owner/ 뒤에 붙는다.
    <Routes>
      {/* 사장 홈 슬라이드들 */}
      <Route path="owner_home_first" element={<Owner_home_first />} />
      <Route path="owner_home_second" element={<Owner_home_second />} />
      <Route path="owner_home_third" element={<Owner_home_third />} />
      <Route path="owner_home_fourth" element={<Owner_home_fourth />} />
      <Route path="owner_home_fifth" element={<Owner_home_fifth />} />

      {/* 다국어/QR 등 사장 전용 화면들 */}
      <Route path="menu_english" element={<Menu_English />} />
      <Route path="menu_japanese" element={<Menu_Japanese />} />
      <Route path="menu_chinese" element={<Menu_Chinese />} />
      <Route path="owner_qr" element={<Owner_QR />} />

      {/* 온보딩/로그인/회원가입/가게정보 (사장 섹션, 기존 경로 유지하되 /owner/ 밑으로) */}
      <Route path="Onboarding" element={<Onboarding />} />
      <Route path="Login" element={<Login />} />
      <Route path="Signup" element={<Signup />} />
      <Route path="Storeinfo" element={<Store_info />} />

      {/* 메뉴 편집 관련 */}
      <Route
        path="menu_edit"
        element={
          <Menu_Edit
            storeInfo={storeInfo}
            selectedTags={selectedTags}
            saveTags={saveTags}
            menuSections={menuSections}
            addMenuSection={addMenuSection}
            deleteSection={deleteMenuSection}
          />
        }
      />
      <Route
        path="menu_edit_popup1"
        element={
          <Menu_Edit_Popup1
            storeInfo={storeInfo}
            selectedTags={selectedTags}
            saveStoreData={saveStoreData}
          />
        }
      />
      <Route
        path="menu_edit_popup2/:id"
        element={
          <Menu_Edit_Popup2
            menuSections={menuSections}
            updateMenuSection={updateMenuSection}
            imagePreviewUrl={imagePreviewUrl}
            saveImage={saveImage}
          />
        }
      />
    </Routes>
  );
};

export default Owner_App;
