# 보안 가이드 (Security Guidelines)

## 민감 정보 관리 (Sensitive Information Management)

### ✅ 현재 보안 상태 (Current Security Status)

이 프로젝트는 다음과 같은 보안 조치가 적용되어 있습니다:

1. **환경 변수 사용**: API 키는 환경 변수로 관리되며 코드에 하드코딩되지 않습니다
2. **.gitignore 설정**: 민감한 파일들이 Git에 커밋되지 않도록 설정되어 있습니다
3. **.env.example 제공**: 필요한 환경 변수를 문서화한 템플릿 파일이 제공됩니다

### 🔐 API 키 관리 방법

#### 1. 환경 변수 파일 설정

```bash
# .env.example를 .env.local로 복사
cp .env.example .env.local

# .env.local 파일을 편집하여 실제 API 키 입력
# GEMINI_API_KEY=your_actual_api_key_here
```

#### 2. 사용 중인 API 키

- **Gemini API Key**: Google의 Gemini AI 모델을 사용하기 위한 키
  - 발급 위치: https://makersuite.google.com/app/apikey
  - 환경 변수: `GEMINI_API_KEY`
  - 사용 위치: `services/geminiService.ts`

### ⚠️ 절대 하지 말아야 할 것들

1. **API 키를 코드에 직접 작성하지 마세요**
   ```javascript
   // ❌ 나쁜 예
   const apiKey = "sk-1234567890abcdef";

   // ✅ 좋은 예
   const apiKey = process.env.GEMINI_API_KEY;
   ```

2. **.env.local 파일을 Git에 커밋하지 마세요**
   - 이 파일은 .gitignore에 포함되어 있습니다
   - 실수로 커밋하지 않도록 주의하세요

3. **API 키를 공개 저장소, 이슈, PR에 노출하지 마세요**
   - 스크린샷을 공유할 때 API 키가 보이지 않는지 확인하세요
   - 로그 출력 시 API 키를 마스킹하세요

4. **API 키를 채팅, 이메일, 메신저로 공유하지 마세요**
   - 안전한 비밀번호 관리 도구를 사용하세요

### 🛡️ .gitignore에 보호되는 파일들

다음 파일들은 Git에 커밋되지 않습니다:

```
.env
.env.local
.env.*.local
*.key
*.pem
*.cert
secrets.*
**/credentials.json
**/service-account*.json
```

### 🔍 보안 점검 체크리스트

배포 또는 코드 공유 전에 다음 사항을 확인하세요:

- [ ] .env.local 파일이 Git에 추가되지 않았는가?
- [ ] 코드에 하드코딩된 API 키가 없는가?
- [ ] 로그 출력에 민감한 정보가 포함되지 않는가?
- [ ] 스크린샷이나 문서에 API 키가 노출되지 않았는가?
- [ ] .gitignore가 올바르게 설정되어 있는가?

### 🚨 API 키 노출 시 대응 방법

만약 실수로 API 키가 노출되었다면:

1. **즉시 해당 API 키를 무효화하세요**
   - Gemini API: https://makersuite.google.com/app/apikey 에서 키 삭제

2. **새로운 API 키를 발급받으세요**

3. **Git 히스토리에서 민감 정보를 제거하세요**
   ```bash
   # 전문가의 도움이 필요할 수 있습니다
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```

4. **저장소가 공개되어 있다면 관련 팀에 알리세요**

### 📝 개발자를 위한 권장사항

1. **환경 변수 검증 추가**
   ```javascript
   if (!process.env.GEMINI_API_KEY) {
     throw new Error('GEMINI_API_KEY is not set in environment variables');
   }
   ```

2. **API 키 로테이션 주기적으로 실행**
   - 최소 3개월마다 API 키를 새로 발급받으세요

3. **최소 권한 원칙 적용**
   - API 키에 필요한 최소한의 권한만 부여하세요

4. **개발/프로덕션 환경 분리**
   - 개발용과 프로덕션용 API 키를 별도로 관리하세요

### 📚 추가 자료

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**보안 문제를 발견하셨나요?**
공개 이슈로 보고하지 마시고, 프로젝트 관리자에게 비공개로 연락해 주세요.
