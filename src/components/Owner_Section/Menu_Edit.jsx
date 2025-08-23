import React, { useState, useEffect } from 'react'
import back from '../../assets/img/owner_menu_edit/back.svg'
import qr from '../../assets/img/owner_menu_edit/qr.svg'
import edit from '../../assets/img/owner_menu_edit/edit.svg'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Menu_Edit_Popup1 from './Menu_Edit_Popup1'

const MenuEditSection = ({ section,deleteSection }) => (
  <div className="menu_section" key={section.id}>
    <div className="text">
     <h1>{section.nameKo || '메뉴명을 적어주세요!'}</h1>
      <p>{section.description || '메뉴 설명을 해주세요. 자세하게 적을수록 손님들이 좋아해요.'}</p>
    </div>
    <div className="btn">
        <Link to={`/menu_edit_popup2/${section.id}`}>
        <div className="edit">
          <button className="edit_btn">편집</button>
        </div>
      </Link>
      <div className="delete">
          <button className="del_btn" onClick={()=> deleteSection(section.id)} >삭제</button>
        </div>
    </div>
    </div>
);

  const Menu_Edit = ({}) => {
    const [storeInfo, setStoreInfo] = useState(null);
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 1. 팝업의 표시 여부를 관리할 상태 추가
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const userId = '1';

  // 데이터 로딩 (axios 사용으로 변경)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/store/${userId}`);
        const data = response.data;
        
        setStoreInfo({
          name: data.restaurantName,
          address: data.restaurantAddress,
          description: data.shortDescription,
          detail: data.longDescription,
          tags: data.tags || [], // API에 tags가 있다면 가져오기
        });
        
        if (data && Array.isArray(data.menuList)) {
          setMenuSections(data.menuList);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleStoreInfoSave = async (updatedInfo) => {
    const API_URL = `/api/store/${userId}/settings/store_info`;
    try {
      const response = await axios.patch(API_URL, updatedInfo);
      if (response.status === 200) {
        setStoreInfo(updatedInfo);
        alert('가게 정보가 성공적으로 저장되었습니다.');
        setIsPopupOpen(false);
      }
    } catch (error) {
      console.error('가게 정보 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // (deleteSection, addMenuSection 등 다른 함수는 기존과 동일)
  const deleteSection = (id) => { /* ... 기존 삭제 API 로직 ... */ };
  const addMenuSection = () => navigate('/menu_edit_popup2');


  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>


  return (
    <div id="Menu_Edit_Wrap" className="container">
      <header>
        <div className="icon">
          <Link to='/owner_home_first'>
            <img src={back} className="back_icon" alt="" />
          </Link>
          <img src={qr} className="qr_icon" alt="" />
        </div>
        <div className="header"></div>
      </header>
      <main>
       {storeInfo && (
          <div className="store_info">
            <div className="title">MENU EDIT</div>
            <div className="store">
              <h1>{storeInfo.name}</h1>
              <div className="edit_icon" onClick={() => setIsPopupOpen(true)} style={{cursor: 'pointer'}}>
                <img src={edit} alt="편집" />
              </div>
            </div>
            <p>{storeInfo.description}</p>
            <div className='text'>{storeInfo.detail}</div>
            <div className='map'>{storeInfo.address}</div>
            <div className="tags">
                {storeInfo.tags.map(tag => <div key={tag} className="tag selected">{tag}</div>)}
            </div>
          </div>
        )}
        <div className="title">메뉴 편집</div>
        <div className="menu_edit">
          {menuSections.map(section => (
            <MenuEditSection key={section.id} section={section} deleteSection={deleteSection} />
          ))}
          <button className="menu_add" onClick={addMenuSection}>
            +
          </button>
          <button className="tanslation_btn">번역하기</button>
        </div>
      </main>
    </div>
  );
};


export default Menu_Edit