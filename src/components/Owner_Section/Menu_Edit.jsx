import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import back from '../../assets/img/owner_menu_edit/back.svg';
import qr from '../../assets/img/owner_menu_edit/qr.svg';
import edit from '../../assets/img/owner_menu_edit/edit.svg';

const MenuEditSection = ({ section, deleteSection }) => {
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/menu_edit_popup2/${section.id}`, { state: { sectionData: section } });
  };

  return (
    <div className="menu_section" key={section.id}>
      <div className="text">
        <h1>{section.nameKo || '메뉴명을 적어주세요!'}</h1>
        <p>{section.description || '메뉴 설명을 해주세요. 자세하게 적을수록 손님들이 좋아해요.'}</p>
      </div>
      <div className="btn">
        <div className="edit">
          <button className="edit_btn" onClick={handleEditClick}>
            편집
          </button>
        </div>
        <div className="delete">
          <button className="del_btn" onClick={() => deleteSection(section.id)}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

const Menu_Edit = () => {
  const [storeInfo, setStoreInfo] = useState(null);
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translationLang, setTranslationLang] = useState(null);
  const navigate = useNavigate();

  const userId = '17';
  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: "https://www.taekyeong.shop/api",
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/store/${userId}`);
        const data = response.data;
        console.log(data);

        setStoreInfo({
          name: data.restaurantName,
          address: data.restaurantAddress,
          description: data.shortDescription,
          detail: data.longDescription,
          tags: data.features || [],
        });

        localStorage.setItem('restaurantName', data.restaurantName || '');

        if (data && Array.isArray(data.menuList)) {
          setMenuSections(data.menuList);
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

  useEffect(() => {
    if (translationLang) {
      const fetchTranslatedData = async () => {
        try {
          // GET 요청을 사용하여 번역된 데이터 가져오기
          const response = await axiosInstance.get(`/store/${userId}/settings/menu_info/lang/${translationLang}`);
          const translatedData = response.data;

          if (translatedData) {
            navigate(`/menu_${translationLang}`, {
              state: {
                restaurantInfo: translatedData.restaurantInfo,
                menuList: translatedData.menuList,
              },
            });
            alert('메뉴가 성공적으로 번역되었습니다.');
          }
        } catch (err) {
          console.error('번역 실패:', err);
          alert('번역 중 오류가 발생했습니다.');
        }
      };
      fetchTranslatedData();
    }
  }, [translationLang, userId, navigate, axiosInstance]);

  const handleStoreInfoSave = async (updatedInfo) => {
    const API_URL = `/store/${userId}/settings/store_info`;
    const payload = {
      restaurantName: updatedInfo.name,
      restaurantAddress: updatedInfo.address,
      shortDescription: updatedInfo.description,
      longDescription: updatedInfo.detail,
      features: updatedInfo.tags,
    };

    try {
      const response = await axiosInstance.patch(API_URL, payload);

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

  const deleteSection = async (id) => {
    if (window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(`/store/${userId}/settings/menu_info/id/${id}`);
        setMenuSections(prevSections => prevSections.filter(section => section.id !== id));
        alert('메뉴가 삭제되었습니다.');
      } catch (err) {
        console.error('메뉴 삭제 실패:', err);
        alert('메뉴 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const addMenuSection = () => navigate('/menu_edit_popup2');

  const handleTranslateClick = (lang) => {
    setTranslationLang(lang);
  };

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
              {storeInfo.tags.map(tag => (
                <div key={tag.featureId} className="tag selected">
                  {tag.name}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="title">메뉴 편집</div>
        <div className="menu_edit">
          {menuSections.map(section => (
            <MenuEditSection key={section.id} section={section} deleteSection={deleteSection} />
          ))}
          <button className="menu_add" onClick={addMenuSection}>+</button>
          <button className="tanslation_btn" onClick={() => handleTranslateClick('en')}>번역하기</button>
        </div>
      </main>
    </div>
  );
};

export default Menu_Edit;
