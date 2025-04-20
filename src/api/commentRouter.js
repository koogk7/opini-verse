const express = require('express');
const router = express.Router();
const PersonaService = require('../services/PersonaService');

// [SOLID: Single Responsibility]
// API 라우팅에 대한 책임만 가짐
class CommentRouter {
  constructor(llmConfig) {
    try {
      this.personaService = new PersonaService(llmConfig);
    } catch (error) {
      console.error('PersonaService 초기화 실패:', error.message);
      throw error;
    }
    this.router = router;
    this.initializeRoutes();
  }

  initializeRoutes() {
    // 페르소나 로딩
    this.router.use(async (req, res, next) => {
      try {
        await this.personaService.loadPersonas();
        next();
      } catch (error) {
        console.error('페르소나 로딩 실패:', error.message);
        res.status(500).json({ 
          error: '페르소나 로딩 실패',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // 댓글 생성 엔드포인트
    this.router.post('/', async (req, res) => {
      try {
        const { content, personas } = req.body;

        if (!content) {
          return res.status(400).json({
            error: '잘못된 요청',
            details: 'content 필드가 필요합니다.',
            timestamp: new Date().toISOString()
          });
        }

        if (!personas || !Array.isArray(personas)) {
          return res.status(400).json({
            error: '잘못된 요청',
            details: 'personas 필드는 배열이어야 합니다.',
            timestamp: new Date().toISOString()
          });
        }

        if (personas.length === 0) {
          return res.status(400).json({
            error: '잘못된 요청',
            details: '최소 한 개의 페르소나를 지정해야 합니다.',
            timestamp: new Date().toISOString()
          });
        }

        const comments = await Promise.all(
          personas.map(personaName =>
            this.personaService.generateComment(personaName, content)
          )
        );

        res.json({ 
          comments,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('댓글 생성 API 오류:', error.message);
        res.status(500).json({ 
          error: '댓글 생성 중 오류가 발생했습니다.',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  }
}

module.exports = (llmConfig) => new CommentRouter(llmConfig).router; 