import React from 'react'
import back from '../../assets/img/owner_menu_edit/back.svg'
import qr from '../../assets/img/owner_menu_edit/qr.svg'
import edit from '../../assets/img/owner_menu_edit/edit.svg'
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const Menu_Edit_Popup2 = ({ storeInfo, saveStoreData, selectedTags, menuSections, updateMenuSection, saveImage, imagePreviewUrl }) => {

  const userId='1';
  const navigate = useNavigate();
  const { id } = useParams();
  const sectionId = id ? Number(id) : null; // URL에서 메뉴 ID를 가져옴
  const section = sectionId ? menuSections.find(s => s.id === sectionId) : null;

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(section?.imagePreviewUrl ?? null);
  const [info, setInfo] = useState(section || { nameKo: '', description: '', price: '' });
  const fileInputRef = useRef();

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(previewUrl);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

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
      // sectionId가 있으면 '수정(PUT)', 없으면 '추가(POST)'
      if (sectionId) {
        // --- 메뉴 수정 (PUT 요청) ---
        const API_URL = `/api/store/${userId}/settings/menu_info/id/${sectionId}`;
        response = await axios.put(API_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('메뉴가 성공적으로 수정되었습니다.');
      } else {
        // --- 메뉴 추가 (POST 요청) ---
        const API_URL = `/api/store/${userId}/settings/menu_info`;
        response = await axios.post(API_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('메뉴가 성공적으로 추가되었습니다.');
      }

      if (response.status === 200 || response.status === 201) {
        navigate('/menu_edit');
      }
    } catch (error) {
      console.error('메뉴 저장/수정 실패:', error);
      alert('메뉴 저장/수정 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (section) {
      setInfo({
        nameKo: section.nameKo || '',
        description: section.description || '',
        price: section.price || '',
      });
      setImagePreview(section.imagePreviewUrl || null);
    }
  }, [section]);


  return (
    <div id="Menu_Edit_Popup2_Wrap" className="container">
     <div className="popup">
       <div className="popup_img">
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
            {imagePreview ? <img src={imagePreview} alt="업로드 이미지" /> : <>이미지를<br />추가해주세요.</>}
        </div>
         <div className="popup_content">
            <input type="text" className="name" name='name' value={info.name} onChange={handleChange} placeholder='메뉴명' />
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