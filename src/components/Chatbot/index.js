import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

// 미리 정의된 질문과 답변
const predefinedQA = {
  "안녕": "안녕하세요! 다음 질문 섹션을 클릭해주세요!",
  "이름": "저는 Back-end 개발자 신주섭입니다.",
  "포트폴리오": "현재 보고 계신 페이지가 제 포트폴리오입니다. 프로젝트와 기술 스택을 확인하실 수 있습니다.",
  "기술 스택": "주로 React, SpringFramework, MySQL를 사용합니다. 최근 개인 프로젝트로 Ai를 활용한 바이브 코딩으로 크로스 플랫폼 모바일 앱을 개발하였습니다.",
  "연락처": "이메일: sjs2457@gmail.com\n연락처: 010-8952-3818",
  "프로젝트": "자세한 내용은 Projects 섹션을 확인해주세요!",
  "취미": "코딩, 운동, 여행을 좋아합니다.",
  "학력": "경일대학교 스포츠경영학계열을 전공했습니다.",
  "경력": "6년차 개발자이며 SI, SM, 서비스 운영, SW Engineering 등 여러방면에서 경험을 하였고 현재는 서비스 운영 개발자로 일을 하고 있습니다.",
  "목표": "최근 트렌드인 AI를 적극 활용하여 개발 생산성을 높이는 것에 관심이 많습니다. 저의 역량을 충분히 펼칠 수 있으며 훌륭한 사람들이 넘치는 곳에서 일을 하고 싶습니다."
};

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatbotRef = useRef(null);
  const sendButtonRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 전역 클릭 이벤트 핸들러
    const handleClickOutside = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('mousedown', handleClickOutside);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const findBestMatch = (input) => {
    // 입력된 텍스트를 소문자로 변환
    const userText = input.toLowerCase();
    
    // 미리 정의된 질문들 중에서 가장 잘 매칭되는 것을 찾음
    for (const question in predefinedQA) {
      if (userText.includes(question.toLowerCase())) {
        return predefinedQA[question];
      }
    }
    
    // 매칭되는 답변이 없을 경우 기본 응답
    return "죄송합니다. 질문을 이해하지 못했습니다. 다른 질문을 해주세요.";
  };

  const sendMessage = () => {
    if (userInput.trim() === '') return;

    const currentInput = userInput;
    setUserInput('');
    
    // 사용자 메시지 추가
    setMessages(prevMessages => [
      ...prevMessages, 
      { 
        id: Date.now(), 
        sender: 'user', 
        text: currentInput 
      }
    ]);

    // 챗봇 응답 추가
    setTimeout(() => {
      const botResponse = findBestMatch(currentInput);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(), 
          sender: 'bot',
          text: botResponse
        }
      ]);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleQuestionClick = (question) => {
    setUserInput(question);
    // 약간의 지연 후 전송 버튼 클릭 (상태 업데이트 후 실행되도록)
    setTimeout(() => {
      sendButtonRef.current.click();
    }, 10);
  };

  return (
    <div ref={chatbotRef} className="chatbot-wrapper">
      {isChatOpen ? (
        <div className="chat-container">
          <div className="chat-header">
            <span>Ask me a question</span>
            <button 
              className="close-button"
              onClick={() => setIsChatOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="question-list">
            <p>가능한 질문 목록:</p>
            <ul>
              <li onClick={() => handleQuestionClick("안녕")}>👋 안녕</li>
              <li onClick={() => handleQuestionClick("이름이 뭐야")}>🤔 자기소개</li>
              <li onClick={() => handleQuestionClick("포트폴리오")}>📝 포트폴리오</li>
              <li onClick={() => handleQuestionClick("기술 스택")}>💻 기술 스택</li>
              <li onClick={() => handleQuestionClick("연락처")}>📞 연락처</li>
              <li onClick={() => handleQuestionClick("프로젝트")}>🚀 프로젝트</li>
              <li onClick={() => handleQuestionClick("취미")}>🎮 취미</li>
              <li onClick={() => handleQuestionClick("학력")}>🎓 학력</li>
              <li onClick={() => handleQuestionClick("경력")}>💼 경력</li>
              <li onClick={() => handleQuestionClick("목표")}>🎯 목표</li>
            </ul>
          </div>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-container">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
            />
            <button ref={sendButtonRef} onClick={sendMessage}>전송</button>
          </div>
        </div>
      ) : (
        <button 
          className="chat-toggle-button"
          onClick={() => setIsChatOpen(true)}
        >
          +
        </button>
      )}
    </div>
  );
}

export default ChatBot;
