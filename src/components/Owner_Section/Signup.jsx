import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Logo from '../../assets/img/Union.png';
import Signup_button from '../../assets/img/signup .png';
import Text from '../../assets/img/EATO (1).png';

const Signup = () => {
  const navigate = useNavigate();

  // 입력값 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 회원가입 요청
  const handleSignup = async () => {
    try {
      const response = await axios.post('/api/user/register/step1', {
        email: email,
        password: password,
        confirmPassword: confirmPassword
      });

      console.log('회원가입 성공:', response.data);
      alert('회원가입이 완료되었습니다!');
      navigate('/login');  // 회원가입 후 로그인 페이지로 이동
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입에 실패했습니다.');
    }
  };

  return (
    <div>
      <div className="Signup_wrap">
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
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input_password">
            <p>비밀번호</p>
            <input 
              type="password" 
              name="password" 
              placeholder="비밀번호를 입력해주세요." 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input_check">
            <p>비밀번호 확인</p>
            <input 
              type="password" 
              name="password_check" 
              placeholder="비밀번호를 다시 입력해주세요." 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="start_button">
          <button onClick={handleSignup}>
            <img src={Signup_button} alt="" />
          </button>
          <p>이미 EATO의 회원이신가요?</p>
          <a href='/login' className="login_link">로그인</a>
        </div>
      </div>
    </div>
  )
}

export default Signup;
