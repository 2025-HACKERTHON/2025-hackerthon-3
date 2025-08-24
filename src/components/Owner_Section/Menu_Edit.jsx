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
      {/* Link의 state를 통해 '편집'할 메뉴의 현재 데이터를 전달합니다. */}
      <Link to={`/menu_edit_popup2/${section.id}`} state={{ sectionData: section }}>
        <div className="edit">
          <button className="edit_btn">편집</button>
        </div>
      </Link>
      <div className="delete">
        <button className="del_btn" onClick={() => deleteSection(section.id)}>삭제</button>
      </div>
    </div>
  </div>
);

const Menu_Edit = () => {
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

  // 메뉴 삭제 함수 (실제 API 로직은 주석 처리)
  const deleteSection = async (id) => {
      // 사용자에게 정말 삭제할 것인지 한 번 더 확인합니다.
    // if (window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
    //   try {
    //     // 1. 실제 서버에 삭제 요청을 보냅니다. (주석 해제)
    //     await axios.delete(`/api/store/${userId}/settings/menu_info/id/${id}`);
        
    //     // 2. 서버에서 성공적으로 삭제되면, 화면에서도 해당 메뉴를 즉시 제거합니다.
    //     setMenuSections(prevSections => prevSections.filter(section => section.id !== id));
        
    //     alert('메뉴가 성공적으로 삭제되었습니다.');

    //   } catch (err) {
    //     console.error('메뉴 삭제 실패:', err);
    //     // 서버에서 권한 문제 등으로 삭제를 막았을 경우를 대비한 에러 메시지
    //     alert('메뉴 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
    //   }
    // }
  };

  // 메뉴 추가 페이지로 이동
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