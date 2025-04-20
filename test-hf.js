const HuggingFaceProvider = require('./src/services/llm/HuggingFaceProvider');

// 테스트할 모델 목록
const testModels = [
  // 'google/flan-t5-xxl',
  // 'mistralai/Mistral-7B-Instruct-v0.2',
  // 'Qwen/QwQ-32B',
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B'
  // 'facebook/opt-6.7b',
  // 'bigscience/bloom-7b1'
];

// API 키
const API_KEY = '';

async function testModel(modelName) {
  console.log(`\n=== 테스트 시작: ${modelName} ===`);
  
  try {
    // HuggingFaceProvider 인스턴스 생성
    const provider = new HuggingFaceProvider({
      apiKey: API_KEY,
      model: modelName
    });

    // 테스트 메시지
    const messages = [
      { role: 'system', content: '당신은 도움이 되는 AI 어시스턴트입니다.' },
      { role: 'user', content: '안녕하세요! 오늘 날씨가 어떤가요?' }
    ];

    // 응답 생성
    const response = await provider.generateCompletion(messages, {
      maxTokens: 100,
      temperature: 0.7
    });

    console.log('응답 성공!');
    console.log('생성된 텍스트:', response.content);
    console.log('사용량:', response.usage);
    
    return true;
  } catch (error) {
    console.error('테스트 실패:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Hugging Face 모델 테스트 시작...');
  
  for (const model of testModels) {
    const success = await testModel(model);
    if (success) {
      console.log(`✅ ${model} 테스트 성공`);
    } else {
      console.log(`❌ ${model} 테스트 실패`);
    }
  }
}

// 테스트 실행
runTests().catch(console.error); 