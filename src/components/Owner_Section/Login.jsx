import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import Logo from '../../assets/img/Union.png';
import Login_button from '../../assets/img/login .png';
import Text from '../../assets/img/EATO .png';

const Login = () => {
  const navigate = useNavigate();

  // 입력값 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 로그인 처리 함수
  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/user/login", {
        email: email,
        password: password,
      });

      console.log("로그인 성공:", response.data);

      // 로그인 성공 시 -> 다음 페이지로 이동
      navigate('/storeinfo');
    } catch (error) {
      console.error("로그인 실패:", error.response ? error.response.data : error.message);
      alert("로그인 실패! 이메일 또는 비밀번호를 확인하세요.");
    }
  };

  return (
    <div>
      <div className="Login_wrap">
        <div className="logo">
          <img src={Logo} alt="" />
        </div>
        <div className="text">
          <img src={Text} alt="" />
        </div>
        <div className="input">
          <div className="input_email">
            <p>이메일</p>
            <input
              type="text"
              name="email"
              placeholder="이메일을 입력해주세요."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input_password">
            <p>비밀번호</p>
            <input
              type="password"
              name="password"
              placeholder="비밀번호를 입력해주세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="start_button">
          <button onClick={handleLogin}>
            <img src={Login_button} alt="" />
          </button>
          <p>아직 EATO의 회원이 아니신가요?</p>
          <a href="/signup" className="signup_link">회원가입</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
