import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import back from '../../assets/img/owner_menu_edit/back.svg';
import qr from '../../assets/img/owner_menu_edit/qr.svg';
import edit from '../../assets/img/owner_menu_edit/edit.svg';

const MenuEditSection = ({ section, deleteSection }) => (
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
        <button className="del_btn" onClick={() => deleteSection(section.id)} >삭제</button>
      </div>
    </div>
  </div>
);

const Menu_Edit = ({ }) => {
  const [storeInfo, setStoreInfo] = useState(null);
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userId = '1';

  // 컴포넌트가 로드될 때 가게 정보와 메뉴 목록을 서버에서 가져옵니다.
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
          tags: data.tags || [],
        });

        localStorage.setItem('restaurantName', data.restaurantName || '');

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

    // API 명세서에 맞게 payload 객체의 키 이름을 수정합니다.
    const payload = {
      restaurantName: updatedInfo.name,
      restaurantAddress: updatedInfo.address,
      shortDescription: updatedInfo.description,
      longDescription: updatedInfo.detail,
      features: updatedInfo.tags, // 'tags'를 'features'로 변경
    };

    try {
      // 서버로 수정된 payload를 전송합니다.
      const response = await axios.patch(API_URL, payload);

      if (response.status === 200) {
        // 성공 시 화면의 상태를 업데이트합니다.
        // 서버가 수정한 값을 다시 보내준다면 response.data를 사용하는 것이 더 정확합니다.
        setStoreInfo(updatedInfo);
        localStorage.setItem('restaurantName', updatedInfo.name || '');
        alert('가게 정보가 성공적으로 저장되었습니다.');
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
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div id="Menu_Edit_Wrap" className="container">
      <header>
        <div className="icon">
          <Link to='/owner_home_first'>
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
              <Link to='/menu_edit_popup1' state={{ initialInfo: storeInfo }}>
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