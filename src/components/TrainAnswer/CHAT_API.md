# 多轮对话 API 接口文档

- **Base URL**: `http://127.0.0.1:8002`
- **Content-Type**: `application/json; charset=utf-8`
- **统一响应结构**:
  ```json
  {
    "code": 0,
    "message": "OK",
    "data": {
      "answer": { },
      "confidence": 1.0,
      "sources": [],
      "error": null
    },
    "trace_id": "..."
  }
  ```

---

## 一、模型对话 (Model Chat)

基于已训练/已注册模型的多轮对话服务。

### 1.1 启动对话会话

- **POST** `/api/chat/model/start`

**请求体**:
```json
{
  "model_id": "ckpt_abc12345",
  "system_prompt": "你是一个智能客服助手",
  "max_history": 10
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_id` | string | ✅ | 已注册模型的ID（从 `/api/exec/train/model/list` 获取） |
| `system_prompt` | string | ❌ | 系统提示词，定义助手角色，默认为通用助手 |
| `max_history` | int | ❌ | 保留的最大对话轮数，默认 `10`，范围 `1-50` |

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "session_id": "sess_xxx",
      "model_id": "ckpt_abc12345",
      "model_type": "causal-lm",
      "system_prompt": "你是一个智能客服助手"
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": "sess_xxx"
}
```

---

### 1.2 发送消息

- **POST** `/api/chat/model/send`

**请求体**:
```json
{
  "session_id": "sess_xxx",
  "message": "如何申请建立单位最高计量标准？",
  "max_new_tokens": 256,
  "temperature": 0.7
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `session_id` | string | ✅ | 对话会话ID（从 `start` 接口获取） |
| `message` | string | ✅ | 用户消息 |
| `max_new_tokens` | int | ❌ | 生成的最大token数，默认 `256`，范围 `1-2048` |
| `temperature` | float | ❌ | 生成温度，默认 `0.7`，范围 `0.0-2.0` |

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "response": "申请建立单位最高计量标准需要...",
      "session_id": "sess_xxx"
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": "sess_xxx"
}
```

---

### 1.3 获取历史记录

- **GET** `/api/chat/model/history/{session_id}`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `session_id` | string | 对话会话ID |

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "session_id": "sess_xxx",
      "history": [
        {"role": "user", "content": "你好"},
        {"role": "assistant", "content": "你好！有什么可以帮助你的？"},
        {"role": "user", "content": "如何申请建立单位最高计量标准？"},
        {"role": "assistant", "content": "申请建立单位最高计量标准需要..."}
      ]
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": "sess_xxx"
}
```

---

### 1.4 结束会话

- **DELETE** `/api/chat/model/end/{session_id}`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `session_id` | string | 对话会话ID |

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "session_id": "sess_xxx",
      "ended": true
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": "sess_xxx"
}
```

---

### 1.5 列出所有会话

- **GET** `/api/chat/model/sessions`

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "sessions": [
        {
          "id": "sess_xxx",
          "model_id": "ckpt_abc12345",
          "model_type": "causal-lm",
          "created_at": "2024-01-15T10:30:00"
        }
      ],
      "count": 1
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": ""
}
```

---

## 二、RAG 对话 (RAG Chat)

基于知识库索引的检索增强生成对话服务。

### 2.1 列出可用索引

- **GET** `/api/chat/rag/indices`

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "indices": [
        {
          "index_version": "index_20240115_001",
          "embedder": "sentence-transformers/all-MiniLM-L6-v2",
          "document_count": 1500,
          "created_at": "2024-01-15T10:00:00"
        }
      ],
      "count": 1
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": ""
}
```

---

### 2.2 启动 RAG 对话会话

- **POST** `/api/chat/rag/start`

**请求体**:
```json
{
  "index_version": "index_20240115_001",
  "embedder": "sentence-transformers/all-MiniLM-L6-v2",
  "top_k": 5,
  "system_prompt": "请基于检索到的知识回答用户问题",
  "max_history": 10
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `index_version` | string | ✅ | RAG索引版本（从 `/api/chat/rag/indices` 获取） |
| `embedder` | string | ❌ | 向量模型，默认使用索引配置的 embedder |
| `top_k` | int | ❌ | 检索返回的文档数，默认 `5`，范围 `1-20` |
| `system_prompt` | string | ❌ | 系统提示词 |
| `max_history` | int | ❌ | 保留的最大对话轮数，默认 `10`，范围 `1-50` |

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "session_id": "rag_sess_xxx",
      "index_version": "index_20240115_001",
      "embedder": "sentence-transformers/all-MiniLM-L6-v2",
      "top_k": 5,
      "system_prompt": "请基于检索到的知识回答用户问题"
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": "rag_sess_xxx"
}
```

---

### 2.3 发送问题

- **POST** `/api/chat/rag/send`

**请求体**:
```json
{
  "session_id": "rag_sess_xxx",
  "message": "如何申请建立单位最高计量标准？",
  "top_k": 5
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `session_id` | string | ✅ | RAG对话会话ID（从 `start` 接口获取） |
| `message` | string | ✅ | 用户问题 |
| `top_k` | int | ❌ | 本次检索的文档数，默认使用会话配置，范围 `1-20` |

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "response": "根据检索到的资料，申请建立单位最高计量标准需要...",
      "session_id": "rag_sess_xxx",
      "retrieved_docs": [
        {
          "content": "相关文档片段...",
          "score": 0.85,
          "source": "document_a.pdf"
        }
      ]
    },
    "confidence": 1.0,
    "sources": ["document_a.pdf"],
    "error": null
  },
  "trace_id": "rag_sess_xxx"
}
```

---

### 2.4 获取历史记录

- **GET** `/api/chat/rag/history/{session_id}`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `session_id` | string | RAG对话会话ID |

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "session_id": "rag_sess_xxx",
      "history": [
        {
          "role": "user",
          "content": "如何申请建立单位最高计量标准？",
          "sources": []
        },
        {
          "role": "assistant",
          "content": "根据检索到的资料...",
          "sources": ["document_a.pdf", "document_b.pdf"]
        }
      ]
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": "rag_sess_xxx"
}
```

---

### 2.5 结束会话

- **DELETE** `/api/chat/rag/end/{session_id}`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `session_id` | string | RAG对话会话ID |

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "session_id": "rag_sess_xxx",
      "ended": true
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": "rag_sess_xxx"
}
```

---

### 2.6 列出所有 RAG 会话

- **GET** `/api/chat/rag/sessions`

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "sessions": [
        {
          "id": "rag_sess_xxx",
          "index_version": "index_20240115_001",
          "embedder": "sentence-transformers/all-MiniLM-L6-v2",
          "top_k": 5,
          "created_at": "2024-01-15T11:00:00"
        }
      ],
      "count": 1
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": ""
}
```

---

## 三、辅助接口

### 3.1 列出已注册模型

- **GET** `/api/exec/train/model/list`

用于获取模型对话所需的 `model_id`。

**响应**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "answer": {
      "models": [
        {
          "id": "ckpt_abc12345",
          "model_uri": "file://checkpoints/ckpt_abc12345",
          "task": "chat",
          "model_type": "causal-lm",
          "note": "客服模型v1",
          "registered_at": "2024-01-15T09:00:00"
        }
      ]
    },
    "confidence": 1.0,
    "sources": [],
    "error": null
  },
  "trace_id": ""
}
```

---

## 四、错误码说明

| code | message | 说明 |
|------|---------|------|
| 0 | OK | 成功 |
| 404 | Session Not Found | 会话不存在或已过期 |
| 404 | Index Not Found | RAG索引不存在 |
| 404 | Model Not Found | 模型不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

**错误响应示例**:
```json
{
  "code": 404,
  "message": "Session Not Found",
  "data": {
    "answer": null,
    "confidence": 0.0,
    "sources": [],
    "error": "Session sess_xxx not found or expired"
  },
  "trace_id": "sess_xxx"
}
```

---

## 五、使用示例

### 5.1 模型对话完整流程

```powershell
# 1. 获取可用模型
$models = Invoke-RestMethod -Uri "http://127.0.0.1:8002/api/exec/train/model/list" -Method GET
$modelId = $models.data.answer.models[0].id

# 2. 启动会话
$startBody = @{
  model_id = $modelId
  system_prompt = "你是一个专业的客服助手"
} | ConvertTo-Json
$session = Invoke-RestMethod -Uri "http://127.0.0.1:8002/api/chat/model/start" `
  -Method POST -ContentType "application/json" -Body $startBody
$sessionId = $session.data.answer.session_id

# 3. 发送消息
$sendBody = @{
  session_id = $sessionId
  message = "你好，请问有什么服务？"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8002/api/chat/model/send" `
  -Method POST -ContentType "application/json" -Body $sendBody
Write-Host $response.data.answer.response

# 4. 获取历史
$history = Invoke-RestMethod -Uri "http://127.0.0.1:8002/api/chat/model/history/$sessionId" -Method GET

# 5. 结束会话
Invoke-RestMethod -Uri "http://127.0.0.1:8002/api/chat/model/end/$sessionId" -Method DELETE
```

### 5.2 RAG 对话完整流程

```powershell
# 1. 获取可用索引
$indices = Invoke-RestMethod -Uri "http://127.0.0.1:8002/api/chat/rag/indices" -Method GET
$indexVersion = $indices.data.answer.indices[0].index_version

# 2. 启动 RAG 会话
$startBody = @{
  index_version = $indexVersion
  top_k = 5
  system_prompt = "请基于知识库回答问题"
} | ConvertTo-Json
$session = Invoke-RestMethod -Uri "http://127.0.0.1:8002/api/chat/rag/start" `
  -Method POST -ContentType "application/json" -Body $startBody
$sessionId = $session.data.answer.session_id

# 3. 发送问题
$sendBody = @{
  session_id = $sessionId
  message = "如何申请建立单位最高计量标准？"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8002/api/chat/rag/send" `
  -Method POST -ContentType "application/json" -Body $sendBody
Write-Host $response.data.answer.response
Write-Host "引用来源:" $response.data.sources

# 4. 结束会话
Invoke-RestMethod -Uri "http://127.0.0.1:8002/api/chat/rag/end/$sessionId" -Method DELETE
```

---

## 六、接口汇总

### 模型对话 `/api/chat/model/*`

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/start` | 启动对话会话 |
| POST | `/send` | 发送消息 |
| GET | `/history/{session_id}` | 获取历史记录 |
| DELETE | `/end/{session_id}` | 结束会话 |
| GET | `/sessions` | 列出所有会话 |

### RAG 对话 `/api/chat/rag/*`

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/indices` | 列出可用索引 |
| POST | `/start` | 启动 RAG 会话 |
| POST | `/send` | 发送问题 |
| GET | `/history/{session_id}` | 获取历史记录 |
| DELETE | `/end/{session_id}` | 结束会话 |
| GET | `/sessions` | 列出所有会话 |
