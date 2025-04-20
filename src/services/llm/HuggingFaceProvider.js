const { HfInference } = require('@huggingface/inference');
const LLMProvider = require('./LLMProvider');

// [SOLID: Liskov Substitution]
// Hugging Face 제공자 구현
class HuggingFaceProvider extends LLMProvider {
  constructor(config) {
    super(config);
    if (!config.apiKey) {
      throw new Error('Hugging Face API 키가 필요합니다.');
    }
    if (!config.model) {
      throw new Error('Hugging Face 모델이 지정되지 않았습니다.');
    }
    this.client = new HfInference(config.apiKey);
    this.model = config.model;
    console.log(`Hugging Face 제공자 초기화: 모델=${this.model}`);
  }

  async generateCompletion(messages, options = {}) {
    try {
      console.log('대화 입력:', messages);
      
      const response = await this.client.chatCompletion({
        provider: "hf-inference",
        model: this.model,
        messages: messages,
        max_tokens: options.max_tokens || 512,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.95
      });
      
      console.log('응답:', response);

      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('모델이 응답을 생성하지 못했습니다.');
      }

      return {
        content: response.choices[0].message.content.trim(),
        usage: {
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
          total_tokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('Hugging Face API 오류 상세:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        throw new Error(`Hugging Face API 오류 (${status}): ${JSON.stringify(data)}`);
      }
      
      if (error.message.includes('Model not found')) {
        throw new Error(`모델 ${this.model}을(를) 찾을 수 없습니다. 모델 접근 권한이 필요할 수 있습니다.`);
      }
      
      throw new Error(`Hugging Face API 호출 중 오류 발생: ${error.message}`);
    }
  }
}

module.exports = HuggingFaceProvider; 