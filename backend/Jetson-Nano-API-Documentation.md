# Jetson Nano API Documentation

本文件描述 Jetson Nano 設備與後端的通訊接口。

**架構：**

```
Edge (Jetson Nano)
  ├─ WebSocket → action events → Backend (/edge/frames)
  └─ WebRTC   → preview video  → Backend (/edge/video)
```

- Base URL: `ws://localhost:8000`
- Protocol: WebSocket (RFC 6455) / WebRTC
- Data Format: JSON / Media Stream

## 1. WebSocket /edge/frames

### Purpose

通過 WebSocket 連線接收 Jetson Nano 設備的即時姿態識別數據。設備持續傳送動作分類、骨骼座標與信心度度量至後端。

### Request

- Method: `WebSocket 握手`
- Path: `/edge/frames`
- Connection: `ws://localhost:8000/edge/frames`

### Message Format

Jetson Nano 設備發送的訊息格式：

```json
{
  "timestamp": 1712345678.12,
  "source": "jetson-01",
  "frame_id": 1523,
  "action_scores": {
    "stand": 0.1,
    "crouch": 0.82,
    "jump": 0.03,
    "background": 0.05
  },
  "stable_action": "crouch",
  "confidence": 0.82,
  "pose": {
    "points": [
      [0.512, 0.103, -0.021],
      [0.438, 0.221, -0.034],
      [0.587, 0.219, -0.031]
    ]
  },
  "skeleton_sequence": {
    "layout": "mediapipe_pose_33",
    "shape": [16, 33, 3],
    "frames": [
      [
        [0.512, 0.103, -0.021],
        [0.438, 0.221, -0.034],
        [0.587, 0.219, -0.031],
        [0.123, 0.456, 0.001],
        [0.234, 0.567, 0.002]
      ],
      [
        [0.511, 0.105, -0.022],
        [0.439, 0.224, -0.035],
        [0.588, 0.221, -0.032],
        [0.122, 0.458, 0.001],
        [0.235, 0.569, 0.002]
      ]
    ]
  }
}
```

#### 必要欄位

| 欄位                | 類型   | 說明                                 |
| ------------------- | ------ | ------------------------------------ |
| `timestamp`         | float  | Unix 時間戳記（秒.毫秒）             |
| `source`            | string | 設備識別符（Jetson Nano 序號或標籤） |
| `frame_id`          | int    | 當前幀序號（遞增）                   |
| `action_scores`     | object | 各動作類別的預測分數（0.0-1.0）      |
| `stable_action`     | string | 當前穩定判定的動作類別               |
| `confidence`        | float  | 穩定動作的信心度（0.0-1.0）          |
| `pose`              | object | 單幀姿態資料（`points` 為 33 x 3）   |
| `skeleton_sequence` | object | 骨骼序列資料                         |

#### pose 欄位

| 欄位     | 類型  | 說明                        |
| -------- | ----- | --------------------------- |
| `points` | array | 單幀關鍵點資料，固定 [33,3] |

#### skeleton_sequence 欄位

| 欄位     | 類型   | 說明                                         |
| -------- | ------ | -------------------------------------------- |
| `layout` | string | 骨骼模型版本（例如 `mediapipe_pose_33`）     |
| `shape`  | array  | [T, V, C] 表示（時幀數, 關鍵點數, 座標維度） |
| `frames` | array  | 時序骨骼數據，包含最近 T 幀                  |

**skeleton_sequence.frames 結構：**

- 二維陣列，第一維度代表幀（時序），第二維度代表關鍵點（共 V 個）
- 每個關鍵點是 3 元素陣列 `[x, y, z]`：
  - `x` (float): 標準化水平座標
  - `y` (float): 標準化垂直座標
  - `z` (float): 標準化深度座標

驗證規則：

- `pose.points` 必須為 [33, 3]
- `skeleton_sequence.shape` 必須為 [T, 33, 3]

### Success

- Status: `101` (WebSocket Upgrade)
- 連線建立後持續接收訊息

#### Server Response (per frame)

```json
{
  "success": true,
  "message": "Data received successfully",
  "frame_id": 1523,
  "processed_at": 1712345678.15
}
```

### Errors

- `Invalid JSON`: 傳送的數據格式不是有效 JSON
- `Missing required field`: 缺少必要欄位（timestamp、source、frame_id、action_scores、stable_action、skeleton_sequence）
- `Invalid action_scores`: action_scores 不是物件或分數不在 0.0-1.0 範圍
- `skeleton_sequence format error`: 骨骼序列格式不符（shape 與 frames 長度不一致，或非 [T,33,3]）
- `pose format error`: 單幀姿態格式不符（非 [33,3]）
- `Connection timeout`: 長時間無數據傳送

### Example

```javascript
const socket = new WebSocket("ws://localhost:8000/edge/frames");

socket.onopen = () => {
  console.log("Connected to Jetson edge gateway");
};

socket.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log("Frame received:", response.frame_id);
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

socket.onclose = () => {
  console.log("Disconnected from gateway");
};

// 發送訊息
const payload = {
  timestamp: Date.now() / 1000,
  source: "jetson-01",
  frame_id: 1,
  action_scores: {
    stand: 0.1,
    crouch: 0.82,
    jump: 0.03,
    background: 0.05,
  },
  stable_action: "crouch",
  confidence: 0.82,
  pose: {
    points: [
      /* 33 points of [x,y,z] */
    ],
  },
  skeleton_sequence: {
    layout: "mediapipe_pose_33",
    shape: [16, 33, 3],
    frames: [
      /* 16 frames of 33 keypoints, each keypoint is [x,y,z] */
    ],
  },
};

socket.send(JSON.stringify(payload));
```

## 2. WebRTC /edge/video

### Purpose

通過 WebRTC 建立點對點連線傳輸 Jetson Nano 攝像頭的即時影片預覽至後端。

### Request

- Method: `WebRTC Offer/Answer`
- Path: `/edge/video`
- Protocol: `ws://localhost:8000/edge/video` (Signaling Channel)

### Connection Flow

1. Jetson Nano 建立 WebRTC PeerConnection
2. 通過 Signaling Channel 交換 Offer/Answer 和 ICE Candidates
3. 建立媒體流，持續傳輸影片

### Signaling Message Format

#### Media Description (Offer from Jetson)

```json
{
  "type": "offer",
  "source": "jetson-01",
  "sdp": "v=0\r\no=- ... (WebRTC Session Description)"
}
```

#### Answer from Backend

```json
{
  "type": "answer",
  "sdp": "v=0\r\no=- ... (WebRTC Session Description)"
}
```

#### ICE Candidate Exchange

```json
{
  "type": "candidate",
  "candidate": "candidate:... (ICE Candidate)",
  "sdpMLineIndex": 0,
  "sdpMid": "0"
}
```

### Video Stream Specifications

| 項目           | 規格                  | 備註               |
| -------------- | --------------------- | ------------------ |
| **Codec**      | H.264 / VP9           | 建議 H.264         |
| **Resolution** | 1280×720 或 1920×1080 | 可根據帶寬調整     |
| **Frame Rate** | 30 fps                | 標準影片幀率       |
| **Bitrate**    | 2-5 Mbps              | 取決於解析度和品質 |
| **Latency**    | < 500ms               | 端到端延遲目標     |

### Success

- Status: `101` (WebSocket Upgrade for Signaling)
- Media Stream: 建立後持續接收影片數據

#### Server Acknowledgment

```json
{
  "success": true,
  "message": "WebRTC connection established",
  "stream_id": "stream-jetson-01-1234567890"
}
```

### Errors

- `Invalid SDP format`: Session Description Protocol 格式錯誤
- `ICE connection failed`: 無法建立 ICE 連線
- `Stream timeout`: 影片流中斷或超時
- `Unsupported codec`: 編碼器不支持

### Example (JavaScript with WebRTC API)

```javascript
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
});

const signalingSocket = new WebSocket("ws://localhost:8000/edge/video");

// 接收遠端影片流
peerConnection.ontrack = (event) => {
  console.log("Received remote stream");
  const videoElement = document.getElementById("remote-video");
  videoElement.srcObject = event.streams[0];
};

// 處理 ICE Candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    signalingSocket.send(
      JSON.stringify({
        type: "candidate",
        candidate: event.candidate.candidate,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid,
      }),
    );
  }
};

// 接收 Offer 並發送 Answer
signalingSocket.onmessage = async (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "offer") {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message),
    );

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    signalingSocket.send(
      JSON.stringify({
        type: "answer",
        sdp: answer.sdp,
      }),
    );
  } else if (message.type === "candidate") {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(message));
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }
};

// 連線事件
signalingSocket.onopen = () => {
  console.log("Signaling channel connected");
};

signalingSocket.onerror = (error) => {
  console.error("Signaling error:", error);
};
```

### Example (Python with aiortc)

```python
import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer
import websockets
import json

class JetsonVideoClient:
    def __init__(self, signaling_url: str = "ws://localhost:8000/edge/video", source: str = "jetson-01"):
        self.signaling_url = signaling_url
        self.source = source
        self.pc = RTCPeerConnection()
        self.ws = None

    async def connect(self):
        self.ws = await websockets.connect(self.signaling_url)
        print(f"Connected to signaling server")

    async def start_stream(self, video_device: str = "/dev/video0"):
        """
        開始影片串流
        Args:
            video_device: 攝像頭設備路徑（Linux）
        """
        # 添加本地影片軌道
        options = {"framerate": "30", "video_size": "1280x720"}
        player = MediaPlayer(video_device, options=options)
        self.pc.addTrack(player.video)

        # 處理 ICE Candidates
        @self.pc.on("icecandidate")
        async def on_icecandidate(candidate):
            if candidate:
                await self.ws.send(json.dumps({
                    "type": "candidate",
                    "candidate": candidate.candidate,
                    "sdpMLineIndex": candidate.sdpMLineIndex,
                    "sdpMid": candidate.sdpMid
                }))

        # 創建 Offer
        offer = await self.pc.createOffer()
        await self.pc.setLocalDescription(offer)

        await self.ws.send(json.dumps({
            "type": "offer",
            "source": self.source,
            "sdp": self.pc.localDescription.sdp
        }))

        # 接收訊息
        async for message in self.ws:
            data = json.loads(message)

            if data["type"] == "answer":
                answer = RTCSessionDescription(sdp=data["sdp"], type="answer")
                await self.pc.setRemoteDescription(answer)

            elif data["type"] == "candidate":
                candidate = RTCIceCandidate(
                    candidate=data["candidate"],
                    sdpMLineIndex=data["sdpMLineIndex"],
                    sdpMid=data["sdpMid"]
                )
                await self.pc.addIceCandidate(candidate)

    async def stop(self):
        await self.pc.close()
        if self.ws:
            await self.ws.close()

# 使用範例
async def main():
    client = JetsonVideoClient(source="jetson-01")
    await client.connect()
    await client.start_stream(video_device="/dev/video0")

if __name__ == "__main__":
    asyncio.run(main())
```
