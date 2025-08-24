import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Logo from '../../assets/img/Union.png';
import Start from '../../assets/img/Frame 1.png';
import Text from '../../assets/img/EATO (2).png';

const Store_info = () => {
  const navigate = useNavigate();

  // 입력값 state 관리
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [count, setCount] = useState(1);
  const [features, setFeatures] = useState([]);

  // 체크박스 같은 버튼 선택
  const toggleFeature = (feature) => {
    setFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  // ✅ API 호출 + 화면 이동 처리
  const handleSubmit = async () => {
    const userId = 5; // 실제 로그인된 userId로 교체
    const requestData = {
      restaurantName,
      restaurantAddress,
      shortDescription,
      longDescription,
      tableCount: count,
      features,
    };

    try {
      const response = await axios.post(
        `http://3.38.135.47:8080/api/user/register/step2/${userId}`,
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      console.log("서버 응답:", response.data);
      alert("가게 정보가 등록되었습니다!");
    } catch (error) {
      console.error("가게 등록 실패:", error);
      alert("등록 중 오류가 발생했지만, 화면 이동은 계속합니다.");
    } finally {
      // ✅ API 성공 여부와 상관없이 화면 이동
      navigate('/owner_home_first');
    }
  };

  return (
    <div>
      <div className="Store_info_wrap">
        <div className="logo">
          <img src={Logo} alt="" />
        </div>
        <div className="text">
          <img src={Text} alt="" />
        </div>

        {/* 입력 폼 */}
        <div className="input">
          <div className="input_name">
            <p>가게명</p>
            <input
              type="text"
              placeholder="가게명을 입력해주세요."
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              required
            />
          </div>
          <div className="input_adderess">
            <p>가게 주소</p>
            <input
              type="text"
              placeholder="가게 주소를 입력해주세요."
              value={restaurantAddress}
              onChange={(e) => setRestaurantAddress(e.target.value)}
              required
            />
          </div>
          <div className="input_info">
            <p>한 줄 설명</p>
            <input
              type="text"
              placeholder="회원님의 가게를 간단히 소개해주세요."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </div>
          <div className="input_detail">
            <p>상세설명</p>
            <input
              type="text"
              placeholder="회원님의 가게를 상세히 소개해주세요."
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* 테이블 수 */}
        <div className="table">
          <p>테이블 수</p>
          <div className="table_count">
            <div>
              <button onClick={() => count > 1 && setCount(count - 1)}>-</button>
              <span>{count}</span>
              <button onClick={() => setCount(count + 1)}>+</button>
            </div>
          </div>
        </div>

        {/* 가게 특성 */}
        <div className="detail_box">
          <p>가게 특성</p>
          <div className="detail_top">
            <button
              className={features.includes("매운맛 조절 가능") ? "selected" : ""}
              onClick={() => toggleFeature("매운맛 조절 가능")}
            >
              매운맛 조절 가능
            </button>
            <button
              className={features.includes("비건 변경 가능") ? "selected" : ""}
              onClick={() => toggleFeature("비건 변경 가능")}
            >
              비건 변경 가능
            </button>
          </div>
          <div className="detail_bottom">
            <button
              className={features.includes("Takeout 가능") ? "selected" : ""}
              onClick={() => toggleFeature("Takeout 가능")}
            >
              Takeout 가능
            </button>
            <button
              className={features.includes("반려견 동반 가능") ? "selected" : ""}
              onClick={() => toggleFeature("반려견 동반 가능")}
            >
              반려견 동반 가능
            </button>
            <button
              className={features.includes("직접 추가하기") ? "selected" : ""}
              onClick={() => toggleFeature("직접 추가하기")}
            >
              직접 추가하기
            </button>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="start_button">
          <button onClick={handleSubmit}>
            <img src={Start} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store_info;
