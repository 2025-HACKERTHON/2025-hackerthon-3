import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import back from '../../assets/img/owner_menu_edit/back.svg';
import qr from '../../assets/img/owner_menu_edit/qr.svg';
import edit from '../../assets/img/owner_menu_edit/edit.svg';

// 메뉴 섹션을 보여주는 자식 컴포넌트 (수정 없음)
const MenuEditSection = ({ section, deleteSection }) => (
  <div className="menu_section" key={section.id}>
    <div className="text">
      <h1>{section.nameKo || '메뉴명을 적어주세요!'}</h1>
      <p>{section.description || '메뉴 설명을 해주세요. 자세하게 적을수록 손님들이 좋아해요.'}</p>
    </div>
    <div className="btn">
      <Link to={`/owner/menu_edit_popup2/${section.id}`} state={{ sectionData: section }}>
        <div className="edit">
          <button className="edit_btn">편집</button>
        </div>
      </Link>
      <div className="delete">
        <button className="del_btn" onClick={() => deleteSection(section.id)} >삭제</button>
      </div>
    </div>
  </div>
);

// 메인 컴포넌트
const Menu_Edit = () => {
  const [storeInfo, setStoreInfo] = useState(null);
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userId = '17'; // 사용자 ID는 필요에 따라 동적으로 관리할 수 있습니다.

  // 1. 컴포넌트가 로드될 때 가게 정보와 메뉴 목록을 서버에서 가져옵니다.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://www.taekyeong.shop/api/store/${userId}`);
        const data = response.data;
        
        console.log("서버로부터 받은 데이터:", data);

        if (data) {
          setStoreInfo({
            name: data.restaurantName,
            address: data.restaurantAddress,
            description: data.shortDescription,
            detail: data.longDescription,
            tags: data.tags || [],
          });
          
          localStorage.setItem('restaurantName', data.restaurantName || '');

          if (Array.isArray(data.menuList)) {
            setMenuSections(data.menuList);
          }
        }
      } catch (err) {
        setError(err);
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);


  // 2. 메뉴 섹션을 삭제하는 함수
  const deleteSection = async (menuId) => {
    if (window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
      try {
        // API 명세에 따른 올바른 DELETE 요청 URL
        await axios.delete(`https://www.taekyeong.shop/api/store/${userId}/settings/menu_info/${menuId}`);
        
        // 성공적으로 삭제되면 화면(state)에서도 해당 메뉴를 제거합니다.
        setMenuSections(prevSections => prevSections.filter(section => section.id !== menuId));
        alert('메뉴가 삭제되었습니다.');
      } catch (err) {
        console.error('메뉴 삭제 실패:', err);
        alert('메뉴 삭제 중 오류가 발생했습니다.');
      }
    }
  };


  // 3. 가게 정보를 수정하고 저장하는 함수 (팝업 컴포넌트에서 호출될 것으로 예상)
  const handleStoreInfoSave = async (updatedInfo) => {
    const API_URL = `https://www.taekyeong.shop/api/store/${userId}/settings/store_info`;
    const payload = {
      restaurantName: updatedInfo.name,
      restaurantAddress: updatedInfo.address,
      shortDescription: updatedInfo.description,
      longDescription: updatedInfo.detail,
      features: updatedInfo.tags,
    };

    try {
      const response = await axios.patch(API_URL, payload);
      if (response.status === 200) {
        setStoreInfo(updatedInfo);
        localStorage.setItem('restaurantName', updatedInfo.name || '');
        alert('가게 정보가 성공적으로 저장되었습니다.');
      }
    } catch (error) {
      console.error('가게 정보 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };


  // 4. 새로운 메뉴를 추가하기 위해 페이지를 이동하는 함수
  const addMenuSection = () => {
    // ':id'와 같은 파라미터가 아닌, 'new'와 같이 명확한 경로로 보내는 것이 일반적입니다.
    navigate('/menu_edit_popup2/new');

  };

  // 로딩 및 에러 상태에 따른 UI 처리
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div id="Menu_Edit_Wrap" className="container">
      <header>
        <div className="icon">
          <Link to='/owner/owner_home_first'>
            <img src={back} className="back_icon" alt="뒤로가기" />
          </Link>
          <img src={qr} className="qr_icon" alt="QR 코드" />
        </div>
        <div className="header"></div>
      </header>
      <main>
        {storeInfo && (
          <div className="store_info">
            <div className="title">MENU EDIT</div>
            <div className="store">
              <h1>{storeInfo.name}</h1>
              <Link to='/owner/menu_edit_popup1' state={{ initialInfo: storeInfo }}>
                <div className="edit_icon">
                  <img src={edit} alt="편집" />
                </div>
              </Link>
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
          <button className="menu_add" onClick={addMenuSection}>+</button>
          <button className="tanslation_btn">번역하기</button>
        </div>
      </main>
    </div>
  );
};

export default Menu_Edit;