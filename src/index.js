require('dotenv').config();
const express = require('express');
const cors = require('cors');
const commentRouter = require('./api/commentRouter');

// [SOLID: Single Responsibility]
// 애플리케이션 설정과 서버 실행에 대한 책임만 가짐
class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // LLM 설정
    const llmType = process.env.LLM_PROVIDER || 'openai';
    this.llmConfig = {
      type: llmType,
      apiKey: llmType === 'openai' ? process.env.OPENAI_API_KEY : process.env.HUGGINGFACE_API_KEY,
      model: llmType === 'huggingface' ? process.env.HUGGINGFACE_MODEL : undefined
    };

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  initializeRoutes() {
    this.app.use('/api/comments', commentRouter(this.llmConfig));
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`서버가 http://localhost:${this.port} 에서 실행 중입니다.`);
      console.log(`LLM 제공자: ${this.llmConfig.type}`);
      if (this.llmConfig.model) {
        console.log(`사용 모델: ${this.llmConfig.model}`);
      }
    });
  }
}

// 애플리케이션 시작
const app = new App();
app.start(); 