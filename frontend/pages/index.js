import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/transcribe`,
      formData
    );
    setTranscript(response.data.transcript);
  };

  const handleQuestion = async () => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ask`,
      { question, context: transcript }
    );
    setAnswer(response.data.answer);
  };

  return (
    <div>
      <h1>Whispra</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Transcribe</button>
      <textarea value={transcript} readOnly />
      <input
        type="text"
        placeholder="Ask a question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleQuestion}>Ask</button>
      <p>{answer}</p>
    </div>
  );
}
