import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import back from '../../assets/img/owner_menu_edit/back.svg';
import qr from '../../assets/img/owner_menu_edit/qr.svg';
import edit from '../../assets/img/owner_menu_edit/edit.svg';

const Menu_Edit_Popup2 = () => {
  const userId = '1';
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  console.log('수정 페이지가 받은 데이터:', location.state?.sectionData);

  // URL 파라미터로 넘어온 id가 있으면 '수정', 없으면 '추가' 모드
  const sectionId = id ? Number(id) : null;
  
  // '수정' 모드일 경우, location.state에 담겨온 데이터(sectionData)를 초기값으로 사용
  // '추가' 모드일 경우, 빈 값으로 시작
  const initialData = location.state?.sectionData || { nameKo: '', description: '', price: '' };

  const [info, setInfo] = useState(initialData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl ?? null); 
  const fileInputRef = useRef();

  // 입력창(input, textarea)의 내용이 변경될 때마다 info state를 업데이트하는 함수
  const handleChange = e => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  // 이미지 파일이 선택됐을 때 미리보기를 만들고 파일 state를 업데이트하는 함수
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(previewUrl);
    }
  };

  // '이미지 추가' 버튼 클릭 시 숨겨진 file input을 클릭해주는 함수
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // '완료' 버튼 클릭 시 서버로 데이터를 전송하는 함수
  const onSave = async () => {
    const formData = new FormData();
    formData.append('nameKo', info.nameKo);
    formData.append('description', info.description);
    formData.append('price', info.price);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    try {
      let response;
      if (sectionId) { // '수정' 모드일 경우 PUT 요청
        const API_URL = `/api/store/${userId}/settings/menu_info/id/${sectionId}`;
        response = await axios.put(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('메뉴가 성공적으로 수정되었습니다.');
      } else { // '추가' 모드일 경우 POST 요청
        const API_URL = `/api/store/${userId}/settings/menu_info`;
        response = await axios.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('메뉴가 성공적으로 추가되었습니다.');
      }

      if (response.status === 200 || response.status === 201) {
        // 성공 시 메뉴 편집 페이지로 돌아가면, Menu_Edit의 useEffect가 재실행되어 목록이 새로고침됨
        navigate('/menu_edit');
      }
    } catch (error) {
      console.error('메뉴 저장/수정 실패:', error);
      alert('메뉴 저장/수정 중 오류가 발생했습니다.');
    }
  }

  return (
    <div id="Menu_Edit_Popup2_Wrap" className="container">
     <div className="popup">
       <div className="popup_img">
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
            {imagePreview ? <img src={imagePreview} alt="업로드 이미지" /> : <>이미지를<br />추가해주세요.</>}
        </div>
         <div className="popup_content">
            <input type="text" className="name" name='nameKo' value={info.nameKo} onChange={handleChange} placeholder='메뉴명' />
            <textarea name="description" id="" className="info" value={info.description} onChange={handleChange} placeholder='메뉴 설명'></textarea>
            <input type="text" className="price1" name='price' value={info.price} onChange={handleChange} placeholder='메뉴 가격' />
            <div className="price2">원</div>
         </div>
         <div className="popup_btn">
            <button className="btn1" onClick={onSave} >완료</button>
            <button className="btn2" type='button' onClick={handleButtonClick}>이미지 추가</button>
         </div>
     </div>
     <div className="popup_bg"></div>
        <header>
          <div className="icon">
            <img src={back} className="back_icon" alt="" />
            <img src={qr} className="qr_icon" alt="" />
          </div>
          <div className="header"></div>
        </header>
        <main>
          <div className="store_info">
            <div className="title">MENU EDIT</div>
            <div className="store">
              <h1>한그릇</h1>
              <div className="edit_icon">
                    <img src={edit} alt="" />
                </div>
            </div>
            <p>한국의 정을 담은 따듯한 한 끼</p>
            <div className="text">
              “한그릇”은 계절마다 바뀌는 따끈한 국물 요리와 밥
              <br />한 그릇을 정성스럽게 차려내는 따뜻한 동네 식당입니다.
            </div>
            <div className="map">서울 서대문구 홍제5동 하나빌딩 1층</div>
            <div className="tags">
              <div className="tag">매운맛 조절 가능</div>
              <div className="tag">비건 변경 가능</div>
            </div>
          </div>
          <div className="title">메뉴 편집</div>
          <div className="menu_edit">
                <div className="menu_section">
                    <div className="text">
                        <h1>메뉴명을 적어주세요!</h1>
                        <p>메뉴 설명을 해주세요.
                            <br />자세하게 적을수록 손님들이 좋아해요.
                        </p>
                    </div>
                    <div className="edit">
                        <button className="edit_btn">
                        편집
                        </button>
                    </div>
                </div>
                <button className="menu_add">
                    +
                </button>
                <button className="tanslation_btn">
                    번역하기
                </button>
          </div>
        </main>
        </div>
  );
};

export default Menu_Edit_Popup2