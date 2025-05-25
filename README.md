# AI-Powered Apartment Intrusion Detection System

A real-time intrusion detection system that uses AI to monitor and secure apartment spaces.

## Features

- Real-time video monitoring using webcam
- AI-powered intrusion detection using Google Vertex AI
- Real-time alerts using Firebase
- User authentication and access control
- Pattern analysis using Neo4j
- Data archival using Aparavi
- Modern UI using Gemini Canvas
- Easy deployment with Toolhouse

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Google Cloud Account (for Vertex AI)
- Firebase Account
- Neo4j Database
- Aparavi Account
- Webcam access

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd apartment-intrusion-detector
```

2. Install dependencies:
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

3. Set up environment variables in `.env`:
```
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
FIREBASE_API_KEY=your_firebase_api_key
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
APARAVI_API_KEY=your_aparavi_key
```

4. Set up Neo4j database:
```cypher
// Create User node
CREATE (u:User {id: 'USER_001', name: 'Admin', role: 'admin'});

// Create AccessLog node
CREATE (log:AccessLog {id: 'LOG_001', timestamp: datetime(), status: 'granted'});

// Create relationship between User and AccessLog
MATCH (u:User {id: 'USER_001'})
MATCH (log:AccessLog {id: 'LOG_001'})
CREATE (u)-[:HAS_ACCESS]->(log);
```

## Running the Application

1. Start the backend server:
```bash
python src/backend/server.py
```

2. Start the frontend:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
apartment-intrusion-detector/
├── src/
│   ├── backend/
│   │   ├── server.py
│   │   ├── detection/
│   │   │   └── vertex_ai.py
│   │   └── database/
│   │       └── neo4j_client.py
│   ├── frontend/
│   │   ├── components/
│   │   └── pages/
│   └── utils/
├── requirements.txt
└── package.json
```

## API Endpoints

- `POST /api/detect`
  - Body: `{ image: base64_encoded_image }`
  - Returns: `{ intrusion_detected: boolean, confidence: float }`

- `POST /api/alert`
  - Body: `{ user_id: string, alert_type: string, timestamp: datetime }`
  - Returns: `{ status: string }`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
