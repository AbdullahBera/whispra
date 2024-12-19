import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const uploadFile = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/transcribe/`,
        formData
      );
      setTranscript(res.data.transcript);
    } catch (error) {
      console.error(error);
      alert('Error uploading file.');
    }
  };

  const askQuestion = async () => {
    if (!question) {
      alert('Please enter a question.');
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ask/`,
        { question }
      );
      setAnswer(res.data.answer);
    } catch (error) {
      console.error(error);
      alert('Error fetching answer.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Whispra</h1>
      <h2>Upload Audio File</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={uploadFile}>Upload & Transcribe</button>
      {transcript && (
        <>
          <h2>Transcript</h2>
          <p>{transcript}</p>
          <h2>Ask a Question</h2>
          <input
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button onClick={askQuestion}>Ask</button>
          {answer && (
            <>
              <h2>Answer</h2>
              <p>{answer}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
