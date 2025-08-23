import React from 'react'
import back from '../../assets/img/owner_menu_edit/back.svg'
import qr from '../../assets/img/owner_menu_edit/qr.svg'
import edit from '../../assets/img/owner_menu_edit/edit.svg'
import { Link, useNavigate} from 'react-router-dom'
import { useState } from 'react'

const Menu_Edit_Popup1 = ({ storeInfo, saveStoreData, selectedTags, initialStoreInfo, onSave }) => {
  
  const [info, setInfo] = useState(initialStoreInfo || {});
  const [tags, setTags] = useState(initialStoreInfo?.tags || []);
  
  const handleChange = e => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const toggleTag = tag => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // '완료' 버튼 클릭 시, 부모에게 수정된 데이터를 전달하는 역할만 합니다.
  const handleSave = () => {
    onSave({ ...info, tags });
  };


  return (
    <div id="Menu_Edit_Popup1_Wrap" className="container">
     <div className="popup">
         <div className="popup_section">
             <input name="name" className='h1' type="text"  value={info.name} onChange={handleChange} placeholder='식당명을 적어주세요!' />
              <input name="description" type="text" className="p" value={info.description} onChange={handleChange}  placeholder='가게 한 줄 설명을 해주세요!' />
              <textarea name="detail" id="" className="text"  value={info.detail} onChange={handleChange}  placeholder='가게 상세 설명을 해주세요.'></textarea>
              <input name="address" type="text" className="map" value={info.address} onChange={handleChange} placeholder='가게 주소를 정확히 적어주세요.' />
               <div className="tags">
                 <div className="top">
                    {["Takeout 가능", "매운맛 조절 가능", "비건 변경 가능"].map(tag => (
                    <div
                        key={tag}
                        className={`tag${tags.includes(tag) || selectedTags.includes(tag) ? " selected" : ""}`}
                        onClick={() => toggleTag(tag)}
                    >
                        {tag}
                    </div>
                    ))}
                </div>
                <div className="bottom">
                    {["반려견 동반 가능", "직접 추가하기"].map(tag => (
                    <div
                        key={tag}
                        className={`tag${tags.includes(tag) || selectedTags.includes(tag) ? " selected" : ""}`}
                        onClick={() => toggleTag(tag)}
                    >
                        {tag}
                    </div>
                    ))}
                </div>
              </div>
              <button className='save_btn' onClick={handleSave}>완료</button>
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

export default Menu_Edit_Popup1;