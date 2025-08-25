import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/img/Union.png'
import Start from '../../assets/img/Frame 1.png'

const Onboarding = () => {
  const navigate = useNavigate();

  return (

    <div>
      <div className="Onboarding_wrap">
      <div className="logo">
        <img src={Logo} alt="" />
        <p>Easy to Eat, Easy to Order!</p>
      </div>

      <div className="start_button">
        <button onClick={() => navigate('/Login')}>
        <img src={Start} alt="" />
        </button>
      </div>

    </div>
    </div>
  )
}

export default Onboarding
