import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import back from '../../assets/img/owner_menu_edit/back.svg';
import qr from '../../assets/img/owner_menu_edit/qr.svg';
import edit from '../../assets/img/owner_menu_edit/edit.svg';

const Menu_Edit_Popup2 = () => {
  const userId = '17';
  const navigate = useNavigate();
  const { id } = useParams(); // URL에서 id 파라미터를 가져옵니다. 예: /.../123 또는 /.../new
  const location = useLocation();

  // 'id'가 'new'가 아니면 수정 모드, 'new'이면 추가 모드
  const isEditMode = id !== 'new';
  const sectionId = isEditMode ? Number(id) : null;

  // 수정 모드일 때는 location.state에서, 추가 모드일 때는 빈 값으로 초기화
  const initialData = isEditMode ? location.state?.sectionData : { nameKo: '', description: '', price: '', imageUrl: null };
  
  const [info, setInfo] = useState(initialData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl);
  const [restaurantName, setRestaurantName] = useState('');
  const fileInputRef = useRef();

  // 페이지 로드 시 localStorage에서 가게 이름을 가져옵니다.
  useEffect(() => {
    setRestaurantName(localStorage.getItem('restaurantName') || '가게 이름');
  }, []);


  const handleChange = e => {
    const { name, value } = e.target;
    // 가격 필드는 숫자만 입력되도록 처리
    if (name === 'price') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setInfo(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const onSave = async () => {
    if (!info.nameKo || !info.price) {
        alert('메뉴명과 가격은 필수 항목입니다.');
        return;
    }
      
    const formData = new FormData();
    formData.append('nameKo', info.nameKo);
    formData.append('description', info.description);
    formData.append('price', info.price);


    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (isEditMode) { // 수정 모드 (PUT 요청)
        const API_URL = `https://www.taekyeong.shop/api/store/${userId}/settings/menu_info/id/${sectionId}`;
        await axios.put(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('메뉴가 성공적으로 수정되었습니다.');
      } else { // 추가 모드 (POST 요청)
        const API_URL = `https://www.taekyeong.shop/api/store/${userId}/settings/menu_info`;
        await axios.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('메뉴가 성공적으로 추가되었습니다.');
      }

      // 저장 성공 후, 메인 메뉴 편집 페이지로 돌아갑니다.
      // 이 페이지는 돌아가면 useEffect를 통해 자동으로 최신 목록을 불러옵니다.
      navigate('/menu_edit');

    } catch (error) {
      console.error('메뉴 저장/수정 실패:', error);
      alert('메뉴 저장/수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div id="Menu_Edit_Popup2_Wrap" className="container">
      <div className="popup">
        <div className="popup_img" onClick={handleButtonClick} style={{ cursor: 'pointer' }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          {imagePreview ? <img src={imagePreview} alt="업로드 이미지" /> : <>이미지를<br />추가해주세요.</>}
        </div>
        <div className="popup_content">
          <input type="text" className="name" name="nameKo" value={info.nameKo} onChange={handleChange} placeholder="메뉴명" />
          <textarea name="description" className="info" value={info.description} onChange={handleChange} placeholder="메뉴 설명"></textarea>
          <input type="text" className="price1" name="price" value={info.price} onChange={handleChange} placeholder="메뉴 가격" />
          <div className="price2">원</div>
        </div>
        <div className="popup_btn">
          <button className="btn1" onClick={onSave}>완료</button>
          <button className="btn2" type="button" onClick={handleGoBack}>취소</button>
        </div>
      </div>

      <div className="popup_bg"></div>

      <header>
        <div className="icon">
          <img src={back} className="back_icon" alt="뒤로가기" onClick={handleGoBack} style={{ cursor: 'pointer' }} />
          <img src={qr} className="qr_icon" alt="QR코드" />
        </div>
        <div className="header"></div>
      </header>
      
      {/* 배경 컨텐츠는 동적으로 가져온 가게 이름으로 표시 */}
      <main>
        <div className="store_info">
          <div className="title">{isEditMode ? 'MENU EDIT' : 'MENU ADD'}</div>
          <div className="store">
            <h1>{restaurantName}</h1>
          </div>
        </div>
        {/* ... (이하 생략) ... */}
      </main>
    </div>
  );
};

export default Menu_Edit_Popup2;