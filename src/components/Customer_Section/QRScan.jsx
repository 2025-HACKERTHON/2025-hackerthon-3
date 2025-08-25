import { useRef, useEffect } from "react";
import jsQR from "jsqr";
import { useNavigate } from "react-router-dom";

import Vector from '../../assets/img/Vector 5.png';
import QRImg from '../../assets/img/bx_qr (1).png';
import Language from '../../assets/img/flowbite_language-outline.png';

const QRScan = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const scannedRef = useRef(false); // 중복 이동 방지

  useEffect(() => {
    const constraints = { video: { facingMode: "environment" } };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // 안전하게 play() 호출
          videoRef.current.play().catch(err => {
            console.warn("video 재생 오류:", err);
          });
          requestAnimationFrame(tick);
        }
      })
      .catch(err => console.error("카메라 접근 오류:", err));

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && !scannedRef.current) {
          scannedRef.current = true; // 한 번만 이동
          console.log("QR 코드 인식:", code.data);

          if (code.data.startsWith("http")) {
            window.location.href = code.data;
          } else {
            navigate('/menu'); // 원하는 경로
          }
          return;
        }
      }
      requestAnimationFrame(tick);
    };
  }, [navigate]);

  return (
    <div className="Menu_wrap">
      <div className="Menu1_wrap">
        <div className="nav">
          <button className="vector" onClick={() => navigate(-1)}>
            <img src={Vector} alt="뒤로가기" />
          </button>

          <div className="function">
            <div className="function1">
              <button onClick={() => navigate('/qr')}>
                <img src={QRImg} alt="QR 코드" />
              </button>
            </div>
            <div className="function2">
              <button><img src={Language} alt="언어" /></button>
            </div>
          </div>
        </div>

        <div className="Menu_name">
          <h2>QR SCAN</h2>
          <h1>QR을 스캔해주세요!</h1>
        </div>

        <div className="Menu_detail">
          {/* QR 카메라 영역 */}
          <video
            ref={videoRef}
            className="video-camera"
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <p>
            QR코드가 인식되면 자동으로<br />
            메뉴판으로 넘어가요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScan;
