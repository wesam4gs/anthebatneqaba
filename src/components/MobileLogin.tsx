import React, { useState } from 'react';
import '../neumorphic-login.css';

interface MobileLoginProps {
  onLogin: (username: string) => void;
}

export const MobileLogin: React.FC<MobileLoginProps> = ({ onLogin }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    } else {
      onLogin('test1'); // Default fallback
    }
  };

  return (
    <div className="neumorphic-login-root">
      <div className="login-wrapper">
        <div className={"flip-scene " + (isFlipped ? "flipped" : "")} id="flipScene">
          <div className="flip-card">
            
            {/* FRONT - LOGIN */}
            <div className="glass-circle front">
              <div className="accent-ring"></div>
              
              <form className="login-form" onSubmit={handleLogin}>
                <h1>دخول</h1>
                <div className="subtitle">تسجيل الدخول لمنظومة المفتشين</div>
                
                <div className="input-box">
                  <i className="fa-solid fa-user"></i>
                  <input 
                    type="text" 
                    placeholder="اسم المستخدم" 
                    autoComplete="off" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                
                <div className="input-box">
                  <i className="fa-solid fa-lock"></i>
                  <input type="password" placeholder="كلمة المرور" autoComplete="off" />
                </div>
                
                <div className="forgot">
                  <div className="remember">
                    <div 
                      className={"switch " + (rememberMe ? "on" : "")} 
                      onClick={() => setRememberMe(!rememberMe)}
                    ></div>
                    تذكرني
                  </div>
                  <a href="#">نسيت كلمة المرور؟</a>
                </div>
                
                <button type="submit">تسجيل الدخول</button>
                
                <div className="signup-text">ليس لديك حساب؟ <a style={{cursor: "pointer"}} onClick={() => setIsFlipped(true)}>طلب الانضمام</a></div>
              </form>
            </div>
            
            {/* BACK - SIGN UP */}
            <div className="glass-circle back">
              <div className="accent-ring"></div>
              
              <form className="login-form" onSubmit={(e) => { e.preventDefault(); setIsFlipped(false); }}>
                <h1>تسجيل</h1>
                <div className="subtitle">إنشاء حساب جديد</div>
                
                <div className="input-box">
                  <i className="fa-solid fa-user"></i>
                  <input type="text" placeholder="الاسم الكامل" autoComplete="off" />
                </div>
                
                <div className="input-box">
                  <i className="fa-solid fa-envelope"></i>
                  <input type="email" placeholder="البريد الإلكتروني" autoComplete="off" />
                </div>
                
                <div className="input-box" style={{ marginBottom: "30px" }}>
                  <i className="fa-solid fa-lock"></i>
                  <input type="password" placeholder="كلمة المرور" autoComplete="off" />
                </div>
                
                <button type="submit">إنشاء الحساب</button>
                
                <div className="signup-text">لديك حساب بالفعل؟ <a style={{cursor: "pointer"}} onClick={() => setIsFlipped(false)}>تسجيل الدخول</a></div>
              </form>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
